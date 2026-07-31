import os
import uuid

from dotenv import load_dotenv
from flask import Blueprint, jsonify, request, send_file
from src.utils.constants import (
    HEADER_SCOPUS,
    HEADER_WOS,
    OPENALEX_TO_SCOPUS,
    OUTPUT_FOLDER,
    WOS_TO_SCOPUS,
)
from src.utils.expections import OutputFormatNotPassed

import nbviz_scientometric_tools as st

load_dotenv()
files_bp = Blueprint('files', __name__)

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
        return jsonify({"message": "O parâmetro 'files' é requerido no corpo da requisição."}), 400

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

    return jsonify({
        "download_url": f"/download/{file_name}",
        "file_name": file_name,
    })

@files_bp.route("/process", methods=["POST"])
def process_files():
    scopus_file = request.files.get("scopusFile")
    wos_file = request.files.get("wosFile")
    openalex_search = request.form.get("searchTerm")
    output_format = request.form.get("outputFormat")
    limit = request.form.get("limit", type=int)

    openalex_key = os.getenv("OPENALEX_API_KEY")
    dfs_to_concat = []

    if not output_format:
        raise OutputFormatNotPassed('The property "outputFormat" is required to generate the output.')

    if scopus_file:
        scopus_df = st.read_scopus_file(scopus_file.read())
        scopus_df = st.keep_columns(scopus_df, HEADER_SCOPUS)
        processed_scopus_df = st.process_scopus_data(scopus_df, HEADER_SCOPUS)
        dfs_to_concat.append(processed_scopus_df)

    if wos_file:
        wos_df = st.read_wos_file(wos_file)
        wos_df = st.keep_columns(wos_df, HEADER_WOS)
        processed_wos_df = st.process_wos_data(wos_df, HEADER_WOS)
        processed_wos_df = processed_wos_df.rename(WOS_TO_SCOPUS)
        dfs_to_concat.append(processed_wos_df)


    if openalex_search:
        processed_oa_df = st.fetch_openalex_works(openalex_search, openalex_key, limit=limit)
        processed_oa_df = processed_oa_df.rename(OPENALEX_TO_SCOPUS)
        dfs_to_concat.append(processed_oa_df)

    if len(dfs_to_concat) <= 1:
        return jsonify({
            "message": "Is required two or more databases to realize the concatenation."
        }), 400

    if output_format == 'scopus' or output_format == 'openalex':
        configs = {
            'separator': ",",
            'quote_char': '"',
            'quote_style': "always",
        }
    elif output_format == 'wos':
        configs = {
            'separator': "\t"
        }
    else:
        configs = {}

    output_extension = 'csv' if output_format == 'scopus' or output_format == 'openalex' else 'txt'
    requisition_id = str(uuid.uuid4())

    output_name = f"all_in_one_{requisition_id}.{output_extension}"
    output = os.path.join(OUTPUT_FOLDER, output_name)

    try:
        merged_data = st.merge_and_process(
            dfs_to_concat,
            ["Title", "Year"],
        )

        merged_data.write_csv(output, **configs)

        return jsonify({
            'download_url': f'/download/{output_name}',
            'file_name': output_name
        })

    except Exception as e:
        return jsonify({ "message": f"Error trying to concat the files: {str(e)}" }), 500
