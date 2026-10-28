worker:
	python worker.py

dashboard:
	rq-dashboard --redis-url redis://localhost:6379/0

api:
	flask --app main run --port 5009

migration:
	flask --app main db migrate -m "$(msg)"

migrate:
	flask --app main db upgrade

downgrade:
	flask --app main db downgrade
