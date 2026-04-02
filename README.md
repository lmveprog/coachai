# CoachAI

Plateforme d'apprentissage gamifiée en data science. Les utilisateurs soumettent du code Python, SQL ou R, exécuté dans des containers Docker isolés. Un système ELO classe les utilisateurs, des badges récompensent les accomplissements, et un abonnement premium déverrouille les contenus avancés.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Browser                          │
└─────────────────────┬───────────────────────────────────────────┘
                      │ HTTP :3000
┌─────────────────────▼───────────────────────────────────────────┐
│              Frontend  ·  Next.js 15  ·  React 19               │
│  Zustand auth store · React Query · Monaco Editor · Tailwind    │
└─────────────────────┬───────────────────────────────────────────┘
                      │ HTTP :8000
┌─────────────────────▼───────────────────────────────────────────┐
│              Backend  ·  FastAPI  ·  Python 3.12                 │
│  SQLAlchemy async · JWT · Stripe · Anthropic · Groq · Resend    │
└──────┬──────────────┬──────────────────────────────────────────-┘
       │ asyncpg      │ redis.asyncio           │ HTTP :8001
┌──────▼──────┐  ┌────▼────┐          ┌─────────▼─────────────────┐
│ PostgreSQL  │  │  Redis  │          │  Judge  ·  FastAPI         │
│    :5432    │  │  :6379  │          │  Docker SDK → containers   │
└─────────────┘  └─────────┘          └─────────┬──────────────────┘
                                                 │ docker run
                           ┌─────────────────────┼──────────────────┐
                           │                     │                  │
                  ┌────────▼────────┐  ┌─────────▼──────┐  ┌───────▼──────┐
                  │ sandbox-python  │  │  sandbox-sql   │  │  sandbox-r   │
                  │ Python 3.12     │  │  Python+SQLite │  │  R 4.3.2     │
                  │ ML/DS libs      │  │  sql_runner.py │  │  tidyverse   │
                  └─────────────────┘  └────────────────┘  └──────────────┘
