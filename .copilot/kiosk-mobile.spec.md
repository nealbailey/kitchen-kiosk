# Kitchen-Kiosk Mobile Specification and Development Plan

**Status:** Working plan for the first release  
**Companion document:** `kiosk-mobile.constitution.md`  
**Parent repository:** https://github.com/nealbailey/kitchen-kiosk

**Execution guide:** [Phased development plan](kiosk-mobile.plan.md), including
the confirmed 2026-10-22 decisions, Pop!_OS setup, phase dependencies, and evidence.
Use that guide for sequencing; this document retains the original detailed
feature/acceptance checklist. Its illustrative project layout is superseded by
the confirmed `Kiosk.Mobile/` layout in the execution guide.

This document is the actionable checklist for building and releasing Kitchen-Kiosk Mobile. Check off items as they are completed, record decisions where indicated, and revise the plan when repository inspection or testing changes an assumption.

## 1. Definition of Done

The first release is complete when all of the following are true:

- [ ] A release APK can be built reproducibly and installed on the target Android tablet.
- [ ] The app displays recipe data from local SQLite storage.
- [ ] Recipe search and category filtering work without a network connection.
- [ ] Recipe detail pages display all required fields, ingredients, instructions, and cached thumbnails.
- [ ] The Synchronize button downloads a complete current snapshot from the home-LAN API.
- [ ] Thumbnail downloads use the existing thumbnail API, not full-resolution image endpoints.
- [ ] A successful synchronization updates the active local data and reports the last successful sync.
- [ ] A failed or interrupted synchronization leaves the previous complete dataset usable.
- [ ] The app can be restarted and used in airplane mode after a successful sync.
- [ ] The app has no recipe create, update, delete, login, or account workflows.
- [ ] The app does not connect directly to MySQL.
- [ ] The setup, build, sync, and release steps are documented.

## 2. Phased Development Plan

## Phase 0 — Repository Reconnaissance and Decisions

**Goal:** Replace assumptions with verified facts before writing the sync contract.

- [ ] Clone or update the Kitchen-Kiosk repository locally.
- [ ] Identify the API, Domain, Data, and Web project structure and current build instructions.
- [ ] Inspect recipe domain models and database mappings.
- [ ] Identify category relationships and ordering.
- [ ] Identify ingredient models, quantities, units, ordering, and recipe relationships.
- [ ] Determine how instructions are stored, including any HTML or rich-text formatting.
- [ ] Identify how recipe photos are represented and whether a recipe can have multiple photos.
- [ ] Find the existing thumbnail endpoint and verify its exact route and parameters.
- [ ] Verify thumbnail response content type, default size, configurable width, and error behavior.
- [ ] Verify whether the thumbnail endpoint returns JPEG bytes and how the filename/ID is resolved.
- [ ] Identify current API pagination and expansion behavior.
- [ ] Confirm the LAN API base URL and HTTPS certificate behavior on the target Android version.
- [ ] Record the Android tablet model, Android version, screen resolution, and orientation preference.

**Deliverables**
- Confirmed model/endpoint notes.
- Confirmed tablet and LAN assumptions.
- List of fields that must be included in the mobile snapshot.

**Exit criteria:** No unresolved assumptions remain about required recipe fields or how photo thumbnails are fetched.

## Phase 1 — Development Environment and Android Build Proof

**Goal:** Prove that the development machine can produce and install a basic APK before implementing application features.

- [ ] Install Android Studio on the Pop!_OS development workstation.
- [ ] Install the Android SDK platform and build tools required by the selected Capacitor/Gradle versions.
- [ ] Install/configure a compatible JDK.
- [ ] Verify Node.js/npm compatibility with the selected Ionic/Angular version.
- [ ] Create a separate Ionic Angular project for Kitchen-Kiosk Mobile.
- [ ] Add and configure Capacitor.
- [ ] Add the Android platform.
- [ ] Build and run the starter application in an Android emulator.
- [ ] Connect the target tablet for debugging, or enable a suitable installation method.
- [ ] Build a debug APK and install it on the tablet.
- [ ] Record exact setup commands, versions, and troubleshooting notes.

**Deliverables**
- New mobile project.
- Basic app running on emulator and physical tablet.
- Repeatable local build instructions.

**Exit criteria:** A basic APK can be built and launched on the target tablet.

## Phase 2 — API Contract and Server Endpoint

**Goal:** Provide a stable, read-only data contract for a full local refresh.

