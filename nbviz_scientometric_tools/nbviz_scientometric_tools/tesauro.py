import polars as pl

from nbviz_scientometric_tools.analysis import read_scopus_file, read_wos_file


def read_tesauro(file) -> dict[str, str]:
    content = file.read().decode("utf-8-sig")
    subs = {}

    if not content.strip():
        raise ValueError("O arquivo de tesauro está vazio.")

    for index, line in enumerate(content.splitlines()[1:], start=2):
        if not line.strip():
            continue

        if line.count("|") != 1:
            raise ValueError(f"Linha {index}: use '|' para separar as duas colunas.")
        replaced_by, replaceds = line.split("|", maxsplit=1)

        replaced_by = replaced_by.strip()
        replaceds = replaceds.strip()
        if not replaced_by or not (replaceds.startswith("[") and replaceds.endswith("]")):
            raise ValueError(f"Linha {index}: informe um nome e uma lista entre colchetes.")
        replaceds = replaceds[1:-1]
        if not any(name.strip() for name in replaceds.split(";")):
            raise ValueError(f"Linha {index}: a lista de nomes está vazia.")

        for name in replaceds.split(";"):
            name = name.strip()
            if not name:
                continue

            if name in subs and subs[name] != replaced_by:
                raise ValueError(
                    f"Linha {index}: {name!r} já está associado a {subs[name]!r}."
                )

            subs[name] = replaced_by

    return subs


def authors_standardization(file, database, tesauro_file):
    if database == "wos":
        df = read_wos_file(file)
        authors = "AU"
    elif database == "scopus":
        df = read_scopus_file(file)
        authors = "Authors"
    else:
        raise ValueError(f"Base de dados não suportada: {database}.")

    if authors not in df.columns:
        raise ValueError(f"O arquivo bibliográfico não contém a coluna {authors!r}.")

    tesauro = read_tesauro(tesauro_file)

    return df.with_columns(
        pl.col(authors)
        .str.split(";")
        .list.eval(pl.element().str.strip_chars().replace(tesauro))
        .list.join("; ")
        .alias(authors)
    )
