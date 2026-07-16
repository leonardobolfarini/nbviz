# scientometric_tools

Biblioteca Python para processamento de dados bibliométricos exportados do **Scopus** e **Web of Science (WoS)**. Desenvolvida para o projeto [NBVIZ](https://nbviz.labs.unimar.br), mas projetada para uso independente em qualquer pipeline de análise cienciométrica.

```bash
pip install nbviz_scientometric_tools
```

---

## Funcionalidades

- Padronização e limpeza de dados do Scopus (`.csv`) e WoS (`.txt`)
- Normalização de nomes de autores
- Formatação de referências citadas
- Remoção de duplicatas por DOI com preservação de registros sem DOI
- Geração de contagens para visualizações (autores, keywords, fontes, anos)
- Formatação de grafos de co-ocorrência (nós e arestas ponderadas)

---

## Uso

### Leitura e padronização

```python
import scientometric_tools as st

# WoS (.txt)
wos = st.read_wos_file("savedrecs.txt")

# Scopus (.csv)
scopus = st.read_scopus_file("scopus.csv")

header_txt = [("AU",0),("TI",1),("PY",2),("SO",3),("DI",4),("AB",5),("DE",6),("CR",7)]
header_csv = [("Authors",0),("Title",1),("Year",2),("Source title",3),
              ("DOI",4),("Abstract",5),("Author Keywords",6),("References",7)]

wos    = st.keep_columns(wos, header_txt)
scopus = st.keep_columns(scopus, header_csv)
```

### Processamento

```python
# Processa WoS — normaliza autores, remove aspas de keywords e referências
wos_processed = st.process_wos_data(wos, header_txt)

# Processa Scopus — trata abstracts e formata referências citadas
scopus_processed = st.process_scopus_data(scopus, header_csv)
```

## Merge de arquivos de mesma base

Se você possui vários arquivos exportados da mesma plataforma (por exemplo, múltiplos arquivos `.csv` da Scopus ou vários `.txt` da Web of Science) e deseja unificá-los de forma extremamente performática utilizando o motor *Lazy* do Polars:

```python
import scientometric_tools as st

# 1. Carregue os arquivos na memória (modo Eager)
arquivos_scopus = ["scopus_part1.csv", "scopus_part2.csv", "scopus_part3.csv"]
dfs = [st.read_scopus_file(arq) for arq in arquivos_scopus]

# 2. Converta os DataFrames para LazyFrames para otimização de memória
lazy_frames = [df.lazy() for df in dfs]

# 3. Funde todas as bases de uma só vez de forma otimizada
# (Gera um LazyFrame unificado)
unificado_lazy = st.merge_same_database(lazy_frames)

# 4. Grave o resultado direto no disco usando sink_csv
# (Isso processa a fusão sem estourar a memória RAM do servidor/máquina)
unificado_lazy.sink_csv("scopus_completo.csv", separator=",")
```

### Merge entre bases

```python
wos_to_scopus = {
    "AU": "Authors", "TI": "Title", "PY": "Year",
    "SO": "Source title", "DI": "DOI", "AB": "Abstract",
    "DE": "Author Keywords", "CR": "References"
}

# Remove duplicatas por DOI, preserva registros sem DOI
# e aplica deduplicação final por título + ano
merged = st.merge_and_process(
    scopus_processed,
    wos_processed,
    mapping=wos_to_scopus,
    subset_cols=["Title", "Year"]
)
```

### Contagens para gráficos

```python
# Autores mais produtivos
authors = st.get_counts(merged, "Authors", "author")
# [{"author": "Silva J.", "count": 12}, ...]

# Keywords com múltiplos separadores
keywords = st.get_counts(merged, "Author Keywords", "keyword",
                         separators=[";", ",", " and "])
# [{"keyword": "bibliometrics", "count": 8}, ...]

# Fontes / periódicos
sources = st.get_counts(merged, "Source title", "source")

# Produção por ano
years = st.get_counts(merged, "Year", "year")
```

### Grafo de co-ocorrência

```python
# Gera nós e arestas ponderadas para visualização em rede
graph = st.graph_formatter(merged, "Authors")

# Estrutura retornada:
# {
#   "nodes": [{"data": {"id": "Silva J.", "label": "Silva J."}}, ...],
#   "edges": [{"data": {"source": "Silva J.", "target": "Costa M.", "weight": 5}}, ...]
# }
```

---

## Referência da API

| Função | Descrição |
|---|---|
| `read_wos_file(file)` | Lê o arquivo extraído da base de dados Web of Science |
| `read_scopus_file(file)` | Lê o arquivo extraído da base de dados Scopus |
| `keep_columns(df, columns)` | Seleciona colunas, normaliza strings e trata nulos |
| `process_wos_data(df, header)` | Processa e padroniza dados do Web of Science |
| `process_scopus_data(df, header)` | Processa e padroniza dados do Scopus |
| `merge_same_database(lazyframes)` | Funde múltiplos LazyFrames da mesma base de dados de forma otimizada |
| `merge_and_process(target, visitor, mapping, subset_cols)` | Merge entre bases com deduplicação por DOI |
| `get_counts(df, column, output_key, separators)` | Contagem de termos para gráficos |
| `graph_formatter(df, column, separators)` | Gera estrutura de grafo de coautoria ou co-ocorrência |

---

## Requisitos

- Python 3.10+
- polars
- unidecode

---

## Projeto

Desenvolvido por **Leonardo Neves Bolfarini** sob orientação do prof. **Rafael Gutierres Castanha** na **Universidade de Marília (UNIMAR)**.
