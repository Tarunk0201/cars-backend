# Car Backend (Express + MongoDB)

Minimal scaffold for a Node.js + Express + MongoDB API.

Quick start

1. Copy `.env.example` to `.env` and set `MONGODB_URI`.
2. Install dependencies:

```powershell
cd c:\Users\Tarun\Documents\learning\car\Backend
npm install
```

3. Start in dev mode:

```powershell
npm run dev
```

Endpoints

- GET /health -> { "status": "ok" }
- Basic /cars endpoints (create, list)

Notes

- The server will attempt to connect to the database but will still start even if the DB is unreachable so you can test `/health` without DB.
