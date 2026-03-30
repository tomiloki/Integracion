#!/bin/sh
set -e

echo "[backend] Running migrations..."
python manage.py migrate --noinput

if [ "${BOOTSTRAP_PORTFOLIO:-false}" = "true" ]; then
  echo "[backend] Bootstrapping demo portfolio data..."
  python manage.py bootstrap_portfolio
fi

echo "[backend] Starting Django server on 0.0.0.0:8000"
python manage.py runserver 0.0.0.0:8000
