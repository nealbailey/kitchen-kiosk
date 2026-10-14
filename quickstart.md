# Docker Quickstart

Docker runs Kitchen Kiosk and MySQL as two isolated processes called containers. Compose manages them together. Database and photo files live in persistent Docker volumes, separate from the containers.

This setup targets Linux x64 (AMD64), including Docker Desktop's Linux-container mode on an x64 computer. ARM devices are not currently supported by this configuration. Container startup has not yet been tested in this repository's development environment; treat this as a preview until the checks below pass on your host.

## Install and Start

Install [Docker Engine with the Compose plugin](https://docs.docker.com/engine/install/) on Linux, or [Docker Desktop](https://docs.docker.com/desktop/) on Windows/macOS. You also need Git, a shell, and OpenSSL (Windows users can use WSL). Confirm `docker compose version` and `docker info` work. On Linux, configure Docker to [start at boot](https://docs.docker.com/engine/install/linux-postinstall/#configure-docker-to-start-on-boot-with-systemd). Membership in the `docker` group grants root-equivalent privileges.

```bash
git clone https://github.com/nealbailey/kitchen-kiosk.git
cd kitchen-kiosk
sh docker/setup.sh
docker compose up -d --build --wait --wait-timeout 300
```

The initial build downloads dependencies and compiles both the web app and API inside Docker. MySQL automatically creates the schema, roles, and administrator on its first start. Subsequent starts reuse the existing database. Nothing connects to your native MySQL installation, and MySQL's port is not published to the host.

Open http://localhost:5020. Log in as **admin** with password **ChangeMe!2026**, then immediately change it under **Admin > Change My Password**. Follow the [user guide](Kiosk.Web/README.md) to create a category, user, and recipe.

The setup script creates a private, Git-ignored `.env` with random database passwords and a JWT signing key. It never replaces an existing file. Keep it alongside the Compose file and back it up securely. Never post `.env` or `docker compose config` output publicly; both contain secrets. Do not use the development `dbg.env` for Docker.

## Access and HTTPS

By default only browsers on the Docker host can connect. To allow other devices on your LAN, set `KIOSK_BIND_ADDRESS=0.0.0.0` in `.env`, then run `docker compose up -d`. Use `http://HOST:5020` and check your host firewall; Docker-published ports may bypass some firewall rules. Do not expose the default admin password over an untrusted network.

Change `KIOSK_PORT` in `.env` if port 5020 is occupied. Leave `KIOSK_PATH_BASE` empty for normal use, even behind a proxy serving a dedicated hostname. For a proxy publishing `/kiosk/`, set `KIOSK_PATH_BASE=/kiosk` and preserve that prefix upstream. Apply changes with `docker compose up -d` (a simple restart does not reload environment settings). See the [reverse proxy examples](README.md#3-https-with-a-reverse-proxy-optional).

Keep TLS at a reverse proxy for internet access. A proxy running on the host can connect to localhost:5020. Docker-network proxies need separate networking and trusted-proxy configuration; they are not configured here.

## Everyday Commands

Run these in the cloned repository folder:

```bash
docker compose ps                 # container status
docker compose logs --tail=100    # recent logs
docker compose logs -f kiosk      # follow app logs (Ctrl+C stops following only)
docker compose stop              # stop without deleting containers or data
docker compose start             # start existing stopped containers
docker compose restart kiosk     # restart the app with its existing settings
docker compose down              # remove containers/network; keep all data
docker compose up -d --wait       # recreate/start using existing images and data
```

Both services use `restart: unless-stopped`: they return after a reboot when Docker starts, unless you explicitly stopped or removed them. After `stop` or `down`, run `docker compose up -d --wait` to enable them again. Docker Desktop must itself start after login; it is not a headless server service.

## Back Up and Restore

Keep backups outside this repository and copy them to another machine. Backups contain private user and recipe data. Stop the app while making a consistent backup:

```bash
mkdir -p backups
chmod 700 backups
docker compose stop kiosk
docker compose exec -T db sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysqldump -u root --single-transaction --no-tablespaces KIOSK' > backups/kiosk.sql
docker compose run --rm --no-deps --user root --entrypoint tar kiosk -czf - -C /photos . > backups/photos.tar.gz
docker compose start kiosk
```

Also back up `.env` securely. To restore into an initialized stack, stop the app and import your SQL backup (this replaces existing tables/data):

```bash
docker compose stop kiosk
docker compose exec -T db sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql -u root KIOSK' < backups/kiosk.sql
docker compose run --rm --no-deps --user root --volume kitchen-kiosk_photos:/restore --entrypoint tar kiosk -xzf - -C /restore < backups/photos.tar.gz
docker compose start kiosk
```

Restore photos into an empty volume to avoid retaining files absent from the backup. The volume name above assumes the default Compose project name `kitchen-kiosk`.

## Update

Back up first, read the release notes for any required database migrations, and keep your `.env`. On a clean checkout:

```bash
git pull --ff-only
docker compose build --pull kiosk
docker compose pull db
docker compose up -d --wait --wait-timeout 300
docker compose logs --tail=100
```

Existing data survives container replacement. The SQL initialization script does **not** run again against an existing database volume; future schema changes require the migration steps supplied with that release. Environment password changes do not alter existing MySQL accounts; retain the original credentials unless you also change them inside MySQL.

## Photos

The app does not upload photos. To add files to the persistent photo volume, create a local `photos` folder with subfolders such as `1 - Apple Pie`, then copy its contents:

```bash
docker compose run --rm --no-deps --user root --volume kitchen-kiosk_photos:/destination --volume "$PWD/photos:/source:ro" --entrypoint sh kiosk -c 'cp -a /source/. /destination/ && chmod -R a+rX /destination/'
```

The running app reads this volume read-only. For an existing NAS directory, replace `photos:/photos:ro` in the Compose file with `/absolute/path/to/photos:/photos:ro`. That directory must be readable by the non-root container user (UID 1654).

## Remove or Reset

Remove containers but retain recipes, users, and photos:

```bash
docker compose down
```

**Permanently delete all recipes, users, and photos** (back up first):

```bash
docker compose down --volumes --rmi local
```

The next `docker compose up -d --build --wait` creates a fresh installation with the default admin password again. The `.env`, repository, and backups are not deleted by Docker. Do not remove volumes merely to troubleshoot a startup problem.

## Troubleshooting

Use `docker compose ps` and `docker compose logs --tail=100 db kiosk`. First-time MySQL setup can take several minutes. An unhealthy database can indicate failed initialization, insufficient disk space, or credentials changed in `.env` after the volume was created. A port conflict is fixed by changing `KIOSK_PORT` and running `docker compose up -d`.

Check the app after startup:

```bash
curl --fail http://localhost:5020/api/categories
```

Expect a JSON array, initially `[]`. Verify login, category and recipe creation, then run `docker compose down` followed by `docker compose up -d --wait` and confirm your recipe is still there. These are the acceptance checks for a new Docker installation.