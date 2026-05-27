import pandas as pd


def get_counts(df: pd.DataFrame, column_name: str, output_key_name: str):
    if column_name not in df.columns:
        return []

    series = df[column_name].fillna("").astype(str)

    counts = series.str.split(";").explode().str.strip().value_counts()

    result_data = []
    for term, count in counts.items():
        if term and str(term).lower() not in ["nan", "n/a", ""]:
            result_data.append({output_key_name: term, "count": int(count)})
    return result_data


def count_data(df: pd.DataFrame, col: str):
    chart_data = get_counts(df, col, "label")

    return chart_data
