# kitchen-kiosk
Modern Next-Generation Recipe Management

This solution consists of two primary components:

1. **Kiosk.Api** — a .NET 9.0.203 Web API solution hosted in Kestrel, exposing recipe/category/authentication endpoints and connecting to a MySQL 8 `KIOSK` database.
2. **Kiosk.Web** — an Angular 18 / Node 22.22 single-page application that consumes the Web API.

## Prerequisites

* [.NET SDK 9.0.203](https://dotnet.microsoft.com/download) (see [global.json](global.json))
* [Node.js 22.22](https://nodejs.org/) and npm
* [Angular CLI 18](https://angular.dev/tools/cli)
* MySQL 8 server

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

