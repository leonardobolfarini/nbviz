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
        encoding="latin1",
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
        encoding="latin1",
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
    )


def merge_and_process(
    df_target: pl.DataFrame, df_visitor: pl.DataFrame, mapping: dict, subset_cols: list
) -> pl.DataFrame:
    visitor_standardized = df_visitor.rename(mapping)

    df = pl.concat([df_target, visitor_standardized])

    with_doi = df.filter(pl.col("DOI").is_not_null()).unique(subset=["DOI"])
    without_doi = df.filter(pl.col("DOI").is_null())
    df = pl.concat([with_doi, without_doi]).unique(subset=subset_cols, keep="first")

    return df
