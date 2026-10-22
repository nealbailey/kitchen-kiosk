# Kitchen Kiosk Application Specification

## Document status and evidence

- **Status:** Current implementation baseline, with limitations called out below.
- **Version:** 1.2.
- **Last reviewed:** 2026-10-22.
- **Governance:** [Project constitution](constitution.md).
- **Baseline:** Git HEAD `36fe1e9` plus the local .NET 10 migration and documentation
  changes from the 2026-10-22 working session. These changes were not committed
  when this specification was established.

This document summarizes source-backed behavior and available session results.
It does not claim to capture inaccessible earlier conversations. Detailed endpoint,
user, and deployment instructions remain in the linked guides.

**Development is not production:** This specification describes the working
`upgrade-dotnet-10` implementation. The maintainer identifies `release-mysql` as
the branch deployed on `baileysoft.lan`. As of the remote refresh on 2026-10-22,
that branch still targets .NET 9. The live server and its exact deployed commit,
runtime, and deployment method have not been independently inspected.

## 1. Product and users

Kitchen Kiosk is a self-hosted recipe-management system for browsing, searching,
creating, organizing, and maintaining recipes.

| User | Current capabilities |
| --- | --- |
| Anonymous visitor | Browse/search recipes, categories, ingredients, public user information, and recipe photos |
| Authenticated user | Create recipes, manage favorites, change their password, and edit/delete their own recipes |
| Administrator | Manage users and categories and edit/delete recipes regardless of ownership |

There is no photo-upload workflow. Photos are provisioned on the filesystem.
Do not infer multi-tenancy, private recipe collections, or cloud hosting from
the presence of user accounts.

## 2. Architecture and repository map

```text
Browser / API client
        |
Optional HTTPS reverse proxy
        |
Kiosk.Api: HTTP service, port 5020 by default
  |-- REST controllers under /api
  |-- Identity and JWT authentication
  |-- static Angular application from wwwroot
  |-- repositories / EF Core -------- MySQL
  `-- photo reader / SkiaSharp ------ provisioned photo directory
