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
- `chat` app: `ChatSession`/`Message` models plus a `DocumentChunk` model (pgvector `embedding vector(1536)` + HNSW index, unused until Phase 5) for RAG; a Channels `ChatConsumer` streams Claude responses over WebSocket.
- `core` app: health check endpoint (`/api/health/`), owns the pgvector extension migration.
- Dockerfiles (backend + frontend) and root `docker-compose.yml` (Postgres+pgvector, Redis, backend/celery worker/celery beat, frontend).
- GitHub Actions CI (`.github/workflows/ci.yml`): backend job (ruff, Django checks, migration-drift check, migrate against a `pgvector/pgvector:pg16` service, tests) and frontend job (lint, build).

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

Phase 3 (Program Matcher) complete:
- `matcher` app: `MatchResult` (UUID PK, nullable FK `user`, `session_key` CharField for anonymous support, `quiz_answers` JSONField, M2M to `Career` (`recommended_careers`), M2M to `Program` (`recommended_programs`), `created_at`).
- `matcher/questions.py`: 10 static quiz questions across interests/strengths/work_style/goals, each option carrying `tags` (e.g. "analytical", "creativity", "leadership") used for scoring.
- `matcher/engine.py`: `run_matcher(quiz_answers)` — deterministic, no pgvector yet (that's Phase 5). Tallies tag frequency from the user's selected options, scores each `Career` by overlap with its `skills` JSONB plus a small `job_outlook` bonus (bright=3/growing=2/stable=1/declining=0), sorts by `(-score, title)` for a stable tie-break, returns the top 5 plus their linked `Program`s (deduped, ranked-career order preserved).
- `GET /api/matcher/questions/`, `POST /api/matcher/run/` (works both authenticated and anonymous — anonymous requests get a server-generated `session_key` back if none was supplied), `GET /api/matcher/results/<session_key>/` (latest result for that key).

Note: the API response's `recommended_careers`/`recommended_programs` are *not* read from the saved M2M relations — `Career`'s default ordering is alphabetical by title, which would silently discard match-score rank. Instead the view always computes (POST) or recomputes (GET, from the stored `quiz_answers` — deterministic, so it reproduces the same ranking) the ordered lists via `engine.run_matcher` and passes them through serializer context. The M2M fields are still persisted per spec, for admin/reporting use.

Engine tag/skill vocabulary (e.g. "analytical", "hands-on", "service") is designed to plausibly overlap with `Career.skills` but no `Career` rows are seeded yet, so matching hasn't been exercised against real data — worth a smoke test once the catalog has seed data.

Phase 4 (AI Chat Assistant) complete — this also resolves the `ChatSession` vs `Conversation` naming gap noted in Phase 0: the model is now named `ChatSession` and matches the original DB Models blueprint (relational `Message` FK, not a JSONB blob — same reasoning as before, just under the right name).
- `chat.ChatSession` (UUID PK, nullable FK `user`, unique `session_key` — server-generated via `generate_session_key()`, anonymous-friendly, `created_at`) and `chat.Message` (FK `chat_session`, `role` enum **user/assistant only** — no more `system`, since RAG context is injected per-turn as the Claude `system` prompt rather than stored as a message row — `content`, `created_at`).
- `chat/rag.py`: `build_context(message)` — basic keyword-based retrieval, no pgvector yet (Phase 5). Extracts keywords from the user's message (with a stopword list that deliberately excludes domain-generic terms like "university"/"college"/"program"/"degree" — since most `University.name` values literally contain "University", leaving that word in would make every university match instead of a relevant one), then does `icontains` lookups against `Career.title`/`description` and `University.name`/`city`, formats up to 3+3 results into a context block.
- `chat/consumers.py` `ChatConsumer` (`ws/chat/<session_key>/`): on connect, gets-or-creates the `ChatSession` by `session_key` (linking `user` if authenticated, else anonymous — same pattern as `matcher`). On each message: saves it, builds RAG context from it, streams the Claude response via `stream_reply` (existing `chat/services/claude.py`, unchanged) with the context folded into the system prompt, forwards each token as a `{"type": "delta", ...}` WS frame, then saves the completed assistant message and sends `{"type": "done"}`.
- `ANTHROPIC_MODEL` default changed to `claude-sonnet-4-6` per explicit instruction (was `claude-sonnet-5`) — flagging since that string doesn't match any Claude model id I'm otherwise aware of; worth double-checking it's not a typo before relying on it in production.
- `POST /api/chat/sessions/` (create, returns `session_key`; works authenticated or anonymous) and `GET /api/chat/sessions/<session_key>/` (full message history) — both public (`AllowAny`), same session-key-as-capability pattern as `matcher`.
- Registered in admin: `ChatSessionAdmin` (with a `Message` inline), `MessageAdmin`, `DocumentChunkAdmin`.

Known limitation carried over from `matcher`: WebSocket auth still goes through Channels' `AuthMiddlewareStack`, which is Django-session-cookie-based, not JWT — an authenticated API client (JWT) connecting over WS won't be recognized as that user unless they also have a Django session cookie. Not addressed here; flagged for whenever WS+JWT auth actually matters.

Phase 5 (Next.js frontend) complete:
- Installed axios, @tanstack/react-query, zustand, zod, react-hook-form, @hookform/resolvers.
- `src/lib/api.ts`: axios instance against `NEXT_PUBLIC_API_URL`, request interceptor attaches the JWT access token from `localStorage`, response interceptor logs out on 401. Note: `api.ts` and `src/store/authStore.ts` import each other (interceptor calls `useAuthStore.getState().logout()`); safe because both are only accessed lazily inside callbacks, never at module-eval time, but worth knowing if this ever gets refactored.
- `src/store/authStore.ts` (Zustand): `user`, `accessToken`/`refreshToken`, `login`/`register`/`logout`/`hydrate`. `register()` calls `POST /api/auth/register/` (which only returns the created user, no tokens) then immediately chains into `login()` to get tokens — matches how the backend's `RegisterView` is actually shaped.
- `src/types/index.ts` mirrors the backend serializers field-for-field, including the DRF detail: `DecimalField`s (`avg_rating`, `duration_years`, tuition, `avg_gpa_required`) serialize as **strings**, not numbers — typed accordingly throughout.
- All pages/components from the spec are built: landing page, `(auth)/login` + `(auth)/register` (react-hook-form + zod), careers list/detail, universities list/detail (Overview/Programs/Reviews tabs, paginated approved reviews, auth-gated `ReviewForm`), matcher quiz + results, chat UI with real WebSocket streaming and suggested-prompt chips. Shared `components/ui` primitives (Button, Card, Badge, Input, Spinner), layout (Navbar, Footer), and feature components per the spec.
- Backend change made to support this: `careers.CareerDetailSerializer` didn't expose linked programs at all (the frontend's career detail page needs a "linked programs" section, and there was no way to get that data otherwise). Added a `LinkedProgramSerializer` (id, name, slug, degree_type, university_name, university_slug — needs the parent university's name/slug for context, unlike the university-nested `ProgramSerializer`) and wired it onto `Career.programs` (the reverse of `Program.careers` M2M).
- Session-key-as-capability pattern (matcher, chat) is used the same way on the frontend: `localStorage` holds `matcher_session_key` / `chat_session_key`, and results/chat pages rehydrate from the backend using that key rather than passing state through the router.
- `zod`'s `.coerce`/`.transform()` doesn't type-check cleanly against react-hook-form's `useForm<T>` generic (output type vs. input type mismatch) — hit this twice (register form's `grad_year`, review form's ratings) and resolved both by keeping the zod schema as plain strings and converting to `Number(...)` at submit time instead, rather than fighting zod v4's resolver generics.
- Verified: `npm run build` passes clean (typecheck + lint + static generation across all 12 routes), `npm run lint` is clean, and a dev-server smoke test confirmed all pages return 200 with no console errors/warnings — but this is all against a backend that isn't running (same Docker-daemon-unavailable situation as every backend phase), so no page has actually round-tripped real data yet.

## Phase 6 Next
Replace chat/rag.py's keyword search with real pgvector-based semantic retrieval (embed Career/
University/DocumentChunk content, embed the user's message, similarity search). Also seed
representative Career/University/Program data and do a real end-to-end run (docker compose up)
once Docker is available — nothing in matcher, reviews, chat, or the new frontend has been
exercised against a live backend/database yet.

