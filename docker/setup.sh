#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
if [ -e .env ]; then
    printf '%s\n' '.env already exists; leaving settings unchanged.'
    exit 0
fi
command -v openssl >/dev/null 2>&1 || { printf '%s\n' 'Install openssl first.' >&2; exit 1; }
umask 077
root_password=$(openssl rand -hex 32)
database_password=$(openssl rand -hex 32)
jwt_secret=$(openssl rand -hex 32)
set -C
printf 'MYSQL_ROOT_PASSWORD=%s\nMYSQL_PASSWORD=%s\nJWT_SECRET=%s\nKIOSK_BIND_ADDRESS=127.0.0.1\nKIOSK_PORT=5020\nKIOSK_PATH_BASE=\n' \
    "$root_password" "$database_password" "$jwt_secret" > .env
printf '%s\n' 'Created .env with random secrets. Keep it private and backed up.'