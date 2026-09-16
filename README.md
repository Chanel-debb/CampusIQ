# CampusIQ

Monorepo with a Django 5 backend and a Next.js 14 frontend.

## Structure

- `backend/` — Django 5 (managed with [uv](https://docs.astral.sh/uv/)), Django REST Framework, Django Channels, PostgreSQL with pgvector, Redis, Celery, and the Anthropic Claude API.
- `frontend/` — Next.js 14 (App Router), TypeScript, Tailwind CSS.
- `docker-compose.yml` — runs Postgres+pgvector, Redis, the Django backend (ASGI via Daphne), Celery worker/beat, and the Next.js frontend together.

## Quick start (Docker)

```bash
cp .env.example .env            # set ANTHROPIC_API_KEY
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local

docker compose up --build
```

- Backend: http://localhost:8000 (health check at `/api/health/`)
- Frontend: http://localhost:3000

## Local development without Docker

### Backend

```bash
cd backend
uv sync
cp .env.example .env            # point DATABASE_URL/REDIS_URL at local services
uv run python manage.py migrate
uv run python manage.py createsuperuser
uv run daphne -b 0.0.0.0 -p 8000 config.asgi:application
```

Requires a local PostgreSQL instance with the `pgvector` extension available, and Redis running.

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

## Backend apps

- `core` — health check endpoint, shared infrastructure (also owns the `pgvector` extension migration).
- `chat` — conversations/messages models, a `DocumentChunk` model with a pgvector embedding column, a Django Channels `ChatConsumer` for streaming Claude responses over WebSocket, and a REST API for conversation history.
