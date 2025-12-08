# Snake Arena - Backend

FastAPI backend for Snake Arena.

## Prerequisites

- Python 3.12+
- `uv` package manager

## Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   uv sync
   ```

## Running the Server

To start the development server with hot-reloading:

```bash
uv run uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.
API Documentation:
- Swagger UI: `http://localhost:8000/api/docs`
- ReDoc: `http://localhost:8000/api/redoc`

## Running Tests

To run the automated tests:

```bash
uv run pytest
```
