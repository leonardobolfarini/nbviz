from rq import Worker

from main import app
from src.extensions.queue import redis_connection


if __name__ == "__main__":
    with app.app_context():
        Worker(["processing"], connection=redis_connection).work()
