# I.C. - Sistema de Análise e Visualização Cienciométrica 🌐

Este repositório contém o ecossistema completo do NBVIZ. O projeto automatiza o processamento de dados bibliométricos e gera visualizações interativas para análise de produção científica.

### Você pode testá-lo acessando: https://nbviz.labs.unimar.br/

## 🏗️ Estrutura do Projeto

O projeto é organizado como um monorepo:

- **/api**: Backend em Flask que processa os arquivos e serve os dados via JSON.
- **/web_app**: Frontend em React com visualizações dinâmicas e dashboards.
- **/scientometric_tools**: Biblioteca core (lib) que contém toda a lógica científica.

## 🚀 Como Executar

### 1. Biblioteca (Core)

Para desenvolvimento local com atualizações em tempo real:

```bash
pip install -e .
```

Para modificações na biblioteca:

```bash
# Gera o novo build
python -m build

# Tenta o upload
python -m twine upload dist/*
```

### 2. Backend (API)

```bash
cd api
pip install -r requirements.txt
python main.py
```

### 3. Frontend (React)

```bash
cd web_app
npm install
npm start
```

## 📊 Tecnologias Utilizadas

- **Python** (Pandas, Flask, Setuptools)
- **React** (Data Visualization)
- **Bibliometria** (Scopus & Web of Science API/Parsers)

---

<div align="center">
  <p>
    <strong>Pesquisador:</strong> Leonardo Neves Bolfarini | <strong>Orientador:</strong> Rafael Gutierres Castanha
  </p>
  <p>
    <strong>Instituição:</strong> Universidade de Marília (UNIMAR)
  </p>
</div>