```

---

## Stack technique

| Couche | Technologie | Version |
|--------|-------------|---------|
| Frontend | Next.js | 15.1.0 |
| UI | React | 19.0.0 |
| State | Zustand | 5.0.2 |
| Data fetching | TanStack Query | 5.62.7 |
| HTTP client | Axios | 1.7.9 |
| Code editor | Monaco Editor | 4.6.0 |
| Styling | Tailwind CSS | 3.4.17 |
| Backend | FastAPI | 0.115.0 |
| ASGI server | Uvicorn | 0.30.6 |
| ORM | SQLAlchemy (async) | 2.0.36 |
| DB driver | asyncpg | 0.30.0 |
| Migrations | Alembic | 1.13.3 |
| Auth | python-jose + bcrypt | 3.3.0 / 3.2.2 |
| Validation | Pydantic | 2.9.2 |
| Payments | Stripe | 11.2.0 |
| LLM chatbot | Groq (primary) / Anthropic (fallback) | — |
| Emails | Resend | — |
| Container runtime | Docker SDK (Python) | — |
| Database | PostgreSQL | 16 |
| Cache / blacklist | Redis | 7 |

---

## Structure du projet

```
coachai/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py          # Pydantic Settings, validation des envs
│   │   │   ├── database.py        # Engine SQLAlchemy async, session factory
│   │   │   ├── redis.py           # Singleton Redis client
│   │   │   ├── rate_limit.py      # Middleware rate limiting par endpoint
│   │   │   ├── rank.py            # Calcul du rang textuel depuis l'ELO
│   │   │   └── logging.py
│   │   ├── models/
│   │   │   ├── user.py            # User, UserBadge
│   │   │   ├── challenge.py       # Challenge, ChallengeTag, ChallengeTestCase
│   │   │   ├── submission.py      # Submission, SubmissionStatus (enum)
│   │   │   ├── course.py          # Course, Lesson, UserLessonProgress
│   │   │   ├── badge.py           # Badge, BadgeTrigger (enum)
│   │   │   └── elo.py             # EloHistory
│   │   ├── schemas/               # Pydantic DTOs (request / response)
│   │   │   ├── auth.py
│   │   │   ├── user.py
│   │   │   ├── challenge.py
│   │   │   ├── submission.py
│   │   │   ├── course.py
│   │   │   └── leaderboard.py
│   │   ├── routers/
│   │   │   ├── auth.py            # Register, login, refresh, reset password
│   │   │   ├── users.py           # Profil, soumissions, historique ELO
│   │   │   ├── challenges.py      # Listing et détail des challenges
│   │   │   ├── submissions.py     # Soumission de code, résultats
│   │   │   ├── courses.py         # Cours, leçons, progression
│   │   │   ├── leaderboard.py     # Classement ELO (cache Redis 60s)
│   │   │   ├── billing.py         # Stripe checkout, webhook, portail
│   │   │   ├── admin.py           # CRUD challenges/courses, stats
│   │   │   ├── chat.py            # IA chatbot (Groq / Claude)
│   │   │   └── health.py
│   │   ├── services/
│   │   │   ├── auth.py            # Création/vérification JWT
│   │   │   ├── elo.py             # Calcul ELO + écriture EloHistory
│   │   │   ├── badges.py          # Attribution automatique des badges
│   │   │   └── email.py           # Templates email via Resend
│   │   └── main.py                # App FastAPI, CORS, montage des routers
│   ├── alembic/                   # Migrations de schéma DB
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/            # login, register, forgot-password
│   │   │   ├── challenges/        # listing + [slug] détail + éditeur
│   │   │   ├── learn/             # listing cours + [slug] leçons
│   │   │   ├── leaderboard/
│   │   │   ├── profile/[username]/
│   │   │   ├── settings/
│   │   │   ├── admin/
│   │   │   ├── billing/           # success / cancel (retour Stripe)
│   │   │   ├── pricing/
│   │   │   └── page.tsx           # Landing page
│   │   ├── components/
│   │   │   ├── ui/                # Button, Badge, Glass (glassmorphism)
│   │   │   ├── layout/            # Navbar, Footer
│   │   │   ├── challenge/         # ChallengeCard
│   │   │   ├── billing/           # CheckoutButton
│   │   │   ├── ChatWidget.tsx     # Assistant IA flottant
│   │   │   ├── CookieBanner.tsx
│   │   │   └── OnboardingModal.tsx
│   │   ├── store/
│   │   │   └── auth.ts            # Zustand : token, user, login(), logout()
│   │   ├── lib/
│   │   │   ├── api.ts             # Axios + intercepteur refresh token
│   │   │   └── utils.ts
│   │   └── types/index.ts         # Interfaces TypeScript globales
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── package.json
│   └── Dockerfile
├── judge/
│   ├── main.py                    # Service FastAPI : exécution Docker isolée
│   ├── requirements.txt
│   └── Dockerfile
├── infra/
│   ├── postgres/
│   │   ├── init.sql               # Extensions : uuid-ossp, pg_trgm
│   │   ├── migrate_add_is_admin.sql
│   │   ├── seed_challenges.sql
│   │   ├── seed_challenges_v2.sql
│   │   ├── seed_courses.sql
│   │   └── seed_course_python_pandas.sql
│   └── sandboxes/
│       ├── python/Dockerfile      # Python 3.12-slim + ML libs
│       ├── sql/
│       │   ├── Dockerfile         # Python 3.12-slim + SQLite + pandas
│       │   └── sql_runner.py      # Wrapper SQL→SQLite in-memory
│       └── r/Dockerfile           # r-base:4.3.2 + tidyverse
├── docker-compose.yml
├── .env
└── .env.example
```

---

## Services Docker

| Service | Image / Build | Port hôte | Dépendances |
|---------|---------------|-----------|-------------|
| `postgres` | postgres:16-alpine | 5432 | — |
| `redis` | redis:7-alpine | 6379 | — |
| `backend` | ./backend | 8000 | postgres (healthy), redis (healthy) |
| `frontend` | ./frontend | 3000 | backend |
| `judge` | ./judge | 8001 | redis |
| `sandbox-python` | ./infra/sandboxes/python | — | profile `build-sandboxes` |
| `sandbox-sql` | ./infra/sandboxes/sql | — | profile `build-sandboxes` |
| `sandbox-r` | ./infra/sandboxes/r | — | profile `build-sandboxes` |

Le judge monte `/var/run/docker.sock` pour créer des containers éphémères. Il tourne en mode `privileged`.

---

## Démarrage

### Prérequis

- Docker Desktop (ou Engine + Compose plugin)
- Git

### 1. Cloner et configurer l'environnement

```bash
git clone https://github.com/lmveprog/coachai.git
cd coachai
cp .env.example .env
```

Remplir les variables dans `.env` (voir section [Variables d'environnement](#variables-denvironnement)).

### 2. Builder les images sandbox (une seule fois)

```bash
docker compose --profile build-sandboxes build
```

Ces images (`coachai-sandbox-python`, `coachai-sandbox-sql`, `coachai-sandbox-r`) sont réutilisées pour toutes les soumissions. Ne pas les omettre, sinon le judge échouera.

### 3. Démarrer tous les services

```bash
docker compose up -d
```

### 4. Vérifier l'état

```bash
docker compose ps
```

| URL | Service |
|-----|---------|
| http://localhost:3000 | Frontend |
| http://localhost:8000/docs | Backend (Swagger) |
| http://localhost:8001/health | Judge |

### 5. Seeder la base de données (optionnel)

```bash
# Challenges
docker exec -i coachai_postgres psql -U coachai -d coachai \
  < infra/postgres/seed_challenges_v2.sql

