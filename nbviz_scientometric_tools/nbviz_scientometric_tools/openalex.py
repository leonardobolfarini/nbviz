def format_openalex_response(article):
    primary_loc = article.get('primary_location') or {}
    source_obj = primary_loc.get('source') or {}
    source_name = source_obj.get('display_name') if isinstance(source_obj, dict) else None

    authors_list = [
        author.get('author', {}).get('display_name')
        for author in article.get('authorships', [])
        if author.get('author') and author.get('author', {}).get('display_name')
    ]
    authors_str = "; ".join(authors_list) if authors_list else None

    keywords_list = [
        keyword.get('display_name')
        for keyword in article.get('keywords', [])
        if keyword.get('display_name')
    ]
    keywords_str = "; ".join(keywords_list) if keywords_list else None

    return {
        'Title': article.get('title'),
        'Year': article.get('publication_year'),
        'DOI': article.get('doi'),
        'Source': source_name,
        'Author': authors_str,
        'Keyword': keywords_str
    }
