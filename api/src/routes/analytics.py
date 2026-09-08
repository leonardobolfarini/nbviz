import os
import uuid

from flask import Blueprint, jsonify, request
from src.utils.constants import LABEL_MAP, OUTPUT_FOLDER
from src.utils.expections import NotImplementedYet
from werkzeug.utils import secure_filename

import nbviz_scientometric_tools as st

analytics_bp = Blueprint("analytics", __name__)

MAX_RENDER_NODES = 5_000
MAX_RENDER_EDGES = 12_000


def save_pajek_graph(graph_data, graph_type):
    file_name = f"rede_{graph_type}_{uuid.uuid4()}.net"
    output = os.path.join(OUTPUT_FOLDER, file_name)
    node_map = {}

    with open(output, "w", encoding="utf-8", newline="\n") as graph_file:
        graph_file.write(f"*Vertices {len(graph_data['nodes'])}\n")
        for index, node in enumerate(graph_data["nodes"], start=1):
            data = node["data"]
            node_id = data["id"]
            node_map[node_id] = index
            label = str(data.get("label", node_id)).replace('"', "'")
            graph_file.write(f'{index} "{label}"\n')

        graph_file.write("*Edges\n")
        for edge in graph_data["edges"]:
            data = edge["data"]
            source = node_map.get(data["source"])
            target = node_map.get(data["target"])
            if source and target:
                graph_file.write(f"{source} {target} {data.get('weight', 1)}\n")

    return file_name


def compact_graph_for_rendering(graph_data):
    nodes = graph_data["nodes"]
    edges = graph_data["edges"]
    original = {"nodes": len(nodes), "edges": len(edges)}

    if len(nodes) <= MAX_RENDER_NODES and len(edges) <= MAX_RENDER_EDGES:
        graph_data["meta"] = {
            "original": original,
            "displayed": original,
            "simplified": False,
        }
        return graph_data

    weighted_degree = {}
    for edge in edges:
        data = edge["data"]
        weight = data.get("weight", 1)
        weighted_degree[data["source"]] = (
            weighted_degree.get(data["source"], 0) + weight
        )
        weighted_degree[data["target"]] = (
            weighted_degree.get(data["target"], 0) + weight
        )

    selected_ids = {
        node_id
        for node_id, _ in sorted(
            weighted_degree.items(), key=lambda item: (-item[1], item[0])
        )[:MAX_RENDER_NODES]
    }
    selected_edges = [
        edge
        for edge in edges
        if edge["data"]["source"] in selected_ids
        and edge["data"]["target"] in selected_ids
    ]
    selected_edges.sort(
        key=lambda edge: (
            -edge["data"].get("weight", 1),
            edge["data"]["source"],
            edge["data"]["target"],
        )
    )
    selected_edges = selected_edges[:MAX_RENDER_EDGES]
    visible_ids = {
        node_id
        for edge in selected_edges
        for node_id in (edge["data"]["source"], edge["data"]["target"])
    }
    selected_nodes = [node for node in nodes if node["data"]["id"] in visible_ids]

    return {
        "nodes": selected_nodes,
        "edges": selected_edges,
        "meta": {
            "original": original,
            "displayed": {"nodes": len(selected_nodes), "edges": len(selected_edges)},
            "simplified": True,
        },
    }


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
        complete_graph = st.graph_formatter(df, col, separators)
        file_name = save_pajek_graph(complete_graph, graph_type)
        preview_graph = compact_graph_for_rendering(complete_graph)
        preview_graph["download_url"] = f"/download/{file_name}"
        preview_graph["file_name"] = file_name

        return jsonify(preview_graph)

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
