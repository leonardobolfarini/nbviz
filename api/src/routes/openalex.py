import requests
from flask import Blueprint, jsonify

openalex = Blueprint('openalex', __name__)

@openalex.route('/get_works', methods=['GET'])
def get_works():
    url = "https://api.openalex.org/works"
    campos_necessarios = [
        "authorships",
        "title",
        "publication_year",
        "primary_location",
        "doi",
        "keywords",
    ]
    query_params = {
        "search": "artificial intelligence",
        "api_key": "MgJfPXsCK8MCzgYaud9PGp",
        "select": ",".join(campos_necessarios),
        "filter": "has_abstract:true"
    }
    headers = {
        "User-Agent": "mailto:leonardobolfarini@gmail.com"
    }
    response = requests.get(url, params=query_params, headers=headers)


    if response.status_code == 200:
        dados = response.json()
        resultados = dados['results']
        authors = resultados['authorships']
        return jsonify(dados['results'])

    else:
        return jsonify({ 'message': f'Erro na API: {response.text}' }), response.status_code