- [ ] Define a versioned sync DTO based on actual domain models.
- [ ] Include every field required to list and display a recipe.
- [ ] Include stable IDs for recipes, categories, and ingredients where available.
- [ ] Preserve ingredient ordering and any required quantity/unit details.
- [ ] Preserve instruction ordering and supported formatting.
- [ ] Include photo metadata sufficient to request each thumbnail.
- [ ] Include a `schemaVersion` and generated/snapshot timestamp.
- [ ] Implement the dedicated read-only endpoint, tentatively `GET /api/mobile/sync`.
- [ ] Ensure the endpoint returns the complete required dataset and is not accidentally limited by normal recipe pagination.
- [ ] Ensure the endpoint does not return unnecessary full-resolution image data.
- [ ] Verify serialization of null/optional fields and recipes with no photos.
- [ ] Test empty, typical, and large recipe collections.
- [ ] Test API errors and response time.
- [ ] Document the endpoint contract and a representative response.
- [ ] Confirm no write endpoints are introduced for the mobile client.

**Deliverables**
- Read-only sync endpoint.
- Versioned JSON contract.
- API tests or a repeatable manual verification procedure.

**Exit criteria:** The endpoint reliably returns all required recipe data in one complete snapshot.

## Phase 3 — Mobile UI with Local/Sample Data

**Goal:** Build and validate the core tablet experience independently of synchronization.

- [ ] Establish the application navigation and visual style.
- [ ] Create a home/recipe browsing view.
- [ ] Create category filtering.
- [ ] Create local recipe search.
- [ ] Create a recipe detail view.
- [ ] Display ingredients in a readable ordered list.
- [ ] Display instructions with supported formatting.
- [ ] Add thumbnail display slots and a placeholder for recipes without images.
- [ ] Design tablet-friendly typography, spacing, and touch targets.
- [ ] Add loading, empty, no-results, and error states.
- [ ] Add a Synchronize button and a status area.
- [ ] Test portrait and landscape behavior if both orientations are supported.
- [ ] Confirm that browsing components do not directly call the API.

**Deliverables**
- Usable mobile interface backed by temporary/sample data.
- Agreed layout on the target tablet.

**Exit criteria:** A user can browse and read sample recipes comfortably without any server dependency.

## Phase 4 — SQLite and Local Thumbnail Storage

**Goal:** Make local storage the source of truth for the reading experience.

- [ ] Select and pin a maintained Capacitor-compatible SQLite plugin.
- [ ] Define the local schema for recipes, categories, ingredients, photo metadata, and sync metadata.
- [ ] Add database schema versioning/migration strategy.
- [ ] Use stable server IDs as local keys where available.
- [ ] Add repositories/services for local recipe queries.
- [ ] Implement local search and category filtering in the data layer.
- [ ] Select an application-private directory for cached thumbnails.
- [ ] Define deterministic local thumbnail filenames/keys that avoid unsafe server-provided paths.
- [ ] Ensure missing images have a safe placeholder.
- [ ] Ensure recipe browsing loads from SQLite and local files only.
- [ ] Persist data across app restarts and device reboots.
- [ ] Test a manually seeded local dataset with the network disabled.

**Deliverables**
- SQLite schema and data access layer.
- Local thumbnail cache.
- Recipe UI fully backed by local data.

**Exit criteria:** The app can be seeded with local data, restarted, and used entirely offline.

## Phase 5 — Full Synchronization Workflow

**Goal:** Safely replace the local snapshot with a complete server snapshot and its thumbnails.

- [ ] Implement the Synchronize button workflow.
- [ ] Verify the tablet can reach the configured API on the home LAN.
- [ ] Use HTTPS and validate the server certificate correctly.
- [ ] Fetch the sync JSON and validate status code, content type, schema version, and required fields.
- [ ] Prevent overlapping synchronization attempts.
- [ ] Show progress and a clear current status.
- [ ] Enumerate all referenced thumbnails from the snapshot.
- [ ] Download thumbnails from the existing thumbnail endpoint; evaluate the current server-configured width before proposing approximately 300 pixels. The endpoint has no per-request width parameter.
- [ ] Confirm requests return thumbnail JPEGs and do not fetch original images.
- [ ] Handle recipes with no image and any optional photo metadata.
- [ ] Store downloaded images in a staging directory.
- [ ] Build the new recipe dataset in a staging database or transaction.
- [ ] Verify all required downloads and data writes before activation.
- [ ] Activate the new database and image set only after successful validation.
- [ ] Preserve the prior active database and images if any required step fails.
- [ ] Clean up obsolete staged data safely after success or failure.
- [ ] Update last-successful-sync time only after activation succeeds.
- [ ] Report recipe count and a useful completion message.
- [ ] Test first-time sync, repeat sync with no changes, changed data, removed recipes, missing images, server errors, and interrupted downloads.

