# CampusIQ — Project Context

## What this is
University and career discovery platform for high school students.
Helps them pick a career path and find the right university/program.

## Core Features (all MVP)
1. Career Explorer — browse careers, salary, outlook, skills
2. University Finder — search by program, province, rating
3. Program Matcher — quiz → AI-recommended careers + programs
4. Student Reviews — crowdsourced ratings for universities/programs
5. AI Chat Assistant — Claude-powered, RAG pipeline with pgvector

## Stack
- Backend: Django 5, DRF, PostgreSQL 16 + pgvector, Redis, Celery, Django Channels + Daphne
- Frontend: Next.js 14 App Router, TypeScript, Tailwind CSS, React Query, Zustand, Zod
- AI: Anthropic Claude API (claude-sonnet for chat, claude-haiku for suggestions), LangChain
- Infra: AWS ECS Fargate (backend), Vercel (frontend), RDS, ElastiCache, S3 + CloudFront
- Package manager: uv (never pip)

## DB Models
- User (UUID PK, email, full_name, role, province, grad_year)
- Career (title, slug, description, salary_min/max, job_outlook, skills JSONB, embedding vector(1536))
- CareerCategory (name, slug)
- University (name, slug, province, city, avg_rating, ranking_national)
- Program (university FK, name, degree_type, duration, tuition_domestic/intl, careers M2M)
- Review (user FK, university FK, program FK, ratings 1-5, body, moderation status)
- MatchResult (user FK, quiz_answers JSONB, recommended careers + programs)
- ChatSession (user FK, messages JSONB)

## Current Status
Phase 0 complete:
- Monorepo scaffold (`backend/`, `frontend/`, root `docker-compose.yml`), managed with uv (backend) and npm (frontend).
- Custom `accounts.User` model (UUID PK, email login, full_name, role, province, grad_year) — `AUTH_USER_MODEL = "accounts.User"`.
- JWT auth via `djangorestframework-simplejwt`: `POST /api/auth/register/`, `/api/auth/token/`, `/api/auth/token/refresh/`, `/api/auth/token/verify/`, `/api/auth/me/`.
- `chat` app: `Conversation`/`Message` models plus a `DocumentChunk` model (pgvector `embedding vector(1536)` + HNSW index) for RAG; a Channels `ChatConsumer` streams Claude responses over WebSocket.
- `core` app: health check endpoint (`/api/health/`), owns the pgvector extension migration.
- Dockerfiles (backend + frontend) and root `docker-compose.yml` (Postgres+pgvector, Redis, backend/celery worker/celery beat, frontend).
- GitHub Actions CI (`.github/workflows/ci.yml`): backend job (ruff, Django checks, migration-drift check, migrate against a `pgvector/pgvector:pg16` service, tests) and frontend job (lint, build).

Note: the chat data model is `Conversation` + `Message` (not the single `ChatSession` with a `messages` JSONB blob described under DB Models below) — relational messages made more sense alongside the WebSocket consumer. Worth reconciling that section if `ChatSession` is meant to be the eventual shape.

Phase 1 complete:
- `careers` app: `CareerCategory` (name, slug) and `Career` (title, slug, description, salary_min/max, `job_outlook` enum, required_education, skills JSONB, `embedding vector(1536)` + HNSW index, FK to `CareerCategory`). Slugs auto-populate from name/title on save.
- `universities` app: `University` (name, slug, province enum, city, website, logo_url, avg_rating, total_reviews, ranking_national) and `Program` (FK to `University`, name, slug unique-per-university, `degree_type` enum, duration_years, tuition_domestic/intl, avg_gpa_required, description, M2M to `Career`).
- Read-only DRF endpoints: `GET /api/careers/` + `/api/careers/<slug>/`, `GET /api/universities/` + `/api/universities/<slug>/` (list/detail use separate serializers; detail nests category/programs). Public (`AllowAny`), since this is catalog data.
- University filtering via django-filter: `?province=`, `?program=<program-slug>`, `?min_rating=`.
- All four models registered in Django admin (`Program` inlined under `University`, autocomplete + `careers` M2M widget on `ProgramAdmin`).

`Province` choices are centralized in `core/choices.py` and imported by both `accounts.User.province` and `universities.University.province` — no more duplicated enum.

Phase 2 (Reviews) complete:
- `reviews` app: `Review` (UUID PK, FK `user`, FK `university`, nullable FK `program`, `overall_rating`/`teaching_rating`/`career_support_rating` IntegerField 1-5 via validators, `body`, `is_verified`, `status` enum pending/approved/rejected, `created_at`). One review per user per university enforced via `unique_together = [("user", "university")]`.
- Signal chain (`reviews/signals.py`, wired via `ReviewsConfig.ready()`): a `pre_save` receiver stashes the prior status, then `post_save` recalculates `University.avg_rating`/`total_reviews` (from `overall_rating` of approved reviews only) whenever a review enters *or* leaves approved status — not just on entry, since leaving approved (e.g. a reject after approve) must also pull it out of the average. A `post_delete` receiver does the same recalculation if an approved review is deleted.
- `POST /api/reviews/` (auth required) — validates the program belongs to the selected university and that the user hasn't already reviewed that university, with a clear per-field error message. `GET /api/universities/<slug>/reviews/` — paginated (`ReviewPagination`, page_size 10), approved-only, public.
- `ReviewAdmin` has bulk "Approve selected reviews" / "Reject selected reviews" actions that loop and call `.save()` per instance (not `queryset.update()`) specifically so the recalculation signal fires for each one.

Note: couldn't run a live `migrate` against a real Postgres+pgvector instance in this environment (same Docker-daemon-unavailable limitation as Phase 0/1) — verified instead via `manage.py check`, `makemigrations --check` (no drift), a direct inspection of the generated migration's dependency graph, and confirming the signal receivers are actually connected for the `Review` model at runtime.

## Phase 3 Next
Build MatchResult (user FK, quiz_answers JSONB, recommended careers + programs) and wire up the
Program Matcher quiz flow.