# Cours
docker exec -i coachai_postgres psql -U coachai -d coachai \
  < infra/postgres/seed_courses.sql

# Cours Pandas
docker exec -i coachai_postgres psql -U coachai -d coachai \
  < infra/postgres/seed_course_python_pandas.sql
```

### Arrêter

```bash
docker compose down           # conserve les volumes
docker compose down -v        # supprime aussi les données
```

---

## Variables d'environnement

Fichier : `.env` à la racine.

### Base de données

| Variable | Valeur par défaut | Description |
|----------|-------------------|-------------|
| `POSTGRES_USER` | `coachai` | Utilisateur PostgreSQL |
| `POSTGRES_PASSWORD` | `coachai_dev` | Mot de passe PostgreSQL |
| `POSTGRES_DB` | `coachai` | Nom de la base |
| `DATABASE_URL` | `postgresql+asyncpg://coachai:coachai_dev@postgres:5432/coachai` | URL SQLAlchemy (asyncpg) |

### Redis

| Variable | Valeur par défaut | Description |
|----------|-------------------|-------------|
| `REDIS_PASSWORD` | `redis_dev` | Mot de passe Redis |
| `REDIS_URL` | `redis://:redis_dev@redis:6379/0` | URL Redis complète |

### JWT / Auth

| Variable | Description |
|----------|-------------|
| `JWT_SECRET` | Clé de signature HMAC-SHA256 (min 32 chars en production) |
| `JWT_ALGORITHM` | `HS256` |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | Durée du token d'accès (défaut 60) |
| `JWT_REFRESH_TOKEN_EXPIRE_DAYS` | Durée du refresh token (défaut 30) |
| `SUPABASE_URL` | Optionnel — pour OAuth Supabase |
| `SUPABASE_ANON_KEY` | Optionnel |
| `SUPABASE_SERVICE_ROLE_KEY` | Optionnel |

### Judge

| Variable | Description |
|----------|-------------|
| `JUDGE_URL` | `http://judge:8001` (interne Docker) |
| `JUDGE_SECRET` | Secret partagé backend ↔ judge (header `X-Judge-Secret`) |

