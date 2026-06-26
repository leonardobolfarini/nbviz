import polars as pl


def get_counts(
    df: pl.DataFrame,
    column_name: str,
    output_key_name: str,
    separators: list[str] = [";"],
) -> list[dict[str, int]]:
    if column_name not in df.columns:
        return []

    series = df[column_name].fill_null("")

    for sep in separators:
        series = series.str.replace_all(sep, ";")

    counts = (
        series.str.split(";")
        .explode()
        .str.strip_chars()
        .value_counts()
        .filter(
            pl.col(column_name).is_not_null()
            & pl.col(column_name).str.to_lowercase().is_in(["nan", "n/a", ""]).not_()
        )
    )

    return counts.rename({column_name: output_key_name}).to_dicts()
