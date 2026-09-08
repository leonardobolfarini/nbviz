from io import BytesIO

import polars as pl


def wos_authors_name_format(name: str) -> str:
    parts = name.strip().split(",", 1)

    if len(parts) == 2:
        surname, initials = parts[0].strip(), parts[1].strip()
        formatted_initials = " ".join(f"{c}." for c in initials if c.isalpha())

        return f"{surname} {formatted_initials}"
    return name.strip()


def wos_authors_field_format(value: str) -> str:
    if value is None:
        return None
    return "; ".join(wos_authors_name_format(name) for name in value.split(";"))


def read_scopus_file(file) -> pl.DataFrame:
    if hasattr(file, "read"):
        file = BytesIO(file.read())

    return pl.read_csv(
        file,
        separator=",",
        ignore_errors=True,
        infer_schema=False,
        encoding="utf-8-sig",
    )


def read_wos_file(file) -> pl.DataFrame:
    if hasattr(file, "read"):
        file = BytesIO(file.read())

    return pl.read_csv(
        file,
        separator="\t",
        quote_char=None,
        ignore_errors=True,
        infer_schema=False,
        encoding="utf-8-sig",
    )


def keep_columns(
    df: pl.DataFrame, columns_to_keep: list[tuple[str, int]]
) -> pl.DataFrame:
    existing_columns = [col for col, _ in columns_to_keep if col in df.columns]
    df = df.select(existing_columns).with_columns(
        pl.all()
        .cast(pl.String)
        .str.strip_chars()
        .str.to_lowercase()
        .replace({"nan": None, "": None})
    )

    return df


def process_wos_data(df: pl.DataFrame, header: list[tuple[str, int]]) -> pl.DataFrame:
    expressions = []
    for column, _ in header:
        if column in df.columns:
            expressions.append(pl.col(column))
        else:
            expressions.append(pl.lit(None).cast(pl.String).alias(column))

    df = df.select(expressions)

    return df.with_columns(
        pl.col("AU")
        .str.replace_all('"', "")
        .map_elements(wos_authors_field_format, return_dtype=pl.String),
        pl.col("CR").str.replace_all('"', ""),
        pl.col("DE").str.replace_all('"', ""),
        pl.lit("wos").alias("_database"),
    )


def process_scopus_data(
    df: pl.DataFrame, header: list[tuple[str, int]]
) -> pl.DataFrame:
    expressions = []
    for column, _ in header:
        if column in df.columns:
            expressions.append(pl.col(column))
        else:
            expressions.append(pl.lit(None).cast(pl.String).alias(column))

    df = df.select(expressions)

    parts = pl.element().str.split(by=",")

    authors = parts.list.get(0).str.split(";").list.get(0).str.replace_all(r"\.", "")
    year = parts.list.get(-1).str.replace_all(r"\(|\)", "")
    other_infos = (
        parts.list.slice(1, parts.list.len() - 2).list.join(", ").str.strip_chars()
    )

    return df.with_columns(
        pl.col("Abstract")
        .replace("[no abstract available]", None)
        .str.replace_all('"', "")
        .str.to_lowercase()
        .str.strip_chars(),
        pl.col("References")
        .str.split(by=");")
        .list.eval(authors + ", " + year + ", " + other_infos)
        .list.join("; "),
        pl.lit("scopus").alias("_database"),
    )


def merge_same_database(lazyframes: list[pl.LazyFrame]) -> pl.LazyFrame:
    if not lazyframes:
        return pl.LazyFrame()

    df_concat = pl.concat(lazyframes, how="diagonal")

    return df_concat


def merge_and_process(
    dfs_to_concat: list[pl.DataFrame], subset_cols: list
) -> tuple[pl.DataFrame, pl.DataFrame, pl.DataFrame]:
    df = pl.concat(dfs_to_concat).with_row_index("_row_id")

    doi_normalized = (
        pl.col("DOI")
        .fill_null("")
        .str.to_lowercase()
        .str.strip_chars()
        .str.replace(r"^https?://(dx\.)?doi\.org/", "")
    )
    df = df.with_columns(doi_normalized.alias("_normalized_doi"))

    doi_databases = (
        df.filter(pl.col("_normalized_doi") != "")
        .group_by("_normalized_doi")
        .agg(pl.col("_database").unique().sort().alias("_databases"))
    )

    with_doi = df.filter(pl.col("_normalized_doi") != "").unique(
        subset=["_normalized_doi"]
    ).join(doi_databases, on="_normalized_doi", how="left")

    without_doi = df.filter(pl.col("_normalized_doi") == "").with_columns(
        pl.concat_list([pl.col("_database")]).alias("_databases")
    )

    candidates = pl.concat([with_doi, without_doi])

    df_for_venn = (
        candidates.explode("_databases")
        .group_by(["Title", "Year"])
        .agg(pl.col("_databases").unique().sort().alias("_databases"))
        .with_columns(pl.col("_databases").list.join("+").alias("combination"))
        .group_by("combination")
        .agg(pl.len().alias("count"))
        .sort("combination")
    )

    df_final = candidates.unique(
        subset=subset_cols, keep="first"
    )

    df_removed = df.join(df_final.select("_row_id"), on="_row_id", how="anti")

    return (
        df_final.drop(["_row_id", "_database", "_normalized_doi", "_databases"]),
        df_removed.drop(["_row_id", "_database", "_normalized_doi"]),
        df_for_venn,
    )
