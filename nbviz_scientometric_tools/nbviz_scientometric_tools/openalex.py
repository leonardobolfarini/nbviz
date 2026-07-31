import polars as pl
import requests

from .utils.exceptions import NoneValueAtProp, OpenAlexApiKeyError


def fetch_openalex_works(search_term: str, api_key: str, limit: int | None = None) -> pl.DataFrame:
    if not search_term:
        raise NoneValueAtProp('Property "search_term" is required at that function.')

    if not api_key:
        raise OpenAlexApiKeyError('OpenAlex API_KEY is needed to be passed as a property function')

    url = "https://api.openalex.org/works"
    cursor = "*"
    results = []
    campos_necessarios = [
        "id",
        "authorships",
        "title",
        "publication_year",
        "primary_location",
        "doi",
        "keywords",
        "abstract_inverted_index",
        "referenced_works",
    ]
    headers = {
        "User-Agent": "mailto:leonardobolfarini@gmail.com"
    }

    while cursor:
        query_params = {
            "search": search_term,
            "api_key": api_key,
            "select": ",".join(campos_necessarios),
            "filter": "has_abstract:true",
            "per_page": 200,
            "cursor": cursor
        }
        response = requests.get(url, params=query_params, headers=headers)
        response.raise_for_status()
        data = response.json()

        works = data.get('results', [])

        if not works:
            break

        for article in works:
            results.append(format_openalex_response(article))

            if limit and len(results) >= limit:
                return pl.DataFrame(results)

        cursor = data.get("meta", {}).get("next_cursor")

    return pl.DataFrame(results)

def format_openalex_response(article):
    primary_loc = article.get('primary_location') or {}
    source_obj = primary_loc.get('source') or {}
    source_name = source_obj.get('display_name') if isinstance(source_obj, dict) else None

    authors_list = [
        author.get('author', {}).get('display_name')
        for author in article.get('authorships', [])
        if author.get('author') and author.get('author', {}).get('display_name')
    ]
    authors_str = "; ".join(authors_list).lower().strip() if authors_list else None

    keywords_list = [
        keyword.get('display_name')
        for keyword in article.get('keywords', [])
        if keyword.get('display_name')
    ]
    keywords_str = "; ".join(keywords_list).lower().strip() if keywords_list else None

    abstract_text = construct_abstract(article.get('abstract_inverted_index'))

    referenced_works = article.get('referenced_works', [])
    references_str = "; ".join(referenced_works) if referenced_works else None

    return {
        'Author': authors_str,
        'Title': article.get('title'),
        'Year': str(article.get('publication_year')),
        'Source': source_name,
        'DOI': article.get('doi'),
        'Abstract': abstract_text,
        'Keyword': keywords_str,
        'References': references_str
    }

def construct_abstract(inverted_index: dict) -> str | None:
    if not inverted_index:
        return None

    words_in_order = []
    for word, positions in inverted_index.items():
        for pos in positions:
            words_in_order.append((pos, word))

    words_in_order.sort(key=lambda x: x[0])

    return " ".join(word.lower().replace('"', "").strip() for _, word in words_in_order)
