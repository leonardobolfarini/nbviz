import os

from redis import Redis
from rq import Queue

redis_connection = Redis.from_url(
    os.getenv("REDIS_URL", "redis://localhost:6379/0")
)
processing_queue = Queue("processing", connection=redis_connection, default_timeout=600)
