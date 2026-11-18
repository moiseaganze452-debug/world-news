#!/usr/bin/env bash
# Sauvegarde la base de données PostgreSQL de World News.
# Usage : npm run db:backup

set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  echo "❌ DATABASE_URL n'est pas définie. Vérifiez votre fichier .env."
  exit 1
fi

BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/world-news_$TIMESTAMP.sql"

echo "📦 Sauvegarde en cours vers $BACKUP_FILE ..."
pg_dump "$DATABASE_URL" > "$BACKUP_FILE"

echo "✅ Sauvegarde terminée : $BACKUP_FILE"
