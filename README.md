# kitchen-kiosk
Modern Next-Generation Recipe Management

[![.NET 9](https://img.shields.io/badge/.NET-9.0-512BD4?logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![Angular 18](https://img.shields.io/badge/Angular-18-DD0031?logo=angular&logoColor=white)](https://angular.dev/)
[![TypeScript 5.4](https://img.shields.io/badge/TypeScript-5.4-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PrimeNG 18](https://img.shields.io/badge/PrimeNG-18-1976D2?logo=primeng&logoColor=white)](https://primeng.org/)
[![MySQL 8](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Apache HTTP Server](https://img.shields.io/badge/Apache-HTTP_Server-D22128?logo=apache&logoColor=white)](https://httpd.apache.org/)
[![Node.js build tool](https://img.shields.io/badge/Node.js-build_tool-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Angular CLI development tool](https://img.shields.io/badge/Angular_CLI-development_only-DD0031?logo=angular&logoColor=white)](https://angular.dev/tools/cli)

![Kitchen Kiosk screenshot](kk-screenshot.png)

This solution consists of two primary components:

1. **Kiosk.Api** — a .NET 9 Web API hosted in Kestrel, exposing recipe/category/authentication endpoints and connecting to a MySQL 8 `KIOSK` database.
2. **Kiosk.Web** — an Angular 18 single-page application that consumes the Web API. Node.js and Angular CLI are build/development tools, not runtime requirements for the published web application.

## Prerequisites

For development and builds:

* [.NET SDK 9.0.203](https://dotnet.microsoft.com/download) for the API (see [global.json](global.json))
* [Node.js](https://nodejs.org/) and npm for the Angular development server and production build
* [Angular CLI 18](https://angular.dev/tools/cli), available through the project's npm dependencies or installed globally
* MySQL 8 server for API data

For a deployed **web frontend**, Node.js, npm, Angular CLI, and `node_modules` are not required on the target web server. The production build is static HTML, JavaScript, CSS, and assets that Apache can serve directly. The API remains a separate service and still requires its .NET runtime and MySQL database wherever it is hosted.

## Database Setup

The API requires a MySQL 8 database named `KIOSK`. The schema is provided in the [Database](Database/) folder:

* [Database/20260807-KIOSK-SCHEMA-MYSQL.sql](Database/20260807-KIOSK-SCHEMA-MYSQL.sql)

Create the database and apply the schema, for example:

```bash
mysql -u <user> -p -e "CREATE DATABASE KIOSK;"
mysql -u <user> -p KIOSK < Database/20260807-KIOSK-SCHEMA-MYSQL.sql
```

Use the dedicated MySQL user `kiosk` with only the privileges the application needs on `KIOSK`. Supply its connection string through `ConnectionStrings__ConnStr`, as described below. Do not put passwords or JWT signing keys in checked-in JSON files.

## Web API (Kiosk.Api)

### Build

```bash
dotnet build Kiosk.Api/Kiosk.Api.csproj
```

### Run (Kestrel)

From the repository root, create a local secrets file from [dbg.env.example](dbg.env.example) if [dbg.env](dbg.env) does not already exist:

```bash
cp -n dbg.env.example dbg.env
chmod 600 dbg.env
```

Edit [dbg.env](dbg.env) locally: replace `MYSQL_HOST` and the password with your MySQL server and the new `kiosk` user's password. Set `JWT__Secret` to a cryptographically random signing key of at least 32 bytes (for example, generate one with `openssl rand -hex 32`). The migrated local file also preserves the legacy SQL Server connection strings; the API only uses `ConnectionStrings__ConnStr`, so those legacy entries can be removed when no longer needed.

Both VS Code .NET launch profiles load [dbg.env](dbg.env) automatically. For terminal runs, load it into the process environment first:

```bash
set -a
source ./dbg.env
set +a
dotnet run --project Kiosk.Api/Kiosk.Api.csproj --no-launch-profile
```

For live reload, use `dotnet watch --project Kiosk.Api/Kiosk.Api.csproj run --no-launch-profile` in the same shell. The VS Code watch task also inherits the environment if VS Code was started from that shell; unlike the debug launch profiles, tasks do not load the env file automatically.

The API endpoints will be available at http://localhost:5000.

The .NET default configuration provider maps double underscores to nested settings: `ConnectionStrings__ConnStr` overrides `ConnectionStrings:ConnStr`, and `JWT__Secret` overrides `JWT:Secret`. The API does not read env files itself; VS Code, the shell, or systemd must load them. All `*.env` files are ignored by Git; the example file contains placeholders only. Keep env files out of published artifacts and never commit real secrets, including in `appsettings.Development.json`.

### Linux daemon (systemd)

Use `kioskapi.service` for the service name. These instructions target Ubuntu 24.04 and a framework-dependent deployment. Install the ASP.NET Core 9 runtime using the [official Linux installation instructions](https://learn.microsoft.com/dotnet/core/install/linux-ubuntu-install). After configuring the appropriate package source:

```bash
sudo apt-get update
sudo apt-get install aspnetcore-runtime-9.0
/usr/bin/dotnet --list-runtimes
```

Confirm that `Microsoft.AspNetCore.App 9.0.x` is listed and `/usr/bin/dotnet` exists. Adjust `ExecStart` below if your runtime is installed elsewhere. The build machine needs the SDK; the daemon host only needs the runtime and access to MySQL.

Publish from the repository root and deploy the output. For an existing deployment, stop the running service before replacing its files (`sudo systemctl stop kestrel-kioskapi.service`, or `sudo systemctl stop kioskapi.service` after renaming).

```bash
dotnet publish Kiosk.Api/Kiosk.Api.csproj -c Release -o artifacts/kioskapi
sudo install -d -o root -g root -m 755 /var/www/aspnet/kioskapi
sudo cp -a artifacts/kioskapi/. /var/www/aspnet/kioskapi/
sudo chown -R root:root /var/www/aspnet/kioskapi
sudo chmod -R a+rX /var/www/aspnet/kioskapi
```

Create the production secrets file on the daemon host, not in the repository. Keep it readable only by root; systemd reads it before starting the process as `www-data`.

```bash
sudo install -d -o root -g root -m 700 /etc/kiosk
sudo touch /etc/kiosk/api.env
sudo chown root:root /etc/kiosk/api.env
sudo chmod 600 /etc/kiosk/api.env
sudoedit /etc/kiosk/api.env
```

Enter the following, replacing every placeholder with your production values:

```ini
ConnectionStrings__ConnStr='Server=MYSQL_HOST;Database=KIOSK;Uid=kiosk;Pwd=REPLACE_WITH_MYSQL_PASSWORD'
JWT__Secret='REPLACE_WITH_A_RANDOM_SIGNING_KEY_AT_LEAST_32_BYTES'
JWT__ValidAudience='https://YOUR_WEB_HOST'
JWT__ValidIssuer='https://YOUR_API_HOST/kioskapi'
AppSettings__photosPath='/path/to/food/photos'
```

Use `KEY=value` assignments without `export`. Quote values containing spaces or special characters; the quotes are not part of the value. This is a systemd environment file, not a shell script: shell expansion and commands such as `$(openssl ...)` are not evaluated. Generate the signing key separately and insert its value. Configure the photo directory for the host and give `www-data` the access needed for reading photos and writing uploads/thumbnails. Keep writable data outside the root-owned application directory.

Create `/etc/systemd/system/kioskapi.service` with `sudoedit`:

```ini
[Unit]
Description=Kitchen Kiosk API
Wants=network-online.target
After=network-online.target

[Service]
WorkingDirectory=/var/www/aspnet/kioskapi
ExecStart=/usr/bin/dotnet /var/www/aspnet/kioskapi/Kiosk.Api.dll
Restart=always
RestartSec=10
KillSignal=SIGINT
SyslogIdentifier=kioskapi
User=www-data
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=ASPNETCORE_URLS=http://127.0.0.1:5000
EnvironmentFile=/etc/kiosk/api.env

[Install]
WantedBy=multi-user.target
```

The required `EnvironmentFile` intentionally has no `-` prefix: a missing secrets file prevents startup. Kestrel listens on loopback; configure Apache or another reverse proxy to expose the API over HTTPS. Do not copy the development env file wholesale into production.

If migrating from `kestrel-kioskapi.service`, disable and stop the old unit before starting the new one so both services do not compete for the same port:

```bash
sudo systemctl disable --now kestrel-kioskapi.service
```

For both a new installation and a migration, validate, reload, enable, and start the new unit:

```bash
sudo systemd-analyze verify /etc/systemd/system/kioskapi.service
sudo systemctl daemon-reload
sudo systemctl enable --now kioskapi.service
sudo systemctl status kioskapi.service --no-pager
sudo journalctl -u kioskapi.service -n 50 --no-pager
curl --fail http://127.0.0.1:5000/api/recipes
```

After confirming the new service works, remove the obsolete unit and reload systemd:

```bash
sudo rm /etc/systemd/system/kestrel-kioskapi.service
sudo systemctl daemon-reload
```

Skip the old-service commands on a fresh installation. Update deployment scripts or monitoring that still use the old name. After editing `/etc/kiosk/api.env`, run `sudo systemctl restart kioskapi.service`; environment changes are loaded only when the process starts. If you change the unit itself, run `sudo systemctl daemon-reload` before restarting.

### Previously exposed secrets

Removing secrets from the current files does not remove them from Git history or earlier published builds. Treat the old SQL Server passwords and JWT signing key as compromised and rotate them; JWT key rotation invalidates existing tokens. The migrated [dbg.env](dbg.env) preserves the current values for local continuity, so update it with the rotated values as well as `/etc/kiosk/api.env`. Keep the newly created MySQL password private and revoke obsolete database credentials. If historical secrets must be removed, coordinate a separate Git history rewrite with all collaborators; history cleanup is not a substitute for rotation.


### Validate with curl

Once the API is running, verify it is serving requests, e.g. fetching all recipes:

```bash
curl http://localhost:5000/api/recipes
```

Authenticated endpoints require a `Bearer` token obtained from the `AuthenticateController` login endpoint, passed via the `Authorization` header:

```bash
curl http://localhost:5000/api/category/AddCategory \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer <token>' \
  --data '{ "category": "Testing" }'
```

## Angular Web App (Kiosk.Web)

### Install dependencies

```bash
cd Kiosk.Web
npm install
```

### Debug / local development

```bash
ng serve
```

Then browse to http://localhost:4200. By default the app is configured to call the API at http://localhost:5000 (see [Kiosk.Web/src/appSettings.ts](Kiosk.Web/src/appSettings.ts)).

### Production deployment build

```bash
ng build --configuration production --base-href /kioskweb/
```

This produces a deployable, optimized build rooted at the `/kioskweb/` base path, suitable for hosting under a sub-path of a web server.

Deploy the contents of `Kiosk.Web/dist/KioskWeb/` to the Apache document root or alias configured for `/kioskweb/`. Apache must serve the built `index.html` for application routes such as `/kioskweb/home` and `/kioskweb/recipe/123` (see [Kiosk.Web/web.config](Kiosk.Web/web.config) for the equivalent IIS rewrite configuration). The published frontend has no Node.js or Angular CLI process to run on Apache; it makes browser-side API requests to the URL configured in `Kiosk.Web/src/assets/config/app-settings.json`.

