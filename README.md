# NBVIZ — Plataforma de Análise Cienciométrica

Sistema completo para processamento e visualização de dados bibliométricos exportados do **Scopus** e **Web of Science**. Desenvolvido como projeto de iniciação científica na Universidade de Marília (UNIMAR).

🔗 **Acesse em:** [nbviz.labs.unimar.br](https://nbviz.labs.unimar.br)

---

## Visão Geral

O NBVIZ automatiza o pipeline de análise cienciométrica — da importação dos arquivos brutos até a geração de gráficos e redes de co-ocorrência interativas. O projeto é estruturado como um monorepo com três camadas independentes:

```
nbviz/
├── api/                          # Backend Flask — processamento e endpoints
├── web_app/                      # Frontend React — dashboards e visualizações
└── scientometric_tools/          # Biblioteca core — lógica cienciométrica
```

---

## Módulos

### `/api` — Backend
API REST em Flask responsável por receber os arquivos de entrada, orquestrar o processamento via `scientometric_tools` e retornar os dados formatados para o frontend.

### `/web_app` — Frontend
Interface React com visualizações dinâmicas: gráficos de barras, redes de colaboração entre autores, nuvens de palavras-chave e dashboards de produção científica por período.

### `/scientometric_tools` — Biblioteca Core
Pacote Python publicado no PyPI com toda a lógica de tratamento de dados bibliométricos. Pode ser usado de forma independente em qualquer projeto Python.

---

## Como Executar

### Pré-requisitos
- Python 3.10+
- Node.js 18+

### 1. Biblioteca Core

```bash
cd scientometric_tools
pip install -e .
```

Para publicar uma nova versão no PyPI:

```bash
pip install build twine
python -m build
python -m twine upload dist/*
```

### 2. API

```bash
cd api
pip install -r requirements.txt
python main.py
```

### 3. Frontend

```bash
cd web_app
npm install
npm start
```

---

## Stack

| Camada | Tecnologias |
|---|---|
| Backend | Python, Flask, Polars |
| Frontend | React |
| Biblioteca | Python, Polars |
| Fontes de dados | Scopus, Web of Science |

---

<div align="center">
  <p><strong>Pesquisador:</strong> Leonardo Neves Bolfarini</p>
  <p><strong>Orientador:</strong> Rafael Gutierres Castanha</p>
  <p><strong>Instituição:</strong> Universidade de Marília — UNIMAR</p>
</div>
