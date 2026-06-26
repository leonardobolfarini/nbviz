import os
import uuid
import zipfile
from io import BytesIO

import polars as pl
from flask import Flask, jsonify, make_response, request, send_file
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
        ("References", 7),
    ]

    header_txt = [
        ("AU", 0),
        ("TI", 1),
        ("PY", 2),
        ("SO", 3),
        ("DI", 4),
        ("AB", 5),
        ("DE", 6),
        ("CR", 7),
    ]

    wos_to_scopus = {
        "AU": "Authors",
        "TI": "Title",
        "PY": "Year",
        "SO": "Source title",
        "DI": "DOI",
        "AB": "Abstract",
        "DE": "Author Keywords",
        "CR": "References",
    }

    scopus_to_wos = {v: k for k, v in wos_to_scopus.items()}

    try:
        scopus_df = pl.read_csv(
            BytesIO(scopus_file.read()),
            separator=",",
            ignore_errors=True,
            infer_schema=False,
            encoding="latin1",
        )
        wos_df = pl.read_csv(
            BytesIO(wos_file.read()),
            separator="\t",
            quote_char=None,
            ignore_errors=True,
            infer_schema=False,
            encoding="latin1",
        )

        existing_columns = [col for col, _ in header_csv if col in scopus_df.columns]
        scopus_df = scopus_df.select(existing_columns)

        scopus_df = st.keep_columns(scopus_df, header_csv)
        wos_df = st.keep_columns(wos_df, header_txt)

        processed_scopus_df = st.process_scopus_data(scopus_df, header_csv)
        processed_wos_df = st.process_wos_data(wos_df, header_txt)

        merged_csv_data = st.merge_and_process(
            processed_scopus_df,
            processed_wos_df,
            wos_to_scopus,
            ["Title", "Year"],
        )

        merged_txt_data = merged_csv_data.rename(scopus_to_wos)

        merged_csv_data.write_csv(
            output_csv,
            separator=",",
            quote_char='"',
            quote_style="always",
        )

        merged_txt_data.write_csv(output_txt, separator="\t")

        id = uuid.uuid4()

        with zipfile.ZipFile(zip_path, "w") as zipf:
            zipf.write(output_csv, arcname=f"all_in_one_{id}.csv")
            zipf.write(output_txt, arcname=f"all_in_one_{id}.txt")

        with open(zip_path, "rb") as f:
            data = BytesIO(f.read())

        return send_file(
            data,
            download_name=f"resultados_{id}.zip",
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
            raise ValueError("Only coauthorship and keyword graphs are implemented.")

        if file_extension == ".txt":
            col = "AU" if graph_type == "coauthorship" else "DE"
            df = pl.read_csv(
                BytesIO(graph_file.read()),
                separator="\t",
                quote_char=None,
                ignore_errors=True,
                infer_schema=False,
                encoding="latin1",
            )

        elif file_extension == ".csv":
            col = "Authors" if graph_type == "coauthorship" else "Author Keywords"
            df = pl.read_csv(
                BytesIO(graph_file.read()),
                separator=",",
                ignore_errors=True,
                infer_schema=False,
                encoding="latin1",
            )
        else:
            raise ValueError

        separators = [";"] if (col == "Authors" or col == "AU") else [";", ",", "and"]

        graph_data = st.graph_formatter(df, col, separators)

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
            df = pl.read_csv(
                BytesIO(chart_bar_file.read()),
                separator="\t",
                quote_char=None,
                ignore_errors=True,
                infer_schema=False,
                encoding="latin1",
            )
        elif file_extension == ".csv":
            cols = ["Authors", "Author Keywords", "Source title", "Year"]
            df = pl.read_csv(
                BytesIO(chart_bar_file.read()),
                separator=",",
                ignore_errors=True,
                infer_schema=False,
                encoding="latin1",
            )

        else:
            raise ValueError

        chart_data_return = []
        for col in cols:
            separators = [";"]
            if col == "Author Keywords" or col == "DE":
                separators = [";", ",", "and"]
                print(separators)
            chart_data = st.get_counts(df, col, "label", separators)

            json_key = label_map.get(col, col.lower())

            chart_data_return.append({json_key: chart_data})

        return jsonify(chart_data_return)

    except ValueError as e:
        return f"File extension not supported: {str(e)}", 404
    except Exception as e:
        return f"Error in file process: {str(e)}", 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5009, debug=True)
