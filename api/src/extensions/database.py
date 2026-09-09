import os

from dotenv import load_dotenv
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase

load_dotenv()

host = os.getenv("POSTGRESQL_HOST")
port = os.getenv("POSTGRESQL_PORT")
user = os.getenv("POSTGRESQL_USER")
password = os.getenv("POSTGRESQL_PASSWORD")
database = os.getenv("POSTGRESQL_DB")


class Base(DeclarativeBase):
    pass


database_uri = f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{database}"
db = SQLAlchemy(model_class=Base)
