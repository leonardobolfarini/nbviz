from itertools import combinations

import pandas as pd


def graph_formatter(
    df: pd.DataFrame,
    col: str,
):
    if col not in df.columns:
        raise ValueError(
            f"Coluna '{col}' não encontrada.\nColunas disponíveis: {list(df.columns)}"
        )

    df[col] = df[col].fillna("").astype(str)

    edge_weights = {}
    nodes_set = set()

    for _, row in df.iterrows():
        nodes_data = [a.strip() for a in row[col].split(";") if a.strip()]

        for data in nodes_data:
            nodes_set.add(data)

        for node1, node2 in combinations(nodes_data, 2):
            edge_key = tuple(sorted((node1, node2)))
            edge_weights[edge_key] = edge_weights.get(edge_key, 0) + 1

    nodes = []
    edges = []

    nodes = [{"data": {"id": node, "label": node}} for node in nodes_set]

    for (source, target), weight in edge_weights.items():
        edges.append(
            {
                "data": {
                    "source": source,
                    "target": target,
                    "weight": weight,
                }
            }
        )

    return {"nodes": nodes, "edges": edges}
