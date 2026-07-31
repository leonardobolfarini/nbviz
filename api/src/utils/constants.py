OUTPUT_FOLDER = "outputs"

HEADER_SCOPUS = [
    ("Authors", 0),
    ("Title", 1),
    ("Year", 2),
    ("Source title", 3),
    ("DOI", 4),
    ("Abstract", 5),
    ("Author Keywords", 6),
    ("References", 7),
]

HEADER_WOS = [
    ("AU", 0),
    ("TI", 1),
    ("PY", 2),
    ("SO", 3),
    ("DI", 4),
    ("AB", 5),
    ("DE", 6),
    ("CR", 7),
]

WOS_TO_SCOPUS = {
    "AU": "Authors",
    "TI": "Title",
    "PY": "Year",
    "SO": "Source title",
    "DI": "DOI",
    "AB": "Abstract",
    "DE": "Author Keywords",
    "CR": "References",
}

SCOPUS_TO_WOS = {v: k for k, v in WOS_TO_SCOPUS.items()}

OPENALEX_TO_SCOPUS = {
    "Author": "Authors",
    "Title": "Title",
    "Year": "Year",
    "Source": "Source title",
    "DOI": "DOI",
    "Abstract": "Abstract",
    "Keyword": "Author Keywords",
    "References": "References",
}

LABEL_MAP = {
    "AU": "authors",
    "Authors": "authors",
    "DE": "keywords",
    "Author Keywords": "keywords",
    "SO": "sources",
    "Source title": "sources",
    "PY": "years",
    "Year": "years",
}
