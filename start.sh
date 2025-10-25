#!/usr/bin/env sh
# Start script that ensures we run from the `server` directory if it exists.
# This avoids "can't chdir to 'server'" errors when Render's working directory varies.

set -e

# If a server directory exists, change into it
if [ -d "server" ]; then
  cd server
fi

# Default PORT if not provided
: "${PORT:=8000}"

exec gunicorn -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:${PORT}
