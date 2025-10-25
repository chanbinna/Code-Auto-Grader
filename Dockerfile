# Multi-stage Dockerfile: build client (Vite) then run server with Uvicorn

FROM node:18-alpine AS client-build
WORKDIR /app/client
COPY client/package.json client/package-lock.json* ./
COPY client/ .
RUN npm ci && npm run build

FROM python:3.11-slim
WORKDIR /app

# system deps
RUN apt-get update && apt-get install -y gcc libpq-dev && rm -rf /var/lib/apt/lists/*

# Copy server
COPY server/ ./server/
COPY --from=client-build /app/client/dist ./server/static

WORKDIR /app/server
RUN python -m venv .venv
ENV PATH="/app/server/.venv/bin:$PATH"
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

ENV PYTHONUNBUFFERED=1
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