### Application

| Variable | Description |
|----------|-------------|
| `ENVIRONMENT` | `development` ou `production` |
| `FRONTEND_URL` | `http://localhost:3000` |
| `BACKEND_URL` | `http://localhost:8000` |

### Services tiers

| Variable | Service | Description |
|----------|---------|-------------|
| `STRIPE_SECRET_KEY` | Stripe | Clé secrète (sk_test_… / sk_live_…) |
| `STRIPE_WEBHOOK_SECRET` | Stripe | Secret de vérification webhook (whsec_…) |
| `STRIPE_PRICE_ID_PRO` | Stripe | ID du Price produit Pro |
| `ANTHROPIC_API_KEY` | Claude | Évaluation de fichiers/notebooks |
| `GROQ_API_KEY` | Groq | Chatbot IA (tier gratuit) |
| `RESEND_API_KEY` | Resend | Emails transactionnels (3 000/mois gratuit) |

---

## API Backend

Base URL : `http://localhost:8000`  
Documentation interactive : `http://localhost:8000/docs`

### Authentification

```
POST   /auth/register             Créer un compte
POST   /auth/login                Login → {access_token, refresh_token}
POST   /auth/refresh              Renouveler l'access token
GET    /auth/me                   Profil utilisateur courant
POST   /auth/forgot-password      Envoyer email de reset (202)
POST   /auth/reset-password       Réinitialiser le mot de passe
POST   /auth/logout               Blacklister le refresh token (Redis)
```

Les routes protégées nécessitent le header `Authorization: Bearer <access_token>`.

### Challenges

```
GET    /challenges                 Liste (pagination, filtres: category, difficulty, type, search)
GET    /challenges/{slug}          Détail + description markdown + config d'évaluation
```

### Soumissions

```
POST   /submissions                Soumettre du code → appel au judge → ELO + badges
GET    /submissions/{id}           Résultat d'une soumission
GET    /submissions/daily-status   Quota journalier (free: 3 challenges distincts/jour)
```

Payload de soumission :
```json
{
  "challenge_id": "uuid",
  "code": "string",
  "language": "python | sql | r"
}
```

### Cours

```
GET    /courses                              Liste des cours publiés (avec progression)
GET    /courses/{slug}                       Détail cours + liste des leçons
GET    /courses/{slug}/lessons/{lesson_id}   Contenu markdown de la leçon
POST   /courses/{slug}/lessons/{lesson_id}/complete  Marquer comme terminée
```

### Classement & Utilisateurs

```
GET    /leaderboard                Classement ELO global (Redis cache 60s)
GET    /leaderboard/me             Rang et position de l'utilisateur courant
GET    /users/{username}           Profil public + badges
PATCH  /users/me                   Modifier bio, avatar, pays, display_name
GET    /users/me/submissions       Historique des soumissions
GET    /users/me/elo-history        Journal des variations ELO
POST   /users/me/delete            Supprimer le compte
```

### Billing

```
POST   /billing/checkout           Créer une session Stripe Checkout (essai 7j)
POST   /billing/webhook            Réception des événements Stripe
GET    /billing/portal             Lien vers le portail Stripe
GET    /billing/status             Statut d'abonnement de l'utilisateur
```

### Admin (is_admin requis)

```
POST   /admin/challenges           Créer un challenge + test cases
PATCH  /admin/challenges/{slug}    Modifier un challenge
POST   /admin/courses              Créer un cours
GET    /admin/stats                Statistiques plateforme
```

### Chat

```
POST   /chat/message               Message au chatbot IA (Groq → Claude fallback)
```

---

## Judge — Exécution isolée

### Pipeline

