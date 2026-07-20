import requests
from flask import Blueprint, jsonify

openalex = Blueprint('openalex', __name__)

@openalex.route('/get_works', methods=['GET'])
def get_works():
    url = "https://api.openalex.org/works"
    campos_necessarios = [
        "authorship",
        "doi"
    ]
    query_params = {
        "search.semantic": "artifical intelligence",
        "api_key": "MgJfPXsCK8MCzgYaud9PGp",
        "select": ",".join(campos_necessarios)
    }
    headers = {
        "User-Agent": "mailto:leonardobolfarini@gmail.com"
    }
    response = requests.get(url, params=query_params, headers=headers)

    if response.status_code == 200:
        dados = response.json()
        return jsonify(dados['results'])

    else:
        return jsonify({ 'message': f'Erro na API: {response.text}' }, response.status_code)
