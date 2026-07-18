HEADER_CSV = [
    ("Authors", 0),
    ("Title", 1),
    ("Year", 2),
    ("Source title", 3),
    ("DOI", 4),
    ("Abstract", 5),
    ("Author Keywords", 6),
    ("References", 7),
]

HEADER_TXT = [
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