```

| Path | Responsibility |
| --- | --- |
| [Kiosk.Api](../Kiosk.Api/) | Hosting, controllers, authentication, configuration, static UI, and Swagger |
| [Kiosk.Data](../Kiosk.Data/) | EF contexts, repositories, query helpers, and image processing helpers |
| [Kiosk.Domain](../Kiosk.Domain/) | Shared domain models |
| [Kiosk.Web](../Kiosk.Web/) | Angular 18 / PrimeNG frontend |
| [UnitTests](../UnitTests/) | MSTest tests and ASP.NET TestServer infrastructure |
| [Database](../Database/) | MySQL schema/bootstrap SQL |
| [Dockerfile](../Dockerfile) / [Compose](../compose.yaml) | Container build and application/database deployment |
| [.vscode](../.vscode/) | Local build, publish, watch, and debug configuration |

The service uses the existing `Program` / `Startup` hosting structure and
repository abstractions. Production does not require a separate Node.js, Angular
dev server, or Apache installation. Apache/nginx may be used as a reverse proxy.

## 3. Runtime and dependency baseline

| Concern | Current choice |
| --- | --- |
| SDK | 10.0.113 with `latestFeature` roll-forward within .NET 10 |
| Target frameworks | `net10.0` for API, data, domain, and tests |
| ASP.NET JWT, Newtonsoft MVC integration, Systemd hosting | 10.0.13 packages |
| EF Core / Identity EF stores | 9.0.21 |
| MySQL EF provider | Pomelo 9.0.0 |
| Self-contained publish runtime | 10.0.13; default RID `linux-x64` |
| Image processing | SkiaSharp, including Linux native assets |
| Frontend build tooling | Node.js 22, npm, Angular 18, PrimeNG |
| Database | MySQL 8; Compose uses MySQL 8.4 |
| Backend tests | MSTest 3.11.1, VSTest SDK 17.14.1, TestHost 10.0.13 |

See [global.json](../global.json) and the project/package manifests for exact
versions. Pomelo's stable release supports EF Core 9, so EF and Identity stores
remain aligned on 9.x while running on .NET 10. The .NET 9 runtime is not required.
Do not upgrade EF or its Identity stores independently of provider compatibility.

## 4. Functional behavior

### Recipe workflows

- Browse recipe cards and open recipe details.
- Search by title or ingredients; filter by category, author, and favorites.
- Sort by title or date and page through results.
- View title, description, HTML instructions, ingredients, categories, owner,
  date, and photos.
- Create/edit recipes through the web UI and API.
- Require authentication for writes and enforce ownership or administrator access
  for recipe edits/deletion.
- Use GUIDs for user/owner identifiers.
- Default a new recipe's date to current UTC when omitted; update the date when
  updating a recipe, as described in the API guide.

### Accounts and administration

- Public login returns a JWT with a three-hour lifetime.
- Roles are `Admin` and `User`; user registration is administrator-controlled.
- Authenticated users can change their own password.
- Password policy requires at least six characters, uppercase and lowercase
  letters, a digit, and a symbol.
- Administrators manage users and recipe categories.
- Users owning recipes cannot be deleted; categories referenced by recipes
  cannot be deleted.
- The schema supplies an initial administrator. Follow the first-login guide and
  change the bootstrap password immediately; do not use it for normal operation.

### API conventions

- Routes are under `/api`; JSON output uses camelCase and input matching is
  case-insensitive.
- Recipe endpoints support shallow/expanded representations.
- Some responses use a `{ "status": "...", "message": "..." }` envelope.
- Existing business/error responses are not uniformly RESTful; preserve contracts
  unless an explicit compatibility change is approved.
- Swagger is available in Development, not enabled for Production by default.
- The [API guide](../Kiosk.Api/README.md) is the endpoint/payload reference;
  a [Postman collection](../Kiosk.Api/Kiosk.Api.postman_collection.json) is included.

### Photos

- Read files from the configured photo root; recipe directories begin with
  `<recipe id> `, conventionally `<recipe id> - <title>`.
- Provide photo listing, full-size JPEG responses, and JPEG thumbnails generated
  on demand.
- Default thumbnail width is 200 pixels, bounded to 50-2000.
- Reject photo filename path traversal in the controller.
- No application upload API or upload UI exists.
- Docker mounts photos read-only; administrators copy/provision files separately.

## 5. Hosting and configuration

Required settings are `ConnectionStrings:ConnStr` and `JWT:Secret`; startup fails
if either is missing. Environment variable overrides use `__` for `:`.

| Environment variable | Purpose |
| --- | --- |
| `ConnectionStrings__ConnStr` | MySQL connection string |
| `JWT__Secret` | Signing key; provision a random value of at least 32 bytes |
| `JWT__ValidIssuer`, `JWT__ValidAudience` | Token validation values; default `kitchen-kiosk` |
| `AppSettings__photosPath` | Provisioned photo root |
| `AppSettings__photosThumbWidth` | Thumbnail width |
| `ASPNETCORE_URLS` | HTTP listening address |
| `ASPNETCORE_ENVIRONMENT` | Environment, including Development-only Swagger/CORS |
| `PathBase` | Optional reverse-proxy prefix such as `/kiosk` |

Use ignored local environment settings or host configuration, not committed
secrets. See [configuration details](../Kiosk.Api/README.md#configuration).

The built UI and API share an origin in production. Angular deep links fall back
to the index page; unmatched API routes must remain 404. `PathBase` adjusts the
served index base URL for sub-path hosting. Forwarded headers are configured for
same-machine proxies; arbitrary remote proxies are not trusted automatically.
TLS termination belongs at the reverse proxy. Development CORS supports the
separate frontend development server.

## 6. Developer workflow

Prerequisites: the .NET 10 SDK selected by `global.json`, MySQL 8, and Node.js 22
when changing the frontend.

From the repository root:

```bash
dotnet --version
dotnet build KitchenKioskNGEN.sln
dotnet test UnitTests/UnitTests.csproj
```

Set up local settings using [the development guide](../README.md#development),
then:

```bash
set -a
source ./dbg.env
set +a
dotnet run --project Kiosk.Api/Kiosk.Api.csproj --no-launch-profile
```

The environment-file loading example uses Bash. Never copy actual settings into
shared notes. VS Code's **API + Web** compound launch starts the **API** and
**Web** debug configurations together and stops both when either service is
stopped. The API uses its build pre-task, the local environment file, and
`Kiosk.Api/bin/Debug/net10.0/linux-x64/Kiosk.Api.dll`, with the development URL
fixed to port 5020. The Web configuration runs the local Angular CLI on port 4200
and opens the default browser after compilation. Install frontend dependencies with
`npm ci` in `Kiosk.Web` before the first launch. Separate **API**, **Web**, and
**API Attach** entries remain available.

Frontend development:

```bash
cd Kiosk.Web
npm ci
npm start
# To rebuild the frontend served by the API:
npm run build:prod
```

The dev server uses port 4200 and calls the API on port 5020. Production frontend
builds write into `Kiosk.Api/wwwroot`; rebuild it when shipping UI changes.
Legacy test/lint scripts exist but their presence does not establish that they
currently pass.

## 7. Delivery and persistent data

### Native service

```bash
dotnet publish Kiosk.Api/Kiosk.Api.csproj -c Release -o artifacts/kiosk
```

Publish produces a self-contained Linux x64 executable plus required native
library/configuration/static files. Keep the output together. The host needs no
.NET installation. Native installation uses systemd and a protected environment
file; follow the [installation guide](../README.md#install).

### Docker Compose

- Multi-stage build uses Node 22 and the .NET 10 SDK; runtime dependencies use the
  .NET 10 Ubuntu Noble image.
- Compose runs the application and MySQL separately, with persistent database and
  photo volumes. MySQL is not published to the host.
- Application access defaults to localhost port 5020; LAN exposure is explicit.
- The container runs non-root; provision photos readable by UID 1654.
- [Setup script](../docker/setup.sh) creates private random secrets in `.env` and
  leaves an existing file unchanged.
- Schema initialization occurs only for a fresh database volume.
- Existing database passwords are not changed by editing environment variables.
- Back up the database, photos, and protected settings before upgrades.
- Docker startup remains documented as preview/unverified in this environment.
  Linux AMD64 is the supported Compose target; ARM is not verified/supported by
  this configuration. Alternate native publish RIDs require separate validation.

Use the [Docker quickstart](../quickstart.md) for setup, backup/restore, update,
proxy limitations, and explicit acceptance checks. Never remove volumes just to
troubleshoot.

## 8. Decision ledger

### Branch progression and delivery state

The maintainer supplied the branch progression below on 2026-10-22. Branch tips,
manifests, commit subjects, and ancestry were checked after `git fetch origin`.
These are historical snapshots, not promises that every old branch still builds.
Short hashes identify the reviewed state; branch names can move.

| Branch | Reviewed remote tip | Work represented | Delivery evidence |
| --- | --- | --- | --- |
| [`release-mssql`](https://github.com/nealbailey/kitchen-kiosk/tree/release-mssql) | `4f67fe9` (2026-08-10) | Original SQL Server lineage and older/basic Angular UI; Angular 13 / PrimeNG 13 at this tip. Earlier projects targeted .NET Core 3.1; this branch tip already targets .NET 9. | Historical baseline, not the current MySQL production branch. |
| [`dev-modern-ui`](https://github.com/nealbailey/kitchen-kiosk/tree/dev-modern-ui) | `57a823a` (2026-10-12) | Cumulative MySQL 8/.NET 9 baseline; Angular 18/PrimeNG 18, modern theme, filtering/infinite scrolling, administration, password change, rich-text recipe editing, and externalized configuration. | Integrated into `release-mysql` through #5 and #6. |
| [`dev-self-hosted`](https://github.com/nealbailey/kitchen-kiosk/tree/dev-self-hosted) | `4a41c58` (2026-10-13) | Replace separate web/API installations with API-hosted UI, self-contained single-file publishing, systemd integration, SkiaSharp, and proxy `PathBase` support. | Integrated into `release-mysql` through #7. |
| [`dev-docker`](https://github.com/nealbailey/kitchen-kiosk/tree/dev-docker) | `efa682e` (2026-10-14) | Multi-stage application image, Compose/MySQL stack, persistent volumes, generated-secret setup, and operational quickstart. | Integrated into `release-mysql` through #8; container runtime acceptance remains unverified here. |
| [`upgrade-dotnet-10`](https://github.com/nealbailey/kitchen-kiosk/tree/upgrade-dotnet-10) | `36fe1e9` (2026-10-14) | Local working changes upgrade projects, SDK, compatible packages, publishing, Docker images, and debug paths to .NET 10; shared documentation was added afterward. | Local build/publish/startup checks recorded below. Remote tip still matches the .NET 9 release snapshot; these changes are not committed/pushed or confirmed deployed. |
| [`release-mysql`](https://github.com/nealbailey/kitchen-kiosk/tree/release-mysql) | `36fe1e9` (2026-10-14) | Integration/release branch containing the MySQL, modern UI, self-hosting, and Docker work. | Maintainer-reported production branch on `baileysoft.lan`; exact live commit and deployment method unverified. |

The feature branches are cumulative. Git ancestry confirms
`release-mssql` -> `dev-modern-ui` -> `dev-self-hosted` -> `dev-docker` ->
the reviewed `release-mysql` tip. `release-mysql` is the integration/release line,
not a new feature phase after the .NET 10 work. The remote .NET 10 branch was
created from that release snapshot and has not yet diverged in committed history.

The local `release-mysql` branch was 30 commits behind its remote-tracking branch
when reviewed. Historical comparisons use freshly fetched `origin/*` refs, not
that stale local branch. No branch checkout, merge, reset, or production action
was performed for this review.

### Earlier migrations recovered from history

The high-level progression is useful, but some work originated before the branch
that now contains it:

| Date | Commit | Recorded change |
| --- | --- | --- |
| 2022-02-09 | `d130793` | Early inspected API/data/domain manifests use `netcoreapp3.1` (.NET Core 3.1), not ".NET Standard 3". |
| 2022-04-26 | `fc8f332` | Upgrade to .NET 6. |
| 2023-12-07 | `225f44b` | API upgrade to .NET 7 and homepage search; inspected later MSSQL snapshot still has .NET 6 data/domain targets. |
| 2026-08-10 | `b595374` | Upgrade API/data/domain to .NET 9, update SQL Server packages, pin SDK 9.0.203, and use the Linux x64 RID. This predates the MySQL migration. |
| 2026-08-11 | `00abfcc` | Migrate MSSQL 2016 to MySQL 8, replacing SQL Server provider/client dependencies with Pomelo. This is earlier migration-line work inherited by `dev-modern-ui`. |
| 2026-08-12 | `58a0545` | Fix deletion of recipes flagged as favorites. |
| 2026-08-18 to 2026-08-24 | `e2b2212`, `5b19f3c`, `5f3fc07`, `9358372` | Add recipe photo support, retrieval endpoints, thumbnails, and Angular photo display. |
| 2026-08-25 to 2026-08-26 | `3094d8e`, `169019d`, `2c2ac23` | Add category filtering, mobile layout improvements, and a fix for editing recipes owned by another user. |
| 2026-09-17 | `39ac4e0` | Integrate `dev-mysql` into the release line through #2. |
| 2026-09-18 | `32b394c`, `29f8af9`, `2bc33ea` | Upgrade Angular/PrimeNG to 18 with Node 22 tooling; integrate `dev-angular-upgrade` through #4. |
| 2026-09-22 to 2026-10-12 | `47fd0e6`, `004edf5`, `29a023c`, `71712d8`, `127641f`, `5846e42` | Modernize theme, infinite scrolling, filtering, administration, rich-text authoring, and environment-based secrets. |

The earlier `mysql-migration`, `dev-mysql`, and `dev-angular-upgrade` refs explain
why the modern UI branch contains migration work it did not originate. PrimeNG
also existed in the older Angular 13 baseline; the later work modernized its
version, theme, and workflows rather than introducing it for the first time.

### Accepted decisions and implementation milestones

Earlier entries are reconstructed from Git subjects, manifests, and current
implementation, not recovered transcripts. Dates describe recorded commits, not
necessarily the original discussion date. A commit establishes recorded work,
not independent runtime verification or evidence that an old defect stays fixed.

| ID | Date | Status | Decision and evidence |
| --- | --- | --- | --- |
| D-001 | 2026-09-25 to 2026-09-28 | Implemented baseline | Admin UI, password change, ownership-aware user deletion, and rich-text recipe creation; commits `71712d8`, `ce2efa4`, `ff9ccb6`, `127641f` and current user/API guides. |
| D-002 | 2026-10-12 | Implemented baseline | Move secrets to ignored environment settings; commit `5846e42` and current configuration guides. |
| D-003 | 2026-10-13 | Implemented baseline | Serve UI and API as one self-hosted application and use SkiaSharp rather than ImageSharp; commit `f5c2424` and current manifests. |
| D-004 | 2026-10-13 | Implemented baseline | Support reverse-proxy sub-path hosting through `PathBase`; commit `a2f75b1` and `Startup.cs`. |
| D-005 | 2026-10-14 | Implemented; deployment unverified | Add Docker/Compose setup with persistent data and generated secrets; commit `efa682e`, Dockerfile, Compose, setup script, and quickstart. |
| D-006 | 2026-10-22 | Implemented locally; build/startup verified | Move all projects to .NET 10 after machine SDK replacement broke the old SDK pin. Update SDK, ASP.NET packages, debug paths, Docker images, publish runtime, and docs together. |
| D-007 | 2026-10-22 | Accepted compatibility constraint | Keep EF Core/Identity stores on 9.0.21 with Pomelo 9.0.0 because no stable EF Core 10 provider was available when checked. |
| D-008 | 2026-10-22 | Adopted documentation workflow | Add shared constitution/specification and standard Copilot startup instructions at the maintainer's request; future developer notes require evidence/status review. |
| D-009 | 2026-08-11 | Implemented baseline | Replace MSSQL 2016 with MySQL 8/Pomelo; commit `00abfcc`, inherited through the migration and modern UI branches. |
| D-010 | 2026-09-18 | Implemented baseline | Upgrade Angular/PrimeNG to 18 with Node 22 tooling; commits `32b394c`, `29f8af9`, and merge `2bc33ea`. |
| D-011 | 2026-10-22 | Maintainer-confirmed release designation | `release-mysql` is the branch deployed on `baileysoft.lan`; this identifies the production line, not an independently verified live commit or confirmation of a .NET 10 rollout. |
| D-012 | 2026-10-22 | Implemented locally | Add an **API + Web** VS Code compound launch for one-step API debugging and Angular development, default-browser opening after compilation, and shared service shutdown; retain separate launch/attach entries. See `.vscode/launch.json` and the development guide. |
| D-013 | 2026-10-22 | Accepted mobile scope; implementation pending | Android 13+ app named Kitchen Kiosk (`com.baileysoft.kiosk.mobile`), both orientations with landscape-first tablet design, all photo thumbnails, primary acceptance on Tab S7 FE; S23+ supplies Android 16 hardware. New endpoints use development `Kiosk.Api`; maintainer reconfirms production `release-mysql` at `https://baileyfs02.baileysoft.lan/kiosk`. Desktop categories request returned HTTP 200 with verified TLS; Android trust, live commit/runtime, and mobile builds remain unverified. See [mobile execution plan](kiosk-mobile.plan.md). |
| D-014 | 2026-10-22 | Accepted delivery sequence; implementation pending | Prioritize mobile API implementation/testing and an explicitly approved compatible server deployment before APK/live sync integration, so the live photo collection is available. Local API tests use synthetic image fixtures; image synchronization is not deferred to final release. Replaces the development-device HTTPS requirement for the main path, not server-side development/testing or deployment approval. See [mobile execution plan](kiosk-mobile.plan.md). |

## 9. Validation record and known gaps

### Combined VS Code launch checks performed on 2026-10-22

- API build passed; the existing SwaggerUI package advisory remains.
- The configured API executable started with local environment settings on port
  5020; Swagger JSON returned HTTP 200.
- The configured Angular CLI command compiled on port 4200, matched the browser
  readiness pattern, and returned HTTP 200 with the application root.
- Compound configuration references and shared shutdown settings were checked.
  Interactive F5, browser opening, breakpoints, and debugger-driven shared
  shutdown were not exercised.

### .NET 10 migration checks performed on 2026-10-22

| Check | Observed result |
| --- | --- |
| SDK selection | `dotnet --version` selected 10.0.113 |
| Solution build | Passed, zero errors |
| Self-contained Release publish | Passed |
| Debug-output process startup with existing local settings | Passed on temporary port 15020 |
| Web root, Swagger JSON, categories API | Each returned HTTP 200 |
| Backend tests | 13 passed, 2 failed, 15 total |
| Original .NET 9 comparison | Same 13 passed / 2 failed using installed SDK 9.0.122 in an isolated copy; old SDK pin adjusted only in that copy |
| Patch whitespace check | Passed |

The migration also corrected an assertion comparing an owner GUID to a string
because the newer MSTest API requires compatible types. The two remaining
failures are `CategoryController_Create` (404 rather than expected 200) and
`Recipes_GetOne` (500 rather than expected 200). They also fail on the pre-migration
baseline and were intentionally not fixed as part of the runtime upgrade.

Known limitations and follow-up candidates, not approved implementation tasks:

- The complete backend suite is not green; investigate the two baseline failures.
- The authentication test includes a legacy non-asserting login check; passing
  test counts do not establish complete authentication coverage.
- Existing Swashbuckle SwaggerUI 6.2.3 produces a moderate-severity package
  advisory warning (`GHSA-qrmm-w75w-3wpx`); it was not upgraded in this migration.
- Existing TestServer/WebHost test usage produces .NET 10 deprecation warnings.
- Recipe-context sensitive data logging is enabled in `Startup.cs`; review its
  suitability before production use.
- Frontend test coverage is limited; legacy TSLint/Protractor tooling remains.
- No Docker runtime acceptance, browser end-to-end, interactive F5 breakpoint,
  alternate-platform, or production deployment verification was performed in the
  .NET 10 migration session.
- The maintainer reports an existing production deployment from `release-mysql`.
  Its exact deployed commit, runtime, deployment method, and operational checks
  remain unrecorded; do not equate the local .NET 10 baseline with that deployment.

## 10. Supporting documents and future intake

| Document | Role |
| --- | --- |
| [Constitution](constitution.md) | Engineering governance and document-intake process |
| [Main README](../README.md) | Onboarding, installation, developer commands |
| [API guide](../Kiosk.Api/README.md) | Configuration, routes, payloads, and error contracts |
| [Web guide](../Kiosk.Web/README.md) | User workflows and frontend instructions |
| [Docker quickstart](../quickstart.md) | Container operations and acceptance checks |
| [Copilot instructions](../.github/copilot-instructions.md) | Startup reading guidance for supported clients |
| [Mobile constitution](kiosk-mobile.constitution.md) | First-release companion-app product boundaries; not implemented functionality |
| [Mobile specification](kiosk-mobile.spec.md) | Mobile feature/acceptance checklist; implementation pending |
| [Mobile execution plan](kiosk-mobile.plan.md) | Phased Pop!_OS/VS Code setup, confirmed Android 13+ scope and LAN decisions, build/release gates; no APK verification yet |
| [Repository branches](https://github.com/nealbailey/kitchen-kiosk/branches) | Historical branch context; reviewed refs and migration milestones are recorded in section 8 |

Mobile notes were reviewed for planning on 2026-10-22; their proposed endpoint and
offline app are not part of the implemented baseline. Add reviewed notes to this
index as they arrive; mark drafts/proposals clearly
and incorporate accepted changes using the constitution's intake process.

### Specification revision record

| Version | Date | Change |
| --- | --- | --- |
| 1.0 | 2026-10-22 | Established the implementation baseline and .NET 10 session validation record. |
| 1.1 | 2026-10-22 | Incorporated maintainer-provided branch progression and production designation; verified remote ancestry and historical framework/database/UI milestones; separated local development from deployed release status. |
| 1.2 | 2026-10-22 | Indexed reviewed mobile product notes and the phased execution plan; kept planned mobile functionality distinct from the implemented baseline. |
