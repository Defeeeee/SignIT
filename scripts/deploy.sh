#!/usr/bin/env bash
set -euo pipefail

# SSH no-interactivo no carga .bashrc, así que nvm nunca se activa solo y
# caemos al Node del sistema (viejo). Lo cargamos a mano.
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use default >/dev/null

echo "==> node $(node -v)"

APP_DIR="/home/ubuntu/signit"
cd "$APP_DIR"

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
