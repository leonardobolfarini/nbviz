import os
import uuid
from flask import Blueprint, jsonify, request, send_file
import nbviz_scientometric_tools as st

from src.utils.constants import HEADER_CSV, HEADER_TXT, WOS_TO_SCOPUS, SCOPUS_TO_WOS

files_bp = Blueprint('files', __name__)

OUTPUT_FOLDER = "outputs"

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
    if "scopusFile" not in request.files or "wosFile" not in request.files:
        return jsonify({"message": "Arquivos de entrada necessários."}), 400

    scopus_file = request.files["scopusFile"]
    wos_file = request.files["wosFile"]

    requisition_id = str(uuid.uuid4())
    csv_name = f"all_in_one_{requisition_id}.csv"
    txt_name = f"all_in_one_{requisition_id}.txt"
    output_csv = os.path.join(OUTPUT_FOLDER, csv_name)
    output_txt = os.path.join(OUTPUT_FOLDER, txt_name)

    try:
        scopus_df = st.read_scopus_file(scopus_file.read())
        wos_df = st.read_wos_file(wos_file)

        existing_columns = [col for col, _ in HEADER_CSV if col in scopus_df.columns]
        scopus_df = scopus_df.select(existing_columns)

        scopus_df = st.keep_columns(scopus_df, HEADER_CSV)
        wos_df = st.keep_columns(wos_df, HEADER_TXT)

        processed_scopus_df = st.process_scopus_data(scopus_df, HEADER_CSV)
        processed_wos_df = st.process_wos_data(wos_df, HEADER_TXT)

        merged_csv_data = st.merge_and_process(
            processed_scopus_df,
            processed_wos_df,
            WOS_TO_SCOPUS,
            ["Title", "Year"],
        )

        merged_txt_data = merged_csv_data.rename(SCOPUS_TO_WOS)

        merged_csv_data.write_csv(
            output_csv,
            separator=",",
            quote_char='"',
            quote_style="always",
        )
        merged_txt_data.write_csv(output_txt, separator="\t")

        return jsonify({
            "csv": {
                'download_url': f'/download/{csv_name}',
                'file_name': csv_name
            },
            "txt": {
                'download_url': f'/download/{txt_name}',
                'file_name': txt_name
            },
        })

    except Exception as e:
        return jsonify({ "message": f"Erro ao unir arquivos: {str(e)}" }), 500