**Deliverables**
- Working end-to-end synchronization.
- Safe failure/recovery behavior.
- Sync status and timestamp.

**Exit criteria:** A complete refresh succeeds, and any simulated failure leaves the last-known-good dataset intact.

## Phase 6 — Offline, Reliability, and Usability Testing

**Goal:** Validate the app as a dependable family recipe book.

- [ ] Perform a successful sync on the home LAN.
- [ ] Enable airplane mode and browse all major views.
- [ ] Search recipes and filter categories offline.
- [ ] Open recipes with and without thumbnails.
- [ ] Restart the app offline and repeat the tests.
- [ ] Reboot the tablet and verify the dataset persists.
- [ ] Turn off or disconnect the API server and confirm local browsing still works.
- [ ] Interrupt synchronization during JSON download.
- [ ] Interrupt synchronization during thumbnail download.
- [ ] Simulate an invalid or incompatible schema version.
- [ ] Confirm failures never replace good data with a partial snapshot.
- [ ] Confirm no browsing screen makes network requests.
- [ ] Confirm no recipe mutation controls or flows exist.
- [ ] Verify large collections remain responsive.
- [ ] Check long titles, long ingredient lists, long instructions, special characters, and recipes with many photos.
- [ ] Verify thumbnail caching does not grow without bound across repeated full refreshes.
- [ ] Verify app behavior with low storage or failed file writes where practical.
- [ ] Review certificate errors and ensure TLS validation has not been disabled.

**Deliverables**
- Test results and a list of resolved defects.
- Release candidate accepted on the actual tablet.

**Exit criteria:** Offline browsing and failure recovery pass on the target hardware.

## Phase 7 — Release APK and Gift Preparation

**Goal:** Produce a reliable installable build and document how to refresh it later.

- [ ] Set application name, package ID, app icon, and version number.
- [ ] Remove debug-only settings, sample data, and development URLs.
- [ ] Configure the production LAN API URL.
- [ ] Build a signed release APK.
- [ ] Store signing-key material securely and back it up; never commit private signing keys to Git.
- [ ] Install the release APK on the target tablet using the intended installation process.
- [ ] Perform one final sync using the release build.
- [ ] Verify airplane-mode operation with the release build.
- [ ] Document APK installation and update steps.
- [ ] Document how the owner performs future synchronization at home.
- [ ] Document how to recover from a failed sync.
- [ ] Tag the release in Git and record dependency/tool versions.
- [ ] Keep a copy of the tested release APK and release notes.

**Deliverables**
- Signed APK.
- Release notes and repeatable build instructions.
- Simple user instructions for synchronization and offline use.

**Exit criteria:** The tablet is ready to hand over and can be updated/rebuilt later.

## 3. Suggested Local Project Structure

Adapt this structure to the Ionic/Angular conventions generated by the selected versions; it is a conceptual guide, not a requirement to force every file into these exact paths.

```text
kitchen-kiosk-mobile/
├── android/                 # Capacitor-generated Android project
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── api/         # Sync API client
│   │   │   ├── database/    # SQLite setup and migrations
│   │   │   ├── repositories/# Local data access
│   │   │   └── sync/        # Snapshot and thumbnail workflow
│   │   ├── features/
│   │   │   ├── recipes/     # Recipe list, search, details
│   │   │   └── categories/  # Category navigation/filtering
│   │   └── shared/          # Shared UI components and formatting
│   └── assets/
├── docs/
│   ├── kiosk-mobile.constitution.md
│   └── kiosk-mobile.spec.md
└── README.md
```

## 4. Proposed Data Contract Checklist

Confirm actual model details during Phase 0; do not assume this list is the exact existing schema.

### Snapshot envelope
- [ ] `schemaVersion`
- [ ] `generatedAt` or equivalent server snapshot timestamp
- [ ] `recipes` containing the complete recipe collection

### Recipe
- [ ] Stable recipe ID
- [ ] Title
- [ ] Description/summary, if supported
- [ ] Category ID and display name
- [ ] Instructions and supported formatting
- [ ] Any other existing fields required by the reading experience

