import csv

import pandas as pd
from unidecode import unidecode


def keep_columns(
    df: pd.DataFrame, columns_to_keep: list[tuple[str, int]]
) -> pd.DataFrame:
    existing_columns = [col for col, _ in columns_to_keep if col in df.columns]
    df = df[existing_columns].copy()

    for col in df.select_dtypes(include=["object"]):
        df.loc[:, col] = (
            df[col]
            .astype(str)
            .str.lower()
            .str.strip()
            .replace({"nan": pd.NA, "": pd.NA})
        )

    return df


def article_formatter(artigos: list[str]) -> str:
    article_formatted = []
    for artigo in artigos:
        parts = artigo.split(",")

        authors = parts[0].split(";", 1) if len(parts) > 0 else ""
        year = parts[-1].replace("(", "").replace(")", "") if len(parts) > 1 else ""
        other_infos = ", ".join(parts[1:-1]).strip() if len(parts) > 2 else ""

        formatted = f"{authors[0].replace('.', '')}, {year}, {other_infos}"
        article_formatted.append(formatted)

    return "; ".join(article_formatted)


def process_wos_data(df: pd.DataFrame, header: list[tuple[str, int]]) -> pd.DataFrame:
    for column, new_index in header:
        if column in df:
            replaced_column_data = df.pop(column)
        else:
            replaced_column_data = pd.Series([pd.NA] * len(df))

        df.insert(new_index, column, replaced_column_data)

    if "AU" in df.columns:
        df.loc[:, "AU"] = df["AU"].apply(
            lambda x: (
                "; ".join(
                    [
                        " ".join(
                            [
                                f"{word[0]}.{word[1:]}"
                                if len(word) == 2 and word.isupper()
                                else word
                                for word in name.split()
                            ]
                        )
                        + "."
                        if "," in name
                        else name
                        for name in x.split(";")
                    ]
                )
                if pd.notna(x)
                else x
            )
        )
        df.loc[:, "AU"] = df["AU"].apply(
            lambda x: x.replace(",", "") if pd.notna(x) else x
        )

    return df


def process_scopus_data(
    df: pd.DataFrame, header: list[tuple[str, int]]
) -> pd.DataFrame:
    for column, new_index in header:
        if column in df:
            replaced_column_data = df.pop(column)
        else:
            replaced_column_data = pd.Series([pd.NA] * len(df))

        df.insert(new_index, column, replaced_column_data)

    if "Abstract" in df.columns:
        df.loc[:, "Abstract"] = df["Abstract"].replace("[no abstract available]", pd.NA)

        df.loc[:, "Abstract"] = df["Abstract"].apply(
            lambda x: (
                unidecode(x).replace('"', "").lower().strip() if pd.notna(x) else x
            )
        )

    if "References" in df.columns:
        df["References"] = df["References"].apply(
            lambda x: article_formatter(x.split(");")) if pd.notna(x) else x
        )

    return df


def merge_and_process(
    df_target: pd.DataFrame, df_visitor: pd.DataFrame, mapping: dict, subset_cols: list
) -> pd.DataFrame:
    visitor_standardized = df_visitor.rename(columns=mapping)

    df = pd.concat([df_target, visitor_standardized], ignore_index=True)

    doi_col = next(
        (
            c
            for c in ["DOI", "DI", "Authors", "AU"]
            if c in df.columns and ("doi" in c.lower() or "di" in c.lower())
        ),
        None,
    )

    if doi_col:
        mask_duplicates = df.duplicated(subset=doi_col)
        mask_na_values = df[doi_col].isna() | (df[doi_col] == "n/a")
        mask_to_keep = ~mask_duplicates | mask_na_values
        df = df[mask_to_keep]

    df = df.drop_duplicates(subset=subset_cols, keep="first")

    df = df.fillna("N/A")

    return df
