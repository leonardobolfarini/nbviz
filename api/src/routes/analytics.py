import os
from flask import Blueprint, jsonify, request
from werkzeug.utils import secure_filename
import nbviz_scientometric_tools as st

from src.utils.constants import LABEL_MAP
from src.utils.expections import NotImplementedYet

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route("/graph", methods=["POST"])
def get_graph_format():
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
        if graph_type not in ["coauthorship", "keywords"]:
            raise ValueError("Only coauthorship and keyword graphs are implemented.")

        if file_extension == ".txt":
            col = "AU" if graph_type == "coauthorship" else "DE"
            df = st.read_wos_file(graph_file)
        elif file_extension == ".csv":
            col = "Authors" if graph_type == "coauthorship" else "Author Keywords"
            df = st.read_scopus_file(graph_file)
        else:
            raise ValueError

        separators = [";"] if col in ["Authors", "AU"] else [";", ",", "and"]
        graph_data = st.graph_formatter(df, col, separators)

        return jsonify(graph_data)

    except ValueError as e:
        return f"File extension not supported: {str(e)}", 404
    except TypeError as e:
        return f"File extension not implemented: {str(e)}", 406
    except NotImplementedYet:
        return f"{graph_type} not implemented yet.", 406
    except Exception as e:
        return f"Error in file process: {str(e)}", 500


@analytics_bp.route("/chart_bar", methods=["POST"])
def get_chart_format():
    if "chartBarFile" not in request.files:
        return "Arquivos de entrada necessários.", 400

    chart_bar_file = request.files["chartBarFile"]
    filename = secure_filename(chart_bar_file.filename or "")
    _, file_extension = os.path.splitext(filename)
    file_extension = file_extension.lower()

    try:
        if file_extension == ".txt":
            cols = ["AU", "DE", "SO", "PY"]
            df = st.read_wos_file(chart_bar_file)
        elif file_extension == ".csv":
            cols = ["Authors", "Author Keywords", "Source title", "Year"]
            df = st.read_scopus_file(chart_bar_file)
        else:
            raise ValueError

        chart_data_return = []
        for col in cols:
            separators = [";"]
            if col in ["Author Keywords", "DE"]:
                separators = [";", ",", "and"]

            chart_data = st.get_counts(df, col, "label", separators)
            json_key = LABEL_MAP.get(col, col.lower())
            chart_data_return.append({json_key: chart_data})

        return jsonify(chart_data_return)

    except ValueError as e:
        return f"File extension not supported: {str(e)}", 404
    except Exception as e:
        return f"Error in file process: {str(e)}", 500
