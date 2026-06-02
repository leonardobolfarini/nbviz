import csv
import io
import os
import uuid
import zipfile

import pandas as pd
from flask import Flask, make_response, request, send_file
from flask_cors import CORS
from utils.expections import NotImplementedYet
from werkzeug.utils import secure_filename

import nbviz_scientometric_tools as st

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
OUTPUT_FOLDER = "outputs"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)


@app.route("/process", methods=["Options", "Post"])
def process_files():
    if request.method == "OPTIONS":
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type")
        return response

    if "scopusFile" not in request.files or "wosFile" not in request.files:
        return "Arquivos de entrada necessários.", 400

    scopus_file = request.files["scopusFile"]
    wos_file = request.files["wosFile"]
    requisition_id = str(uuid.uuid4())
    output_csv = os.path.join(OUTPUT_FOLDER, f"all_in_one_{requisition_id}.csv")
    output_txt = os.path.join(OUTPUT_FOLDER, f"all_in_one_{requisition_id}.txt")
    zip_path = os.path.join(OUTPUT_FOLDER, f"resultados_{requisition_id}.zip")

    header_csv = [
        ("Authors", 0),
        ("Title", 1),
        ("Year", 2),
        ("Source title", 3),
        ("DOI", 4),
        ("Abstract", 5),
        ("Author Keywords", 6),
    ]

    header_txt = [
        ("AU", 0),
        ("TI", 1),
        ("PY", 2),
        ("SO", 3),
        ("DI", 4),
        ("AB", 5),
        ("DE", 6),
    ]

    wos_to_scopus = {
        "AU": "Authors",
        "TI": "Title",
        "PY": "Year",
        "SO": "Source title",
        "DI": "DOI",
        "AB": "Abstract",
        "DE": "Author Keywords",
    }

    scopus_to_wos = {v: k for k, v in wos_to_scopus.items()}

    try:
        wos_df = pd.read_csv(
            wos_file,
            sep="\t",
            quoting=csv.QUOTE_NONE,
            on_bad_lines="skip",
            dtype=str,
            encoding="utf-8-sig",
            encoding_errors="replace",
        )
        scopus_df = pd.read_csv(
            scopus_file,
            sep=",",
            on_bad_lines="skip",
            dtype=str,
            encoding="utf-8-sig",
            encoding_errors="replace",
        )

        wos_df = st.keep_columns(wos_df, header_txt)
        scopus_df = st.keep_columns(scopus_df, header_csv)

        processed_wos_df = st.process_wos_data(wos_df, header_txt)
        processed_scopus_df = st.process_scopus_data(scopus_df, header_csv)

        merged_csv_data = st.merge_and_process(
            processed_scopus_df,
            processed_wos_df,
            wos_to_scopus,
            ["Title", "Year"],
        )
        merged_txt_data = st.merge_and_process(
            processed_wos_df, processed_scopus_df, scopus_to_wos, ["TI", "PY"]
        )

        print(merged_csv_data.describe())

        merged_csv_data.to_csv(
            output_csv, sep=",", quotechar='"', quoting=csv.QUOTE_ALL, index=False
        )

        merged_txt_data.to_csv(output_txt, sep="\t", index=False)

        with zipfile.ZipFile(zip_path, "w") as zipf:
            zipf.write(output_csv, arcname="all_in_one.csv")
            zipf.write(output_txt, arcname="all_in_one.txt")

        with open(zip_path, "rb") as f:
            data = io.BytesIO(f.read())

        return send_file(
            data,
            download_name=f"resultados_{uuid.uuid4()}.zip",
            as_attachment=True,
            mimetype="application/zip",
        )

    except Exception as e:
        return f"Erro ao unir arquivos: {str(e)}", 500

    finally:
        files_to_remove = [output_csv, output_txt, zip_path]

        for f in files_to_remove:
            if os.path.exists(f):
                os.remove(f)


@app.route("/graph", methods=["Options", "Post"])
def get_graph_format():
    if request.method == "OPTIONS":
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type")
        return response

    if "graphFile" not in request.files:
        return "Arquivos de entrada necessários.", 400

    if "graphType" not in request.form:
        return "Tipo de grafo não selecionado.", 400

    graph_file = request.files["graphFile"]
    graph_type = request.form.get("graphType")

    filename = secure_filename(graph_file.filename or "")
    _, file_extension = os.path.splitext(filename)
    file_extension = file_extension.lower()

    try:
        if (graph_type != "coauthorship") and (graph_type != "keywords"):
            raise NotImplementedYet
        if file_extension == ".txt":
            col = "AU" if graph_type == "coauthorship" else "DE"
            df = pd.read_csv(
                graph_file,
                sep="\t",
                index_col=False,
                on_bad_lines="skip",
                encoding="utf-8-sig",
                encoding_errors="replace",
            )
        elif file_extension == ".csv":
            col = "Authors" if graph_type == "coauthorship" else "Author Keywords"
            df = pd.read_csv(
                graph_file,
                sep=",",
                index_col=False,
                on_bad_lines="skip",
                encoding="utf-8-sig",
                encoding_errors="replace",
            )
        else:
            raise ValueError

        graph_data = st.graph_formatter(df, col)

        return graph_data
    except ValueError as e:
        return f"File extension not supported: {str(e)}", 404
    except TypeError as e:
        return f"File extension not implemented: {str(e)}", 406
    except NotImplementedYet:
        return f"{graph_type} not implemented yet.", 406
    except Exception as e:
        return f"Error in file process: {str(e)}", 500


@app.route("/chart_bar", methods=["Options", "Post"])
def get_chart_format():
    if request.method == "OPTIONS":
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type")
        return response

    if "chartBarFile" not in request.files:
        return "Arquivos de entrada necessários.", 400

    chart_bar_file = request.files["chartBarFile"]

    filename = secure_filename(chart_bar_file.filename or "")
    _, file_extension = os.path.splitext(filename)
    file_extension = file_extension.lower()

    label_map = {
        "AU": "authors",
        "Authors": "authors",
        "DE": "keywords",
        "Author Keywords": "keywords",
        "SO": "sources",
        "Source title": "sources",
        "PY": "years",
        "Year": "years",
    }

    try:
        if file_extension == ".txt":
            cols = ["AU", "DE", "SO", "PY"]
            df = pd.read_csv(
                chart_bar_file,
                sep="\t",
                index_col=False,
                on_bad_lines="skip",
                encoding="utf-8-sig",
                encoding_errors="replace",
            )
        elif file_extension == ".csv":
            cols = ["Authors", "Author Keywords", "Source title", "Year"]
            df = pd.read_csv(
                chart_bar_file,
                sep=",",
                index_col=False,
                on_bad_lines="skip",
                encoding="utf-8-sig",
                encoding_errors="replace",
            )

        else:
            raise ValueError

        chart_data_return = []
        for col in cols:
            chart_data = st.count_data(df, col)

            json_key = label_map.get(col, col.lower())

            chart_data_return.append({json_key: chart_data})

        return chart_data_return

    except ValueError as e:
        return f"File extension not supported: {str(e)}", 404
    except Exception as e:
        return f"Error in file process: {str(e)}", 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5009, debug=True)
