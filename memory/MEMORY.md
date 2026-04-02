# CoachAI Platform - Project Memory

## Vision
Plateforme data/IA gamifiée : HackTheBox + HackerRank + OpenClassrooms spécialisé data/IA.
- Challenges avec ELO rating + gamification
- Section formation (type OpenClassroom)
- Modèle business : Freemium

## Challenge Types
- Deep Learning / NLP / Vision
- Visualisation & storytelling data
- Machine Learning (entraîner des modèles)
- SQL / manipulation de données

## Stack Validée
- **Frontend**: Next.js 15 (React 19 + TypeScript) — App Router
- **Backend**: FastAPI (Python 3.12) — évaluation ML native
- **Code execution**: Judge service custom (Docker-in-Docker)
- **DB**: PostgreSQL 16 + Redis 7
- **Auth**: JWT maison (Supabase possible pour OAuth)

## Structure du projet
```
coachai/
├── backend/app/
│   ├── core/        config, database, redis
│   ├── models/      user, challenge, submission, elo, course, badge
│   ├── routers/     health, auth, users, challenges, submissions, leaderboard, courses
│   ├── schemas/     (à faire)
│   └── services/    (à faire)
├── frontend/src/
│   ├── app/         layout, page, providers
│   ├── lib/         api.ts (axios)
│   └── types/       index.ts (tous les types TS)
├── judge/           service d'exécution isolée Docker-in-Docker
└── infra/postgres/  init.sql (uuid-ossp, pg_trgm)
```

## Modèle de données (PostgreSQL)
- **users**: id, email, username, elo(1000), rank, streak, is_premium
- **challenges**: id, slug, category, difficulty, type(code/model/notebook/quiz), evaluation_config(JSON)
- **submissions**: id, user_id, challenge_id, status, score, elo_before/after/delta
- **elo_history**: log de tous les mouvements ELO
- **courses + lessons**: formation type OpenClassroom
- **badges + user_badges**: gamification
- Rank progression: Rookie(0) → Analyst(1200) → Expert(1500) → Master(1800) → Grand Master(2200)

## ELO System
- ELO de base 1000
- Reward par challenge (configurable dans le modèle, défaut 25)
- EloHistory permet de rejouer le classement (audit complet)

## Judge Service
- Docker-in-Docker via /var/run/docker.sock
- Sandbox : --network none, mem_limit, cpu_quota, read_only, tmpfs
- Résultat publié dans Redis (clé judge:result:{submission_id}, TTL 5min)

## Status actuel
- [x] Scaffolding complet
- [x] Modèles de données SQLAlchemy + Alembic configuré
- [x] Backend FastAPI structuré (routers vides prêts)
- [x] Frontend Next.js 15 + Tailwind + React Query + dark mode
- [x] Judge service minimal
- [ ] Auth (JWT login/register)
- [ ] CRUD challenges
- [ ] Submit + évaluation
- [ ] ELO service
- [ ] Leaderboard Redis
- [ ] UI components

## Pour démarrer
Docker doit être lancé, puis :
```bash
cp .env.example .env
docker compose up --build
# Migration initiale :
docker compose exec backend alembic revision --autogenerate -m "init"
docker compose exec backend alembic upgrade head
```