```
Backend → POST /judge (X-Judge-Secret)
  ↓
Écriture du code dans /tmp (fichier temporaire)
  ↓
docker run --network none
           --memory <limit>m
           --cpu-quota 100000
           --read-only
           --tmpfs /tmp:size=64m
  ↓
Kill timer (time_limit + 2s)
  ↓
Capture stdout / stderr
  ↓
Comparaison avec expected_output (normalisée)
  ↓
Score = earned_points / total_points × 100
  ↓
Résultat publié dans Redis (TTL 300s)
  ↓
Réponse JSON → Backend
  ↓
Maj ELO + badges + submission.status
```

### Statuts de soumission

| Statut | Signification |
|--------|--------------|
| `accepted` | Tous les tests passés ou exit code 0 |
| `wrong_answer` | Output incorrect, 0 points |
| `score_below_threshold` | Partiel : 0 < score < 100% |
| `time_limit` | Dépassement du temps limite |
| `memory_limit` | Dépassement mémoire |
| `runtime_error` | Exit code ≠ 0 |

### Images sandbox

| Image | Base | Packages |
|-------|------|---------|
| `coachai-sandbox-python` | python:3.12-slim | numpy 1.26.4, pandas 2.2.1, scikit-learn 1.4.1, matplotlib, seaborn, scipy, xgboost, lightgbm, statsmodels, Pillow, requests |
| `coachai-sandbox-sql` | python:3.12-slim | pandas 2.2.1 + `sql_runner.py` (SQLite in-memory) |
| `coachai-sandbox-r` | r-base:4.3.2 | dplyr, ggplot2, tidyr, readr, stringr, lubridate, jsonlite, data.table |

Tous les containers tournent avec un utilisateur non-privilégié (`sandbox`, uid 1000/1001).

### SQL — format context.json

Pour les challenges SQL, le judge injecte les données de setup via `/code/context.json` :
```json
{
  "setup_sql": "CREATE TABLE orders (id INT, amount FLOAT); INSERT INTO orders VALUES (1, 99.9);"
}
```
`sql_runner.py` exécute ce SQL dans SQLite `:memory:` avant la requête de l'utilisateur.

---

## Modèle de données

### users

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID PK | |
| `email` | VARCHAR UNIQUE | Indexé |
| `username` | VARCHAR UNIQUE | Indexé |
| `hashed_password` | VARCHAR NULLABLE | Null si OAuth |
| `elo` | INT | Défaut 1000 |
| `rank` | VARCHAR | Calculé depuis ELO |
| `challenges_solved` | INT | |
| `total_submissions` | INT | |
| `streak_days` | INT | Jours consécutifs actifs |
| `last_active_at` | TIMESTAMP | Pour le calcul de streak |
| `is_premium` | BOOL | |
| `premium_until` | TIMESTAMP | |
| `stripe_customer_id` | VARCHAR | |
| `is_admin` | BOOL | |
| `is_verified` | BOOL | |
| `avatar_url`, `bio`, `country` | VARCHAR | Profil public |

### challenges

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID PK | |
| `slug` | VARCHAR UNIQUE | URL-friendly identifier |
| `category` | ENUM | SQL, ML, DL, NLP, CV, Visualization, Data Engineering |
| `difficulty` | ENUM | easy, medium, hard, expert |
| `challenge_type` | ENUM | code, model, notebook, quiz |
| `base_points` | INT | Points de base |
| `elo_reward` | INT | ELO gagné au premier solve |
| `evaluation_config` | JSON | Config métriques ML (seuils, métriques) |
| `starter_code` | TEXT | Code de départ |
| `time_limit_seconds` | INT | Timeout du container |
| `memory_limit_mb` | INT | Limite mémoire |
| `is_published` | BOOL | |
| `is_premium` | BOOL | |
| `total_attempts` / `total_solves` | INT | Stats agrégées |

### submissions

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID PK | |
| `user_id` | UUID FK | Indexé |
| `challenge_id` | UUID FK | Indexé |
| `language` | ENUM | python, sql, r |
| `status` | ENUM | Voir statuts ci-dessus |
| `score` | FLOAT | 0–100 |
| `execution_time_ms` | INT | |
| `result_detail` | JSON | Résultats par test case |
| `elo_before` / `elo_after` / `elo_delta` | INT | |
| `is_first_solve` | BOOL | |

