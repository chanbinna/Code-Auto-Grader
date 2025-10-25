Deployment guide — Vercel (frontend) + Render (backend)

This repository contains a React/Vite frontend in `client/` and a FastAPI backend in `server/`.

Quick overview

- Frontend: Deploy to Vercel. Build command `npm run build` (from `client/`) and output `dist/`.
- Backend: Deploy to Render (or Railway). Use `pip install -r requirements.txt` and run with gunicorn + uvicorn worker.

1) Prepare GitHub

- Push your code to GitHub (you already did).

2) Backend (Render) — recommended

- Create a new Web Service in Render and connect the GitHub repo.
- Set the service's "Root Directory" to `server`.
- Build Command:
  pip install -r requirements.txt
- Start Command (recommended):
  gunicorn -k uvicorn.workers.UvicornWorker server.main:app --bind 0.0.0.0:$PORT

Environment variables on Render:
- ALLOWED_ORIGINS — comma-separated origins allowed by CORS (e.g. `https://your-vercel-app.vercel.app,http://localhost:5173`). If you set `*` only, credential support will be disabled.
- DATABASE_URL — optional. If provided, you can configure app to use Postgres. (Current code uses SQLite by default at `server/data/grader.db`.)
- SUBMISSIONS_DIR — optional path for storing uploaded submissions (if you have Render persistent disk configured).

Notes about storage:
- The current code saves uploaded files to the local filesystem under `server/submissions/...` by default. Most PaaS ephemeral filesystems may erase files on redeploy or scale. For production use, configure S3 (or a persistent disk) and change saving logic accordingly.

3) Frontend (Vercel)

- Create a new project in Vercel and connect the GitHub repo.
- Set the Project Root to `client`.
- Build Command: `npm run build`
- Output Directory: `dist`

Environment variables in Vercel (add under Project Settings -> Environment Variables):
- VITE_API_BASE — full API base URL (e.g. `https://my-grader.onrender.com/api`). This will be used by the frontend at build time.

4) CORS

- After you have your Vercel URL, set it into Render's `ALLOWED_ORIGINS` environment variable (comma-separated). Example:
  `https://my-grader.vercel.app,http://localhost:5173`

5) Smoke test

- Open the Vercel URL, ensure the SPA loads.
- Create/select a student in the UI and submit a simple .py file to a problem.
- Check Render logs if submissions fail. Confirm that submissions appear in the DB and that `/api/submission_file/...` serves the file.

6) Optional improvements

- Move DB to a managed Postgres for reliability; update `server` DB code to respect `DATABASE_URL`.
- Store uploaded files to S3 for persistence across deploys.
- Add automated CI (GitHub Actions) to run unit tests.

If you'd like, I can:
- Add a `render.yaml` or Dockerfile for Render deployment.
- Update backend to use S3 for submissions and add example env vars.
- Create a small GitHub Actions workflow to build and test the frontend before deploy.

