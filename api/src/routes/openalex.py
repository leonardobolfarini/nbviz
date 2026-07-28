import os
from shlex import quote
import uuid

import polars as pl
import requests
from dotenv import load_dotenv
from flask import Blueprint, jsonify, request
from src.utils.constants import OUTPUT_FOLDER

import nbviz_scientometric_tools as st

load_dotenv()
openalex_bp = Blueprint('openalex', __name__)

@openalex_bp.route('/get_works', methods=['GET'])
def get_works():
    search_for = request.args.get('search_for')

    if not search_for:
        return jsonify({ 'message': 'A propriedade "search_for" é obrigatória.' }), 404

    url = "https://api.openalex.org/authors"
    # campos_necessarios = [
    #     "authorships",
    #     "title",
    #     "publication_year",
    #     "primary_location",
    #     "doi",
    #     "keywords",
    # ]
    query_params = {
        "search": search_for,
        "api_key": os.getenv('OPENALEX_API_KEY'),
        # "select": ",".join(campos_necessarios),
        # "filter": "has_abstract:true"
    }
    headers = {
        "User-Agent": "mailto:leonardobolfarini@gmail.com"
    }
    response = requests.get(url, params=query_params, headers=headers)

    if response.status_code == 200:
        dados = response.json()
        resultados = [
            st.format_openalex_response(article) for article in dados.get('results', [])
        ]
        file_name = f"openalex_output_{uuid.uuid4()}.csv"
        output = os.path.join(OUTPUT_FOLDER, file_name)

        df = pl.DataFrame(resultados)
        df.write_csv(output, separator=',', quote_char='"', quote_style='always')

        return jsonify({
            "download_url": f"/download/{file_name}",
            "file_name": file_name
        })
    else:
        return jsonify({ 'message': f'Erro na API: {response.text}' }), response.status_code
