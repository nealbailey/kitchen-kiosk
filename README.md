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

Update the connection string(s) in [Kiosk.Api/appsettings.json](Kiosk.Api/appsettings.json) (or `appsettings.Development.json`) to point at your MySQL instance before running the API.

## Web API (Kiosk.Api)

### Build

```bash
dotnet build Kiosk.Api/Kiosk.Api.csproj
```

### Run (Kestrel)

```bash
dotnet run --project ~/Code/github/kitchen-kiosk/Kiosk.Api/Kiosk.Api.csproj
```

The API endpoints will be available at:
* http://localhost:5000


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