### Ingredients
- [ ] Stable ID if available
- [ ] Recipe ID/relationship
- [ ] Display text or structured quantity, unit, and ingredient name as supported by the existing model
- [ ] Display order

### Photos
- [ ] Stable photo ID or a stable recipe/photo key
- [ ] Server filename/identifier required by the existing thumbnail endpoint
- [ ] Enough metadata to construct a validated thumbnail request
- [ ] No full-resolution image bytes in the snapshot JSON

### Sync status
- [ ] Last attempted sync
- [ ] Last successful sync
- [ ] Last known recipe count
- [ ] Last error message where appropriate

## 5. Test Matrix

| Scenario | Expected result |
|---|---|
| First sync succeeds | Full recipe set and thumbnails become available locally |
| Repeat sync succeeds | Active dataset refreshes cleanly; no duplicate records |
| API is unreachable | Clear error; previous local dataset remains usable |
| JSON is invalid | Snapshot rejected; previous dataset remains active |
| Unsupported schema version | Sync stops safely and reports incompatibility |
| Thumbnail request fails | Refresh does not activate an incomplete required image set; previous dataset remains active |
| Sync interrupted | Staging data is discarded or safely resumed; old dataset remains active |
| Recipe removed on server | Recipe disappears after the next successful full snapshot |
| App launched in airplane mode | Local recipe browsing works |
| App restarted offline | Local recipes and thumbnails remain available |
| Recipe has no thumbnail | Recipe remains readable with a placeholder |
| User searches offline | Results come from local data |
| User browses recipes | No network request is needed |
| User tries to find editing controls | No create/update/delete workflow is present |

**Confirmed 2026-10-22:** Every referenced thumbnail must download and validate
before activation. A failed required download preserves the previous snapshot.
Recipes intentionally declared to have no photo use placeholders.

## 6. Decisions Log

Record confirmed decisions here so future implementation sessions stay consistent.

| Topic | Current decision |
|---|---|
| Mobile technology | Ionic Angular + Capacitor |
| Primary development editor | VS Code |
| Project layout | Repository-root `Kiosk.Mobile/` with native `android/` subfolder |
| Android support | Android 13+ (minimum API 33); EM101A on Android 13, SM-P613/SM-T733 on Android 14, S23+ SM-S916U on Android 16; S22+ OS pending |
| Installation targets | Three tablets plus Galaxy S23+ and S22+ phones; detailed inventory and setup checks in the [execution guide](kiosk-mobile.plan.md#device-inventory-for-phase-1) |
| Gift preparation | Optional; no gift tablet selected. Personal installations are planned regardless |
| Primary tablet | Galaxy Tab S7 FE SM-T733, confirmed 2026-10-22 |
| Application identity | Kitchen Kiosk / `com.baileysoft.kiosk.mobile` |
| Orientation | Both orientations supported; landscape-first tablet design |
| Photo coverage | All recipe photo thumbnails, not only a cover thumbnail |
| API delivery sequence | Implement/test in development `Kiosk.Api`, approve/deploy compatible server changes first, then target live LAN API from APK for real-data/image integration; see execution guide for revised phase order |
| API base URL | `https://baileyfs02.baileysoft.lan/kiosk/api` |
| LAN certificate | Baileysoft LAN CA preinstalled on device; verify domain-scoped app trust in debug and signed release |
| Android tooling | Android Studio + Android SDK |
| Local data | SQLite |
| Synchronization | Explicit user-initiated full snapshot |
| Network location | Owner's home LAN only for v1 |
| Mobile writes | None |
| Image source | Existing thumbnail API |
| Image size | Evaluate existing server-configured width; ~300 px is a proposal, not a per-request option |
| Full-resolution photos | Never download |
| Failed sync | Keep last-known-good dataset |
| Background sync | Out of scope for v1 |
| Incremental sync | Out of scope for v1 |
| Release format | Signed Android APK |

## 7. Working Notes and Change Control

- Keep this plan updated as checkboxes are completed.
- Record decisions that change the constitution in the constitution document too.
- Do not begin a later phase if its dependencies are unresolved, unless the work is explicitly independent.
- Prefer small, buildable increments that can be tested on the emulator and target tablet.
- Verify source code and actual endpoint behavior before relying on illustrative routes, fields, or parameters.
- Keep credentials, signing keys, and private configuration out of source control.
