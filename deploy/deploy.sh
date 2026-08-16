#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/www/nivest"
WEB_DIR="/var/www/nivest-web"
ADMIN_DIR="/var/www/nivest-admin"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/apps/web"
ADMIN_FRONTEND="$APP_DIR/apps/admin"
APP_USER="www-data"
export HOME="/var/www"

APP_URL="${APP_URL:-https://nivest.site}"
DB_PASSWORD="${DB_PASSWORD:-}"

echo "==> [1/9] directories + permissions"
mkdir -p "$WEB_DIR" "$ADMIN_DIR" /var/www/.composer /var/www/.npm /var/www/.cache
chown -R "$APP_USER:$APP_USER" /var/www

echo "==> [2/9] composer install"
sudo -u "$APP_USER" bash -c "cd '$BACKEND_DIR' && composer install --no-dev --optimize-autoloader --no-interaction --no-progress"

echo "==> [3/9] backend .env (create once)"
if [ ! -f "$BACKEND_DIR/.env" ] || ! grep -q "APP_ENV=production" "$BACKEND_DIR/.env" || ! grep -q "^APP_KEY=base64:" "$BACKEND_DIR/.env"; then
  rm -f "$BACKEND_DIR/.env"
  cat > "$BACKEND_DIR/.env" <<EOF
APP_NAME=NiVEST
APP_ENV=production
APP_DEBUG=false
APP_URL=${APP_URL}
APP_KEY=
APP_LOCALE=id
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=id_ID
APP_MAINTENANCE_DRIVER=file
BCRYPT_ROUNDS=12
LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nivest
DB_USERNAME=nivest
DB_PASSWORD=${DB_PASSWORD}
SESSION_DRIVER=redis
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null
BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=redis
CACHE_STORE=redis
CACHE_PREFIX=nivest
MEMCACHED_HOST=127.0.0.1
REDIS_CLIENT=predis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
CORS_ALLOWED_ORIGINS=${APP_URL}
MAIL_MAILER=log
MAIL_FROM_ADDRESS="hello@nivest.site"
MAIL_FROM_NAME="\${APP_NAME}"
VITE_APP_NAME="\${APP_NAME}"
EOF
  chown "$APP_USER:$APP_USER" "$BACKEND_DIR/.env"
  sudo -u "$APP_USER" bash -c "cd '$BACKEND_DIR' && php artisan key:generate --force"
  echo "   .env created + APP_KEY generated"
else
  echo "   .env already exists, skipped"
fi

echo "==> [4/9] migrate"
sudo -u "$APP_USER" bash -c "cd '$BACKEND_DIR' && php artisan migrate --force"

echo "==> [5/9] seed (idempotent)"
sudo -u "$APP_USER" bash -c "cd '$BACKEND_DIR' && php artisan db:seed --class=RolePermissionSeeder --force"
sudo -u "$APP_USER" bash -c "cd '$BACKEND_DIR' && php artisan db:seed --class=AdminUserSeeder --force"
sudo -u "$APP_USER" bash -c "cd '$BACKEND_DIR' && php artisan db:seed --class=SettingSeeder --force"

echo "==> [6/9] storage link"
sudo -u "$APP_USER" bash -c "cd '$BACKEND_DIR' && mkdir -p storage/app/public && php artisan storage:link" || true

echo "==> [7/9] build web"
sudo -u "$APP_USER" bash -c "cd '$FRONTEND_DIR' && npm ci --no-audit --no-fund || npm install --no-audit --no-fund"
sudo -u "$APP_USER" bash -c "cd '$FRONTEND_DIR' && npm run build"
rsync -a --delete "$FRONTEND_DIR/dist/" "$WEB_DIR/"

echo "==> [7b/9] build admin"
sudo -u "$APP_USER" bash -c "cd '$ADMIN_FRONTEND' && npm ci --no-audit --no-fund || npm install --no-audit --no-fund"
sudo -u "$APP_USER" bash -c "cd '$ADMIN_FRONTEND' && npm run build"
rsync -a --delete "$ADMIN_FRONTEND/dist/" "$ADMIN_DIR/"

echo "==> [8/9] cache"
sudo -u "$APP_USER" bash -c "cd '$BACKEND_DIR' && php artisan config:cache"
sudo -u "$APP_USER" bash -c "cd '$BACKEND_DIR' && php artisan route:cache" || echo "   route:cache skipped"
sudo -u "$APP_USER" bash -c "cd '$BACKEND_DIR' && php artisan view:cache" || echo "   view:cache skipped"

echo "==> [9/9] queue restart"
sudo -u "$APP_USER" bash -c "cd '$BACKEND_DIR' && php artisan queue:restart" || true

chown -R "$APP_USER:$APP_USER" "$APP_DIR"
echo "DEPLOY_DONE"
