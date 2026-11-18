#!/usr/bin/env bash
# Restaure la base de données World News à partir d'un fichier de sauvegarde.
# Usage : npm run db:restore -- ./backups/world-news_20260101_120000.sql

set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  echo "❌ DATABASE_URL n'est pas définie. Vérifiez votre fichier .env."
  exit 1
fi

BACKUP_FILE="${1:-}"

if [ -z "$BACKUP_FILE" ] || [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ Veuillez indiquer un fichier de sauvegarde valide."
  echo "   Usage : npm run db:restore -- ./backups/fichier.sql"
  exit 1
fi

echo "⚠️  Cette opération va écraser les données actuelles."
read -p "Confirmer la restauration depuis $BACKUP_FILE ? (oui/non) " CONFIRM

if [ "$CONFIRM" != "oui" ]; then
  echo "Restauration annulée."
  exit 0
fi

echo "♻️  Restauration en cours..."
psql "$DATABASE_URL" < "$BACKUP_FILE"

echo "✅ Restauration terminée."
