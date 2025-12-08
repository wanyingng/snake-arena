# Running Snake Arena Online with Docker

This guide explains how to run the Snake Arena application using Docker Compose.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (version 20.10 or higher)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0 or higher)

## Quick Start

1. **Copy the environment file** (optional):

   ```bash
   cp .env.example .env
   ```

   Edit `.env` to customize settings if needed.

2. **Start all services**:

   ```bash
   docker-compose up --build
   ```

3. **Access the application**:
   - Frontend: http://localhost
   - Backend API Docs: http://localhost/api/docs
   - Backend API (direct): http://localhost:8000

## Services

The application consists of three services:

- **postgres**: PostgreSQL 16 database
- **backend**: FastAPI application (Python)
- **frontend**: Nginx serving the built React app

## Common Commands

### Start services

```bash
docker-compose up
```

### Start services in background

```bash
docker-compose up -d
```

### Rebuild and start services

```bash
docker-compose up --build
```

### Stop services

```bash
docker-compose down
```

### Stop services and remove volumes (deletes database data)

```bash
docker-compose down -v
```

### View logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Run backend tests

```bash
# Unit tests
docker-compose exec backend pytest tests/

# Integration tests
docker-compose exec backend pytest tests_integration/

# All tests
docker-compose exec backend pytest
```

### Access the database

```bash
docker-compose exec postgres psql -U snakearena -d snakearena
```

### Execute backend shell

```bash
docker-compose exec backend bash
```

## Environment Variables

Configure the application by creating a `.env` file (copy from `.env.example`):

| Variable            | Description       | Default                     |
| ------------------- | ----------------- | --------------------------- |
| `POSTGRES_USER`     | Database username | `snakearena`                |
| `POSTGRES_PASSWORD` | Database password | `snakearena`                |
| `POSTGRES_DB`       | Database name     | `snakearena`                |
| `SECRET_KEY`        | JWT secret key    | `change-this-secret-key...` |
| `DEBUG`             | Enable debug mode | `true`                      |

## Development Workflow

### Hot Reload for Backend Code

The docker-compose.yml mounts the backend source code as a volume, so you can edit code and see changes without rebuilding:

1. Edit files in `backend/app/`
2. Changes are reflected automatically (uvicorn auto-reload is enabled)

### Rebuild Frontend

If you modify frontend code, you need to rebuild:

```bash
docker-compose up --build frontend
```

## Troubleshooting

### PostgreSQL connection errors

If the backend fails to connect to PostgreSQL, ensure the database is healthy:

```bash
docker-compose ps
```

Wait for the postgres service to show "healthy" status.

### Port already in use

If port 80, 8000, or 5432 is already in use:

1. Stop the conflicting service, or
2. Modify `docker-compose.yml` to use different ports:
   ```yaml
   ports:
     - "8080:80" # Use port 8080 instead of 80
   ```

### Database data persistence

Data is stored in a Docker volume named `postgres_data`. To completely reset:

```bash
docker-compose down -v
docker-compose up --build
```

### View container resource usage

```bash
docker stats
```

## Production Considerations

For production deployment:

1. **Change SECRET_KEY**: Use a strong random string
2. **Change database credentials**: Use strong passwords
3. **Set DEBUG=false**: Disable debug mode
4. **Configure CORS**: Update backend to allow specific origins only
5. **Use HTTPS**: Add SSL/TLS certificates to Nginx
6. **Backup database**: Set up regular PostgreSQL backups
7. **Remove development volume mounts**: Remove the backend source code volume mount from docker-compose.yml

## Architecture

```
┌─────────────────┐
│   Browser       │
└────────┬────────┘
         │
         │ HTTP (port 80)
         ▼
┌─────────────────┐
│  Nginx          │
│  (Frontend)     │
│                 │
│  - Serves SPA   │
│  - Proxies /api │
└────────┬────────┘
         │
         │ /api/* → http://backend:8000
         ▼
┌─────────────────┐      ┌─────────────────┐
│  FastAPI        │      │  PostgreSQL     │
│  (Backend)      │─────▶│  (Database)     │
│                 │      │                 │
│  Port 8000      │      │  Port 5432      │
└─────────────────┘      └─────────────────┘
```

## Next Steps

- Register a user account at http://localhost
- Play the game and submit scores
- View the leaderboard
- Check the API documentation at http://localhost/api/docs
