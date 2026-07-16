FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV POLARS_MAX_THREADS=16

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5009

CMD ["gunicorn", "--bind", "0.0.0.0:5009", "--workers", "1", "--worker-class", "gthread", "--threads", "4", "--timeout", "300", "main:app"]
