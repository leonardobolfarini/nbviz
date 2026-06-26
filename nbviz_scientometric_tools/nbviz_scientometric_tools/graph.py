from itertools import combinations

import polars as pl


def graph_formatter(df: pl.DataFrame, column_name: str, separators: list[str] = [";"]):
    if column_name not in df.columns:
        raise ValueError(
            f"Coluna '{column_name}' não encontrada.\nColunas disponíveis: {list(df.columns)}"
        )

    rows = df[column_name].fill_null("")

    for sep in separators:
        rows = rows.str.replace_all(sep, ";")

    rows = rows.str.split(";").to_list()

    edge_weights = {}
    nodes_set = set()

    for nodes_data in rows:
        nodes_data = [n.strip() for n in nodes_data if n.strip()]
        nodes_set.update(nodes_data)

        for node1, node2 in combinations(nodes_data, 2):
            edge_key = tuple(sorted((node1, node2)))
            edge_weights[edge_key] = edge_weights.get(edge_key, 0) + 1

    nodes = [{"data": {"id": node, "label": node}} for node in nodes_set]
    edges = [
        {"data": {"source": source, "target": target, "weight": weight}}
        for (source, target), weight in edge_weights.items()
    ]

    return {"nodes": nodes, "edges": edges}