### elo_history

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID PK | |
| `user_id` | UUID FK | |
| `submission_id` | UUID FK NULLABLE | |
| `elo_before` / `elo_after` / `delta` | INT | |
| `reason` | VARCHAR | challenge_solved, challenge_failed, daily_bonus, streak_bonus |

---

## Système ELO

- **ELO initial** : 1000
- **K-factor** : 32 (base)
- **Multiplicateurs de difficulté** :
  - easy : ×1.0
  - medium : ×1.5
  - hard : ×2.0
  - expert : ×3.0
- **Gain** : premier solve uniquement (empêche le farming)
- **Perte** : tentative échouée (pénalité réduite)
- **Historique complet** : table `elo_history` avec raison

---

## Système de badges

| Trigger | Valeur | Description |
|---------|--------|-------------|
| `first_solve` | — | Premier challenge résolu |
| `streak` | 7 / 30 / 100 | Jours consécutifs d'activité |
| `category_master` | 5 / 10 / 25 | Challenges résolus dans une catégorie |
| `elo_milestone` | 1200 / 1500 / 1800 / 2200 | Paliers ELO atteints |
| `speed_solve` | < 1000ms | Exécution ultra-rapide |
| `perfect_score` | 100% | Score parfait sur un challenge ML |

Les badges sont vérifiés et attribués automatiquement après chaque soumission acceptée.

---

## Auth — flux complet

```
Register → hashed_password (bcrypt) → access_token (60min) + refresh_token (30j)
Login    → vérification hash → même réponse
Refresh  → vérifie refresh_token non blacklisté (Redis) → nouvel access_token
Logout   → SETEX Redis "blacklist:<jti>" TTL 30j
```

**Rate limiting** (Redis sliding window) :
- `POST /auth/register` : 5 req / 5 min
- `POST /auth/login` : 10 req / 1 min
- `POST /auth/forgot-password` : 3 req / 5 min

**Frontend** : l'intercepteur Axios détecte les 401, met en file d'attente les requêtes concurrentes, rafraîchit le token, puis re-joue la file.

---

## Migrations Alembic

```bash
# Créer une nouvelle migration
docker exec coachai_backend alembic revision --autogenerate -m "description"

# Appliquer les migrations
docker exec coachai_backend alembic upgrade head

# Revenir en arrière
docker exec coachai_backend alembic downgrade -1
```

---

## Catégories de challenges

| Catégorie | Description |
|-----------|-------------|
| SQL | Requêtes SQL (SQLite in-memory) |
| ML | Machine Learning (scikit-learn, évaluation par métriques) |
| DL | Deep Learning |
| NLP | Natural Language Processing |
| CV | Computer Vision (Pillow) |
| Visualization | Matplotlib, seaborn |
| Data Engineering | ETL, pandas, data pipelines |

---

## Abonnement Premium

- Paiement via Stripe Checkout (période d'essai 7 jours)
- Webhook `customer.subscription.updated` / `deleted` → mise à jour `is_premium` + `premium_until`
- Portail Stripe pour gérer / annuler
- Gating : challenges et leçons avec `is_premium=true` bloqués pour les utilisateurs free

**Limites free** :
- 3 challenges distincts par jour
- Accès aux contenus non-premium uniquement

---

## Développement local sans Docker

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Remplacer les URLs @postgres et @redis par localhost dans .env
export DATABASE_URL="postgresql+asyncpg://coachai:coachai_dev@localhost:5432/coachai"
export REDIS_URL="redis://:redis_dev@localhost:6379/0"

uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev
```

Le judge nécessite Docker pour créer des containers — il ne peut pas tourner sans daemon Docker.

---

## Logs

```bash
docker compose logs -f backend
docker compose logs -f judge
docker compose logs -f frontend
docker compose logs -f postgres
```
