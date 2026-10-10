# NBViz API

API REST do NBViz para integrar, padronizar e analisar dados bibliográficos de **Scopus**, **Web of Science (WoS)** e **OpenAlex**. A aplicação usa Flask, PostgreSQL e Redis/RQ: o processamento de arquivos é executado em segundo plano para que a requisição não fique bloqueada.

## Recursos

- Cadastro e autenticação de usuários com JWT.
- Integração de pelo menos duas fontes bibliográficas em uma única análise.
- Normalização dos campos e remoção de duplicidades.
- Arquivo consolidado, arquivo com registros removidos e dados para diagrama de Venn.
- Geração de redes de coautoria e de palavras-chave, com download em formato Pajek (`.net`).
- Dados agregados para gráficos de autores, palavras-chave, fontes e anos.
- Limpeza automática de arquivos gerados após três horas.

## Requisitos

- Python 3.10 ou superior (a imagem Docker usa Python 3.11).
- PostgreSQL 15 ou compatível.
- Redis 7 ou compatível.
- `pip`.

## Configuração

Copie o arquivo `.env.example` para `.env` e preencha os valores adequados ao ambiente:

```bash
cp .env.example .env
```

No Windows (PowerShell):

```powershell
Copy-Item .env.example .env
```

Não versione o `.env`. Em produção, defina as mesmas variáveis no ambiente ou no gerenciador de segredos utilizado pela infraestrutura.

## Banco de dados

Com o PostgreSQL em execução e o `.env` configurado, aplique as migrações:

```bash
flask --app main db upgrade
```

Para criar uma migração depois de alterar os modelos:

```bash
flask --app main db migrate -m "descricao da alteracao"
flask --app main db upgrade
```

Revise a migração gerada antes de aplicá-la, especialmente em renomeações e exclusões de colunas.

## Executando a aplicação

São necessários três processos: PostgreSQL, Redis, a API e o worker de processamento.

Inicie a API:

```bash
python main.py
```

Em outro terminal, inicie o worker RQ:

```bash
python worker.py
```

A API é exposta em `http://127.0.0.1:5009`. Para desenvolvimento com recarga automática, use:

```bash
flask --app main run --port 5009 --debug
```

### Docker

O `Dockerfile` cria a imagem da API; o `docker-compose.yml` sobe PostgreSQL, Redis e um worker. Antes de usar o Compose, configure o `.env` a partir do `.env.example` e execute:

```bash
docker compose up --build
```

O serviço HTTP `backend` está comentado no arquivo Compose. Para expor a API também pelo Compose, habilite esse serviço ou execute a imagem separadamente:

```bash
docker build -t nbviz-api .
docker run --env-file .env -p 5009:5009 nbviz-api
```

## Autenticação

Crie uma conta e obtenha um token:

```bash
curl -X POST http://127.0.0.1:5009/users/create \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@exemplo.com","password":"uma-senha-segura"}'

curl -X POST http://127.0.0.1:5009/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@exemplo.com","password":"uma-senha-segura"}'
```

As rotas protegidas exigem o cabeçalho:

```http
Authorization: Bearer <access_token>
```

## Endpoints

| Método | Rota | Autenticação | Descrição |
| --- | --- | --- | --- |
| `GET` | `/users` | Não | Lista usuários e suas análises. |
| `POST` | `/users/create` | Não | Cria uma conta. Corpo JSON: `email`, `password`. |
| `POST` | `/users/login` | Não | Retorna um token de acesso JWT. Corpo JSON: `email`, `password`. |
| `GET` | `/users/me` | JWT | Retorna o usuário autenticado. |
| `POST` | `/unify_files` | Não | Junta vários arquivos da mesma base. Multipart: `files`, `databaseType` (`scopus` ou `wos`). |
| `POST` | `/process` | JWT | Cria uma análise assíncrona combinando fontes diferentes. |
| `GET` | `/analyses/<analysis_id>` | JWT | Consulta o estado e os resultados de uma análise do usuário. |
| `GET` | `/download/<file_name>` | Não | Baixa um arquivo gerado que ainda não expirou. |
| `POST` | `/graph` | Não | Gera uma rede de coautoria ou palavras-chave. |
| `POST` | `/chart_bar` | Não | Retorna contagens para gráficos de barras. |

### Processar e integrar fontes

`POST /process` recebe `multipart/form-data`. Informe pelo menos duas fontes dentre `scopusFile`, `wosFile` e `searchTerm`.

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `scopusFile` | arquivo | Condicional | Exportação Scopus em CSV. |
| `wosFile` | arquivo | Condicional | Exportação Web of Science. |
| `searchTerm` | texto | Condicional | Consulta para recuperar trabalhos no OpenAlex. |
| `outputFormat` | texto | Sim | `scopus`, `openalex` ou `wos`. Define o formato do arquivo resultante. |
| `limit` | inteiro | Não | Limite de resultados ao consultar o OpenAlex. |

Exemplo:

```bash
curl -X POST http://127.0.0.1:5009/process \
  -H "Authorization: Bearer <access_token>" \
  -F "scopusFile=@scopus.csv" \
  -F "wosFile=@wos.txt" \
  -F "outputFormat=scopus"
```

A resposta é `202 Accepted` e contém os identificadores da análise e do job. Consulte `GET /analyses/<analysis_id>` até que `status` seja `finished` ou `error`.

```json
{
  "id": "2f96e9d6-5c95-4b4f-b8ed-bcd63cf72d04",
  "job_id": "rq-job-id",
  "status": "pending"
}
```

Quando concluída, a análise inclui `download_url`, `removed_url`, `venn`, `created_at` e `expires_at`. Os arquivos são removidos automaticamente após o período de retenção.

### Redes bibliométricas

`POST /graph` recebe `multipart/form-data`:

| Campo | Valores |
| --- | --- |
| `graphFile` | Arquivo Scopus (`.csv`) ou WoS (`.txt`). |
| `graphType` | `coauthorship` ou `keywords`. |

A resposta inclui `nodes`, `edges`, `download_url` e `file_name`. Para manter a visualização responsiva, redes muito grandes são simplificadas para no máximo 5.000 nós e 12.000 arestas na prévia; o arquivo `.net` baixável preserva a rede completa.

### Dados para gráfico de barras

Envie `chartBarFile` para `POST /chart_bar`. A resposta contém contagens de autores, palavras-chave, fontes e anos, usando os campos equivalentes da base enviada.

## Armazenamento e retenção

- Entradas temporárias: `storage/processing/`.
- Resultados: `storage/analyses/`.
- Os arquivos de saída expiram após três horas. O registro da análise permanece no banco com suas URLs, que podem então apontar para arquivos indisponíveis.
- Deixe `START_FILE_CLEANUP=true` em apenas um processo da implantação para evitar rotinas de limpeza duplicadas.

## Estrutura

```text
api/
├── main.py                 # Aplicação Flask e configuração de extensões
├── worker.py               # Worker RQ da fila "processing"
├── src/
│   ├── routes/             # Rotas HTTP
│   ├── tasks/              # Processamento assíncrono
│   ├── models/             # Modelos SQLAlchemy
│   ├── extensions/         # PostgreSQL e Redis/RQ
│   └── utils/              # Constantes e limpeza de arquivos
├── migrations/             # Migrações Alembic
├── Dockerfile
└── docker-compose.yml
```
