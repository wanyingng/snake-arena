.PHONY: help install run test clean dev lint format

help:
	@echo "Available commands:"
	@echo "  make install    - Install dependencies using uv"
	@echo "  make run        - Run the backend server"
	@echo "  make dev        - Run the backend server with auto-reload"
	@echo "  make test       - Run tests"
	@echo "  make lint       - Run linting checks"
	@echo "  make format     - Format code"
	@echo "  make clean      - Clean cache files"

install:
	uv sync

run:
	uv run uvicorn app.main:app

dev:
	uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

test:
	uv run pytest

lint:
	uv run ruff check .

format:
	uv run ruff format .

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
