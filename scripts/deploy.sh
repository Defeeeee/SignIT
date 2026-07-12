#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/home/ubuntu/signit"
cd "$APP_DIR"

echo "==> git reset a origin/main"
git fetch origin main
git reset --hard origin/main

echo "==> npm ci"
npm ci

echo "==> prisma generate + migrate deploy"
npx prisma generate
npx prisma migrate deploy

echo "==> build"
npm run build

echo "==> pm2 reload (o start si es la primera vez)"
pm2 reload ecosystem.config.js --update-env || pm2 start ecosystem.config.js
pm2 save

echo "==> listo"
