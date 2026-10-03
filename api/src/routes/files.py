import os
import shutil
import uuid
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
from flask import Blueprint, jsonify, request, send_file
from flask_jwt_extended import get_jwt_identity, jwt_required
from src.extensions.database import db
from src.extensions.queue import processing_queue
from src.models.users import Analyses, Users
from src.utils.constants import (
    INPUT_FOLDER,
    OUTPUT_FOLDER,
)
from src.utils.expections import OutputFormatNotPassed

import nbviz_scientometric_tools as st

load_dotenv()
files_bp = Blueprint("files", __name__)


@files_bp.route("/analyses/<analysis_id>", methods=["GET"])
@jwt_required()
def get_analysis(analysis_id):
    current_user = get_jwt_identity()
    user = db.session.scalars(db.select(Users).where(Users.email == current_user)).one()

    try:
        analyse = db.session.get(Analyses, uuid.UUID(analysis_id))
    except ValueError:
        return jsonify({"message": "Invalid analysis id."}), 400

    if analyse is None or analyse.user_id != user.id:
        return jsonify({"message": "Analysis not found."}), 404

    return jsonify(analyse.to_dict())


@files_bp.route("/download/<file_name>", methods=["GET"])
def download_file(file_name):
    path = os.path.join(OUTPUT_FOLDER, file_name)
    if not os.path.exists(path):
        return jsonify({"message": "Arquivo não encontrado ou expirado."}), 404

    resp = send_file(path, as_attachment=True, download_name=file_name)
    resp.headers.add("Access-Control-Expose-Headers", "Content-Disposition")
    return resp


@files_bp.route("/unify_files", methods=["POST"])
def merge_same_base_files():
    if "files" not in request.files:
        return jsonify(
            {"message": "O parâmetro 'files' é requerido no corpo da requisição."}
        ), 400

    files = request.files.getlist("files")
    database = request.form.get("databaseType")

    if database == "wos":
        dfs = [st.read_wos_file(f) for f in files]
        file_name = f"wos_concat_{uuid.uuid4()}.txt"
        configs = {"separator": "\t"}
    elif database == "scopus":
        dfs = [st.read_scopus_file(f) for f in files]
        file_name = f"scopus_concat_{uuid.uuid4()}.csv"
        configs = {"separator": ","}
    else:
        return jsonify({"message": "Not implemented yet."}), 500

    output = os.path.join(OUTPUT_FOLDER, file_name)
    lazyframes = [df.lazy() for df in dfs]
    concat = st.merge_same_database(lazyframes)
    concat.sink_csv(output, **configs)

    return jsonify(
        {
            "download_url": f"/download/{file_name}",
            "file_name": file_name,
        }
    )


@files_bp.route("/process", methods=["POST"])
@jwt_required()
def process_files():
    current_user = get_jwt_identity()
    user = db.session.scalars(db.select(Users).where(Users.email == current_user)).one()

    scopus_file = request.files.get("scopusFile")
    wos_file = request.files.get("wosFile")
    openalex_search = request.form.get("searchTerm")
    output_format = request.form.get("outputFormat")
    limit = request.form.get("limit", type=int)

    if not output_format:
        raise OutputFormatNotPassed(
            'The property "outputFormat" is required to generate the output.'
        )
    if output_format not in {"scopus", "openalex", "wos"}:
        return jsonify({"message": "Unsupported output format."}), 400

    source_count = sum(
        bool(source) for source in (scopus_file, wos_file, openalex_search)
    )
    if source_count <= 1:
        return jsonify(
            {
                "message": "Is required two or more databases to realize the concatenation."
            }
        ), 400

    analyse = None
    input_folder = None
    try:
        analyse = Analyses(
            expires_at=datetime.now(timezone.utc) + timedelta(hours=3),
            user_id=user.id,
        )
        db.session.add(analyse)
        db.session.commit()

        input_folder = os.path.join(INPUT_FOLDER, str(analyse.id))
        os.makedirs(input_folder, exist_ok=True)

        scopus_path = None
        if scopus_file:
            scopus_path = os.path.join(input_folder, "scopus")
            scopus_file.save(scopus_path)

        wos_path = None
        if wos_file:
            wos_path = os.path.join(input_folder, "wos")
            wos_file.save(wos_path)

        job = processing_queue.enqueue(
            "src.tasks.processing.process_analysis",
            str(analyse.id),
            scopus_path,
            wos_path,
            openalex_search,
            output_format,
            limit,
            input_folder,
        )
        return jsonify(
            {
                "id": str(analyse.id),
                "job_id": job.id,
                "status": analyse.status,
            }
        ), 202

    except Exception as e:
        db.session.rollback()
        if analyse is not None:
            failed_analysis = db.session.get(Analyses, analyse.id)
            if failed_analysis is not None:
                failed_analysis.status = "error"
                db.session.commit()
        if input_folder:
            shutil.rmtree(input_folder, ignore_errors=True)
        return jsonify({"message": f"Error trying to concat the files: {str(e)}"}), 500
