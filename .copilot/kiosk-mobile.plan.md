# Kitchen-Kiosk Mobile: Phased Development Plan

- **Status:** Debug APK installed and working on a phone (maintainer-reported 2026-11-12); functional user acceptance testing underway over the next few weeks.
- **Created:** 2026-10-22.
- **Deliverable:** A signed, sideloadable Android APK for an offline recipe reader.
- **Product rules:** [Mobile constitution](kiosk-mobile.constitution.md).
- **Feature/acceptance checklist:** [Mobile specification](kiosk-mobile.spec.md).
- **Repository context:** [Constitution](constitution.md) and [application specification](app.spec.md).

This is our execution guide: take one small milestone at a time, demonstrate it,
record the result, and then continue. The specification retains the detailed
feature checklist; this document owns phase sequencing, workstation setup,
dependencies, and evidence. No Android tools were installed and no APK was built
as part of writing this plan.

## 1. Confirmed decisions and remaining questions

Confirmed with the maintainer on 2026-10-22:

| Topic | Decision |
| --- | --- |
| Stack | Separate Ionic Angular application packaged using Capacitor; local SQLite; text-only v1 |
| Location | Repository-root `Kiosk.Mobile/`, with Capacitor's conventional lowercase `android/` inside |
| Editor | VS Code for everyday work; Android Studio for SDK/device management and native troubleshooting |
| Device support | Android 13 and newer; set the product minimum to API 33 |
| Available test devices | EM101A on Android 13; two Samsung tablets on Android 14; Galaxy S23+ on Android 16; S22+ OS pending confirmation |
| Primary tablet | Galaxy Tab S7 FE (SM-T733), confirmed 2026-10-22 |
| Orientation | First release is portrait-only (2026-11-12); supersedes the original landscape-first, both-orientations goal |
| Application identity | Kitchen Kiosk / `com.baileysoft.kiosk.mobile`, confirmed 2026-10-22 |
| API base | `https://recipes.baileysoft.lan/api` |
| Certificate prerequisite | Baileysoft LAN CA must already be installed on each device |
| Distribution | Signed APK, installed directly; no Play Store or paid cloud build service required |
| Scope | Read-only, no login/accounts or writes; automatic foreground manifest-based sync; offline browsing |
| Transfers | Complete lightweight ID/revision manifest and category catalog each sync; only new/changed recipe bodies; remove server-deleted recipes after successful sync |
| Availability | Throttled authenticated cached collection-revision checks on open/resume/connectivity changes; automatically synchronize available changes in the foreground; no background polling |
| Photos | All photo display/download/cache deferred from v1; photo indexing is separate future work |
| API-first delivery | Implement/test new endpoints in development `Kiosk.Api`, approve/deploy compatible release, then integrate APK against live text data; no photo dependency |
| Sync API contract | Version 1 approved and implemented locally (D-017): shared key header plus server switch, alphabetical ingredients, API-write invalidation only, single API process, about 500 recipes, 100-id batches |
| Mobile key supply | Maintainer-confirmed 2026-11-12 (D-020): embed the limited-scope shared key in the APK at build time from Git-ignored `Kiosk.Mobile/src/assets/mobile-connection.json`. After server-side revocation, restoring sync requires a rebuilt APK; an in-app prompt for a replacement key is deferred to a later phase |
| Status notifications | Maintainer-requested 2026-11-12: sync/status messages move off Home into a header notification bell next to the server chip. The bell always shows the latest message; a **!** indicator appears only for completed syncs and errors, never for merely going online/offline. Later the same day the server status chip was removed from the header; its state is now the first line of the bell panel |
| Orientation (first release) | Maintainer-requested 2026-11-12: lock the app to portrait with `android:screenOrientation="portrait"`. This supersedes the spec's both-orientations, landscape-first tablet goal for the first release; landscape is deferred. Android 16+ ignores the lock on screens 600 dp and wider for apps targeting SDK 36, but the current tablets run Android 13–14 |
| Manual refresh | Maintainer-requested 2026-11-12: a refresh button just left of the bell, shown only while the server is online, triggers a sync. Limited to 5 manual attempts per rolling 30 minutes to protect the server; automatic checks are not counted |

**Still to confirm before the relevant phase:** S22+ model variant/installed OS,
device display/WebView/ABI/storage measurements, approved server deployment
artifact/runtime and rollback procedure, exact installed Android Studio/JBR patch,
and final SQLite plugin approval. (How the mobile key is supplied was decided on
2026-11-12; see *Mobile key supply* above.) Android 13+ is a support target,
not a claim that untested future
Android versions already work.

### Device inventory for Phase 2

Captured 2026-10-22 from six tablet Settings photos, two S23+ Settings screenshots,
and the maintainer's phone list. This transcription is self-contained: the photos are
temporary, excluded from Git, and may be deleted after review. No serial numbers,
network addresses, account names, or incidental personal information are retained.
Settings values are observed reports, not independently verified hardware specs.

| Device | Model | Installed Android / API | Other software information captured | Planned test role |
| --- | --- | --- | --- | --- |
| Samsung Galaxy Tab S6 Lite | SM-P613 | Android 14 / API 34 | One UI 6.1; firmware suffix `P613XXS8CYE1`; Android security patch 2025-05-01; Google Play system update 2026-07-01 | Second Samsung tablet; layout, persistence, and regression checks |
| Samsung Galaxy Tab S7 FE | SM-T733 | Android 14 / API 34 | One UI 6.1; firmware suffix `T733XXS9DYF1`; Android security patch 2025-06-01; Google Play system update 2026-05-01 | Confirmed first build/install device and primary acceptance tablet |
| Generic tablet (manufacturer not established) | EM101A | Reports Android 13 64bit / API 33 expected | Build `863C_EM101A_20240329`; Android security update 2023-09-05; Google Play system update 2026-07-01 | Minimum-supported-OS device; prioritize native plugin, WebView, storage, and TLS compatibility |
| Samsung Galaxy S23+ | SM-S916U | Android 16 / API 36 | One UI 8.5; build `BP4A.251205.006.S916USQS8FZI1`; Android security patch 2026-09-05; Google Play system update 2026-08-01; WebView version pending | Confirmed Android 16 hardware; narrow-screen layout, rotation, touch, and offline checks |
| Samsung Galaxy S22+ | Exact model variant pending | Not supplied | OS, One UI, security patch, and WebView version pending | Spouse's phone; second phone acceptance and signed-update checks |

**Coverage:** Android 13, 14, and 16 hardware is now identified. Both Samsung
tablets run Android 14; the S23+ supplies Android 16 coverage. An API 36 emulator
is useful but no longer needed to fill that hardware gap. Samsung's displayed
**Knox API levels 37/40 are not Android API levels**; likewise, the S23+ kernel's
`android13` text does not override Settings' installed Android 16 version.
Keep the Android 13+ product minimum unchanged.

**Use and gifting:** All five devices are intended installation targets.
A Christmas gift installation is optional, and no gift tablet has been selected.
Gift preparation is a conditional release task, not a prerequisite for personal use.

**Not established by these images:** physical screen size/resolution/density,
RAM/free storage, supported CPU ABIs, current WebView provider/version,
USB debugging/desktop authorization, LAN CA installation, or app-level HTTPS trust.
The generic tablet's "64bit" label alone does not establish `arm64-v8a` support.
Do not infer these values from the model name or photograph dimensions.

Before installing a test APK:

- [x] Confirm the first test tablet: Tab S7 FE. Keep the generic tablet in the
  early compatibility pass rather than waiting until release.
- [ ] On each device, review available OS/security and WebView updates with the
  owner; record the resulting versions. The photographed Android security patch
  dates are older than the Google Play system update dates; those are separate
  update channels, not proof of matching security patch currency.
- [x] Identify Android 16 hardware: Galaxy S23+ SM-S916U.
- [ ] Capture the S22+'s exact model variant and installed Android version.
- [ ] For ADB-based installation or device queries, enable Developer options and
  USB debugging, connect with a data-capable cable, and approve this desktop's
  debugging prompt. ADB is optional when transferring and installing the APK
  manually. On Samsung, Developer options are normally unlocked by tapping Build
  number seven times under Settings > About tablet/phone > Software information.
- [ ] Once `adb` is available, query the device facts below and record a sanitized
  summary, not a raw device/identifier dump. Recheck after OS updates.
- [ ] Confirm enough free internal storage for both active and staged snapshots,
  a functioning WebView, LAN DNS, and the installed LAN CA on every sync device.

Planned read-only checks after Phase 2 SDK setup (not executed yet):

```bash
# Connect only the intended device, or select it locally with adb -s DEVICE_ID.
# Do not copy device identifiers into the shared inventory.
adb shell getprop ro.product.model
adb shell getprop ro.build.version.release
adb shell getprop ro.build.version.sdk
adb shell getprop ro.product.cpu.abilist
adb shell getprop ro.build.version.security_patch
adb shell wm size
adb shell wm density
adb shell dumpsys webviewupdate
adb shell df -h /data
```

Use the measured display size/density and actual WebView viewport for layout
testing. Install the same starter build on all three tablets and both phones
once each is authorized; record failures without treating one successful install
as five-device compatibility proof.

### Phase 0 workstation and compatibility record

Read-only checks performed 2026-10-22 on branch `dev-android-app`, HEAD `7fecdeb`.
No SDKs, dependencies, or system packages installed; no environment settings changed.

| Workstation check | Observed result |
| --- | --- |
| OS / architecture | Pop!_OS 24.04 LTS / x86_64 |
| CPU | Intel Core i5-12400F; 12 logical CPUs; VT-x reported |
| Memory | 31 GiB total; about 20 GiB available at observation |
| Repository filesystem | About 1.3 TiB available |
| Emulator acceleration | `/dev/kvm` exists and is readable/writable by this user; emulator acceleration itself not run |
| Node / npm | Node 22.22.3 via existing nvm installation / npm 10.9.8 |
| .NET SDK | 10.0.113 selected by repository |
| Java / Android CLI tools (rechecked 2026-11-10) | Android Studio Rabbit 2 2026.2.2 Patch 1 and Temurin JDK 21.0.13+9 installed under `~/opt`; SDK tools are under `~/Android/Sdk`; ADB 37.0.1 and Emulator 37.2.13 are available there |
| Android SDK | `~/Android/Sdk` contains Platform 36/37, Build-Tools 35.0.0/36.0.0, Platform-Tools, Command-line Tools, Emulator, and an API 37 Google Play x86_64 image |
| Environment | `JAVA_HOME`, `ANDROID_HOME`, and `ANDROID_SDK_ROOT` unset |

This is enough capacity to proceed with local builds and an x86_64 emulator.
Absence from PATH/common locations is not a full filesystem audit.

**Selected scaffolding baseline:** Registry metadata and tagged upstream sources
were checked together on 2026-10-22. These are exact candidate pins for Phase 2,
not installed packages or proof of a successful combined build. Keep mobile
dependencies isolated from the existing Angular 18 web app. Resolve and commit
the lockfile during scaffolding; stop if the generated starter conflicts.

| Component | Selected version / constraint | Evidence / installation note |
| --- | --- | --- |
| Node / npm | Reuse 22.22.3 / 10.9.8 | Installed Node meets Angular CLI's `^22.22.3` and Capacitor CLI's `>=22` engines |
| Ionic Angular | 9.0.9 | Published peers accept Angular >=18 and RxJS >=7.5 |
| Angular framework / compiler | 22.2.3 | Published framework/compiler versions align |
| Angular CLI / build tooling | 22.2.4 | Build tooling accepts Angular 22 and TypeScript >=6.0 <6.1 |
| TypeScript / RxJS | 6.0.3 / 7.8.2 | Compatible with inspected Angular compiler and Ionic peer ranges; do not install TypeScript 7 just because it is latest |
| Ionic CLI / Angular toolkit | 7.2.1 / 13.0.0 | Use versioned CLI; toolkit peers accept Angular schematics/devkit >=21 <23 and TypeScript <6.1 |
| Capacitor core / CLI / Android | 8.5.3 for all three | Keep these aligned; tagged Android library uses Java 21 and SDK 36 |
| SQLite candidate | `@capacitor-community/sqlite` 8.1.1 | Peer requires Capacitor >=8; tagged Android build uses Java 21, AGP 8.13.0, compile SDK 36 |
| Filesystem (deferred) | `@capacitor/filesystem` 8.1.5 was inspected | Not needed for v1 photo caching; do not install solely for deferred images |
| Java | JDK 21 | Required by Capacitor/SQLite Java source level. Android Studio Rabbit 2 currently bundles JBR 25, so Gradle must use the separately installed Temurin 21 at `~/opt/jdk-21.0.13+9` |
| Android Studio | Android Studio Rabbit 2 2026.2.2 Patch 1 | Installed locally from the official Linux archive after matching its published SHA-256; set the Gradle JDK to Temurin 21 |
| Android Gradle Plugin / wrapper | 8.13.0 / 8.14.3 | Tagged Capacitor library/template defaults; wrapper version is not the AGP version |
| Minimum / compile / target SDK | 33 / 36 / 36 | Product floor Android 13; compile/target Android 16 |
| SDK packages | Platform 36, Build-Tools 35.0.0, Platform-Tools, Command-line Tools; Emulator/image optional | Build-Tools 35.0.0 is AGP 8.13's default, independent of compile SDK 36; verify generated project requirements before installing extras |

**SQLite selection caveat:** The candidate includes SQLCipher native libraries
even when used with an unencrypted database. Its README flags encryption export
compliance considerations. Review that notice and native packaging/device
compatibility before final plugin approval; do not silently assume that disabling
database encryption removes the bundled library. No accounts or biometric
features are needed. Browser emulation packages are not required for an
Android-only SQLite proof.

### Phase 0 server and data reconnaissance

- Maintainer confirms the full `release-mysql` branch is deployed at
  `https://recipes.baileysoft.lan`. Development may use the development
  `Kiosk.Api` while new endpoints are added. The revised delivery sequence is
  API-first: test locally, approve and deploy the server changes, then target the
  live LAN API from the APK. The later text-only amendment removes photo
  availability as a dependency but retains API-first delivery.
  Agreement on this sequence is not authorization to change production immediately.
- Desktop `curl` to `/kiosk/api/categories` returned HTTP 200 with TLS
  verification result 0. A separate verified TLS handshake succeeded using
  TLS 1.3. Response recipe data was not saved. This confirms desktop connectivity
  and trust only, not the deployed commit/runtime or Android app trust.
- A separate device-facing development HTTPS server is no longer required for
  the main integration path. Use the confirmed live `/kiosk/api` base after the
  operations are deployed. Local tests use synthetic text datasets; v1 live
  verification covers availability, manifests, and recipe bodies, not images.
  If a development-device URL is later needed, configure it explicitly: device
  `localhost` is not this desktop, and the development prefix may differ.
- Source inspection confirms recipe list queries paginate; the full manifest must
  use an explicit complete query, not a large guessed page size. Categories have
  stable IDs and primary/additional relationships; category listing sorts by name,
  but per-recipe category queries do not define ordering.
- Ingredient keys are `(Ingredient, RecId)` and queries have no `OrderBy`; there
  is no persisted authored sequence, quantity/unit breakdown, or independent ID.
  Ingredient ordering remains a contract decision before Phase 1. Do not promise
  original author order or introduce a database migration without agreement.
- Photo enumeration can return many files, has no defined ordering, and emits
  a filename-less entry for a missing directory. Its existing error handling can
  return an empty list on filesystem failures. This is future photo-design
  evidence, not a v1 implementation task. Mobile availability, manifest, and
  body paths must perform zero photo enumeration and emit no photo metadata.
- Source inspection confirms recipe edits set `Date` to UTC now, but creation
  preserves a supplied date and deletion physically removes rows. Dates are not
  a safe sole change cursor. Revision coverage must include text, ingredients,
  category relationships, and category catalog changes independently of dates.

**Future photo work (proposal only):** Index photo metadata in the database
(recipe ID, stable photo key/path, content revision/hash, availability), with an
explicit/scheduled NAS reconciliation process that detects additions, replacements,
and deletions. Sync would query that index rather than enumerate every directory.
An index still needs a reliable refresh process; it does not discover external
NAS edits by itself. Do not implement migrations, scans, or watchers for mobile v1.

**Resource caveat:** A small manifest reduces network transfer, not necessarily
server database work. Computing content revisions on demand may still read all
mobile-visible text. Status must return a cached collection revision, not recompute
all hashes on every phone check. Phase 1 must define invalidation after relevant
successful API writes, coalesced rebuilds, bounded external-database-edit refresh,
and restart/multi-instance behavior. Cold/stale/pending state is explicit rather
than falsely "up to date". Retain request bounds and concurrency/rate controls.

**Phase 0 readiness:** Desktop prerequisites, hardware OS coverage, application
identity, primary tablet, orientation, and photo scope are established. API work
in Phase 1 is next; Phase 2 tool setup may proceed independently. Device
measurements require Phase 2 `adb`; approved API deployment, ingredient ordering,
manifest/body consistency, access-control details, and SQLite approval remain explicit
gates for their respective integration phases rather than claimed completions.

### Repository facts already inspected

- The existing web app and API remain separate from the mobile source. Do not
  replace the web UI, change its npm dependencies, or write mobile assets into
  the API's `wwwroot`.
- The current root npm manifest contains an older Angular CLI dependency. Use
  mobile-local tooling and commands from `Kiosk.Mobile/`, not that root CLI.
- Recipe models have a primary category and additional category mappings.
  Ingredients currently expose recipe ID and text, not separate quantity/unit
  fields, ingredient IDs, or an explicit ordering property. Verify repository
  queries before promising an order; do not invent missing source fields.
- Instructions contain HTML. Mobile rendering needs sanitization and an explicit
  policy for links/embedded resources so browsing cannot fetch remote content.
- Current photo routes are `GET /api/photos/{recipeId}` for metadata and
  `GET /api/photos/{recipeId}/thumb/{encodedFileName}` for JPEG thumbnails.
  Thumbnail width is a **server configuration** setting,
  `AppSettings:photosThumbWidth` (documented default 200, allowed 50-2000),
  not a query parameter. These are deferred photo facts; do not change shared
  thumbnail settings for text-only mobile v1.
- `/api/mobile/sync` remains a proposed route family, not an implemented or
  finalized full-snapshot endpoint. Phase 1 must define separate lightweight
  availability, authoritative manifest/categories, and bounded body operations,
  retaining the live `/kiosk/api` prefix.

## 2. Project layout

```text
kitchen-kiosk/
  .copilot/
    kiosk-mobile.constitution.md
    kiosk-mobile.spec.md
    kiosk-mobile.plan.md
  Kiosk.Api/                    # Existing server; new read-only endpoint here
  Kiosk.Web/                    # Existing web app, unchanged by scaffolding
  Kiosk.Mobile/                 # New independent npm project
    package.json
    package-lock.json
    capacitor.config.ts
    ionic.config.json
    src/
      app/
        core/                   # API, local database/files, sync services
        features/               # Browse, recipe detail, synchronization
        shared/                 # Only genuinely shared UI/helpers
      assets/
    android/                    # Native Android project; commit source/config
      gradlew
      app/
    README.md                   # Verified setup/build/install instructions
```

Follow the selected generator's actual conventions rather than forcing every
illustrative subfolder into existence. `android/` is initially generated but its
native source/configuration must be versioned, including certificate trust and
minimum SDK changes. Ignore SDK paths, Gradle/build caches, node_modules, signing
keys, passwords, and generated APKs. No iOS project or .NET MAUI workload is needed.

## 3. How we will work together

1. Start a session by selecting the next unchecked task whose dependencies pass.
2. Explain unfamiliar Android concepts before asking the maintainer to configure
   them. Identify which steps need a GUI, administrator permission, or a device.
3. Make one demonstrable increment; use VS Code's terminal wherever practical.
4. Record the exact command, tool versions, device/build variant, result, and any
   blocker in section 7. Check tasks off only after their exit gate passes.
5. Stop at unresolved decisions, failed gates, or production-impacting changes.
   Do not silently alter TLS policy, deploy the server, or bypass failed tests.

Prefer vertical milestones over building all layers before trying an APK.
The critical path is **0 -> 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7**, with API
implementation and approved deployment in Phase 1. Phase 2 tool setup can run
independently while API work is underway, and Phase 4 UI work can use fixtures
after contract agreement. Phase 3's live integration requires both Phase 2's
starter app and Phase 1's deployed operations. V1 is text-only; image display,
transfer/cache, and NAS indexing require a separate future scope decision.

## 4. Phases and exit gates

**Checklist reconciliation (2026-11-12):** Every phase bullet was reviewed
against source, tracked files, and the evidence in section 7. Checked items
mean the stated implementation or verification is complete at the scope
described, not that every device or release variant passed. Mixed items are
split or annotated so completed work is visible without hiding remaining
tests. Phone operation is maintainer-reported; UAT is ongoing. No new runtime
tests were performed for this documentation review.

### Phase 0 - Confirm the baseline and compatibility choices

**Goal:** Know what we are targeting before installing or generating anything.

- [x] Record desktop CPU architecture, RAM, free disk, virtualization capability,
  existing Node/npm/.NET versions, and any existing Java/Android tools.
- [x] Transcribe the three tablets' model/OS/software information and register the
  two phone targets (see device inventory; images no longer required).
- [ ] Finish device measurements and S22+ inventory: screen sizes, USB availability,
  Android System WebView versions, CPU ABIs, and storage. Primary tablet is confirmed.
- [x] Confirm orientation: portrait-only for the first release (2026-11-12);
  landscape support is deferred.
- [x] Review current Ionic/Angular, Capacitor, SQLite plugin, Node, JDK,
  Android Gradle Plugin (AGP), and SDK compatibility as one version matrix.
  Exact versions and successful combined debug builds are recorded in section 7.
- [ ] Approve the SQLite candidate after reviewing its SQLCipher notice and
  verifying native device packaging in the local-storage proof.
- [x] Choose application name/ID: Kitchen Kiosk / `com.baileysoft.kiosk.mobile`.
- [x] Apply `minSdk` 33 and compile/target SDK 36 during scaffolding;
  Minimum supported Android and compile/target SDK are different settings.
- [x] Confirm production LAN route and desktop TLS access; maintainer confirms
  production `release-mysql` and development `Kiosk.Api` as endpoint work target.
- [x] Verify the approved deployed availability/manifest/body operations at the
  existing LAN HTTPS base before Phase 3; no separate dev-device URL is required.
- [x] Finalize text revision coverage, source ordering, optional fields, complete
  manifest semantics, and concurrent-change behavior; photo work is deferred.

**Exit gate:** Device inventory and version matrix recorded; unresolved server
or UX decisions have owners. Existing web/API behavior remains unchanged.

### Phase 1 - Implement and verify the manifest-based text sync contract

**Goal:** Deliver bounded, read-only text synchronization without photo/NAS work
or changes to existing web/API contracts.

**Status 2026-10-23:** Contract version 1 implemented in `Kiosk.Api/MobileSync/`
and `MobileController`, documented in the
[API guide](../Kiosk.Api/README.md#mobile-sync-apimobile), and covered by 14
tests in `UnitTests/Api/MobileControllerTests.cs`. Recipe bodies include the
author username and recommended flag (D-018), verified against `kiosk_test`.
Full suite: 27 passed, 2 failed; both failures (`CategoryController_Create`, `Recipes_GetOne`) were present
before the change. A read-only local run against the development `kiosk_test`
MySQL database (one recipe) confirmed key rejection, status, manifest, and batch
body queries with matching revisions.

**Live smoke test 2026-10-23 (maintainer deployed with author/recommended):**
from the desktop over the LAN through `/kiosk/api` with the mobile key:
status 200 with sync enabled, 477 recipes, 22 categories, and the same
`collectionRevision` on repeated calls; manifest 46,902 bytes in 0.065 s;
a 3-id body request returned all three with `author` and `recommended`
populated; an unknown id returned in `missingIds`; a malformed id list returned
`400 invalid_request`; existing `/categories` still 200; a request without the
key returned `401`; and a favorite toggle in the web app changed
`collectionRevision` (`sha256-e401…`) and reverting it restored the original
(`sha256-511d…`). **Finding:** stored `instructions` are rich-text HTML
(`<p>`, `<strong>`, `<ol>/<ul>/<li>`, `<i>/<b>`, `<br />`, entities). Some
recipes use `&nbsp;` between every word, so the mobile reader must sanitize
HTML and normalize non-breaking spaces so text wraps (Phase 4).

The API milestone is delivered. The checklist below now distinguishes completed
contract work from broader tests and operational evidence not yet recorded.

- [x] Finalize versioned DTOs/routes for authenticated availability (no collection
  scan), complete recipe ID/revision manifest plus categories, and bounded
  requested-body retrieval. Exclude photos, user ids/emails, secrets, and host paths;
  include only author username and recommended flag (D-018).
- [x] Define deterministic revision coverage over all reader-visible recipe
  text, ingredients, and category relationships. Refresh category catalog even
  for category-only changes; do not use recipe `Date` as a sole high-water mark.
- [x] Define cached opaque collection revision covering the whole manifest and
  category catalog; status returns it cheaply. Wire invalidation after every
  relevant successful API write and serialize/coalesce rebuilds. Define direct-DB
  change freshness, restart/multiple-instance behavior, and pending/error status.
  Verify repeated unchanged checks perform no full collection scan/hash rebuild.
- [x] Define complete inventory/empty semantics, expected body revisions, bounded
  batching, retry limits, and coherent manifest/catalog validation under concurrent
  updates or deletion. SHA-256 content revisions are the approved protocol.
  Recheck consistency before commit; failure must preserve last-good local data.
- [x] Finalize dedicated key, server switch, fail-closed configuration, and
  rate/concurrency policies before implementing access. APK keys are extractable;
  do not claim app attestation or make existing public routes private by implication.
- [x] Implement using repository conventions and explicit HTTP errors, resource
  bounds, cancellation, and no recipe writes or photo/NAS dependencies.
- [ ] Test full inventory beyond normal pagination, first/no-change sync,
  backdated additions, tied dates, deleted recipes, category/ingredient-only edits,
  null/optional values, Unicode/HTML, invalid/incomplete requests, and races.
  **Partial:** API inventory/body/request tests and client first/no-change,
  deletion, malformed-manifest, category-refresh, and revision-mismatch tests
  exist. The full scenario list, including real cross-request races, is not
  verified; retain this broader acceptance item.
- [ ] Test collection revision stability, all relevant write invalidations,
  direct database refresh policy, cache cold/stale/failure behavior, and coalesced
  concurrent checks. Never return a misleading equal/current revision on failure.
  Assert zero photo enumeration calls. Use synthetic text fixtures locally.
  **Partial:** cached status, recipe/category/favorite invalidation, coalescing,
  pending writes, revision sensitivity, and no-photo dependency have API tests.
  Full cold/stale/failure and direct-database restart coverage is not recorded.
- [x] Document all operations and the concurrency protocol in the API guide. Run focused API
  tests and relevant regressions; distinguish existing baseline failures.
- [x] Deploy the approved endpoint to the LAN (maintainer-reported 2026-10-23,
  self-contained .NET 10); verify mobile operations and the existing categories
  endpoint through `/kiosk/api`. See live smoke evidence above.
- [x] Verify live full manifest/category counts and bounded body operations;
  record counts and request sizes without private text. The Android app also
  verified the current `https://recipes.baileysoft.lan/api` base on 2026-11-12.
- [ ] Record the exact deployed artifact/commit and deployment method, backup/
  rollback procedure and rollback rehearsal. Deployment success does not prove
  these operational checks were completed.

**Exit gate:** Approved deployed text operations are versioned, complete,
bounded, and tested under concurrent changes. No photo/NAS work; contract is
sufficient for subsequent offline-reader integration, not a domain-entity dump.

### Phase 2 - Set up Pop!_OS 24.04 and install a starter APK

**Goal:** Prove the complete local build/install loop before app features.

| Tool | Purpose and installation approach |
| --- | --- |
| Node.js + npm | Build Ionic/Angular and run Capacitor. Reuse a compatible existing Node installation; keep mobile dependencies local and locked. |
| Android Studio | Install the official Linux distribution and complete its setup wizard. Primarily our SDK/emulator control panel, not a required daily editor. |
| JDK | Prefer Android Studio's bundled compatible JDK/JBR. Point terminal Gradle and Android Studio at the same JDK; do not install a second Java version unless required. |
| Android SDK | Through SDK Manager: selected compile SDK platform, required Build-Tools, Command-line Tools, and Platform-Tools (`adb`). Accept licenses interactively. |
| Android Emulator | Optional for initial physical-device proof; install Emulator and a suitable system image when hardware virtualization is available. |
| Gradle wrapper | Supplied by the native project (`./gradlew`); do not install a separate global Gradle. |
| VS Code support | Angular Language Service and existing web/C# tools as useful. Mobile extensions are optional, not prerequisites for building. |
| Real device + USB cable | Enable Developer options and USB debugging, authorize this desktop, and verify `adb devices -l`. Resolve Linux udev/USB permissions if needed. |

- [x] Inspect the workstation and install missing build tools; document the
  actual Pop!_OS setup and verified toolchain in section 7.
  Full target-device measurements remain open in Phase 0.
- [x] Record SDK/JDK paths and verify the terminal toolchain. For this workstation,
  use `JAVA_HOME=~/opt/jdk-21.0.13+9` and `ANDROID_HOME=~/Android/Sdk`; the
  command-line tools work when those paths are supplied to the process.
- [x] Boot the existing `Medium_Phone_API_37.0` AVD. AVD install/launch is useful
  smoke coverage, but does not replace the required Android 13+ hardware test.
- [x] Scaffold Ionic Angular into `Kiosk.Mobile/` using compatible versioned
  tooling. Add Capacitor Android and set `minSdk` 33.
- [x] Commit the npm lockfile and native project source; configure focused ignore
  rules for Android local settings, outputs, signing material, and caches.
  Source and lockfile are tracked in `8d2f605`; subsequent local edits remain
  separate worktree changes.
- [x] Build the starter web assets, synchronize Capacitor, assemble a debug APK,
  and install/launch it in the API 37 emulator.
- [x] Transfer and install the debug APK on a physical phone; the maintainer
  reports it working and undergoing UAT on 2026-11-12. The exact phone model/OS
  and installed build are not yet recorded; do not infer S23+ coverage.
- [ ] Follow the device-inventory setup checks above. Demonstrate the first
  install on the agreed primary tablet, then smoke-test that same APK on the
  other two tablets and both phones as they become available.
- [x] Add clearly named mobile VS Code tasks without replacing API/Web tasks.
  Record a clean install/build sequence in the mobile README.

**Exit gate:** A starter APK launches on a real Android 13+ device. Repeating the
build from VS Code's terminal works without relying on Android Studio being open.
Record the other four device results separately; pending devices are not passes.

**Verified debug build loop** (requires the local key asset for live sync):

```bash
cd Kiosk.Mobile
npm ci                         # First checkout or lockfile/dependency changes
npm run build:preview -- --source-map=false
npx cap sync android           # Copy assets and synchronize native plugins
./android/gradlew -p android assembleDebug
adb -e install -r android/app/build/outputs/apk/debug/app-debug.apk
```

Use the JDK/SDK paths and worker limits in the mobile VS Code task or
[README](../Kiosk.Mobile/README.md). `adb -e` selects the emulator; direct phone
sideloading has also been reported successful.

`npx cap run android` can build/install/launch interactively after assets are
built. Browser preview is useful for layout but does not prove native SQLite,
certificate trust, or offline file access. Use Chrome remote WebView inspection
for debug builds and `adb logcat`/Android Studio for native errors. First-time
dependency/SDK downloads need internet; offline app use does not.

### Phase 3 - Prove LAN HTTPS from the actual Android app

**Goal:** Eliminate DNS, trust, proxy, and request-stack surprises early.

- [x] Confirm the Baileysoft LAN CA is installed as a CA certificate on the
  emulator, with successful hostname/TLS and LAN DNS verification. The observed
  CA expires in 2036; trust failure before installation is recorded in section 7.
  Per-device evidence remains part of acceptance.
- [x] Add Android Network Security Configuration referenced by the manifest.
  Permit the user-installed CA store for the exact LAN API hostname only;
  preserve certificate/hostname verification and disallow cleartext traffic.
  This must apply to release builds, not only `debug-overrides`.
- [x] Choose and test the actual request path (WebView fetch versus Capacitor
  native HTTP) for availability/manifest/body JSON. Record behavior on the selected
  versions; a browser's certificate acceptance is not app-level proof.
- [x] Resolve the CORS decision: mobile sync uses native `CapacitorHttp`,
  so no mobile WebView CORS expansion was needed. TLS validation stays enabled.
- [x] Fetch availability, manifest/categories, and bounded body responses using
  the configured API base exactly once. The historical server smoke test used
  `/kiosk/api`; the current Android build uses `/api`. JSON schema validation
  rejects HTML proxy/login responses rather than activating them as recipes.
- [x] Implement bounded authenticated availability checks on open/resume and
  connectivity changes, with timeout/debounce/no overlap and a lightweight recheck
  action. Compare cached server collection revision to the device's committed
  revision and automatically sync available changes while active, including the
  first download. The later approved UX uses the bell for status/errors and an
  online-only refresh icon (5 manual attempts per rolling 30 minutes), not the
  original prominent Sync/Download buttons. Equal-revision and offline checks
  are quiet. No periodic polling or background sync is configured.
- [ ] Test stale availability and connection loss after tapping Sync/after leaving
  the LAN. Revalidate on tap and preserve data on failure. Reachability is not
  LAN identity or authorization; LAN routing/firewall and TLS remain necessary.
  **Partial:** airplane-mode behavior and failed-transfer preservation have
  emulator/unit evidence; a real connection loss during manual sync and
  leaving-LAN acceptance remain open.
- [ ] Prove success with the CA installed and failure without valid trust, with
  an invalid hostname/certificate, and outside the LAN. Never use trust-all code,
  `curl -k` as acceptance evidence, or a release live-reload server URL.
  **Partial:** successful trust and missing-CA rejection are emulator-verified;
  invalid-hostname and outside-LAN cases remain open.
- [ ] Exercise a minimally signed release build as well as debug on available
  Android 13, 14, and 16 devices; keep the signing key safe from the start.

**Exit gate:** Debug and signed release builds reach the confirmed HTTPS API
through their real request stack, with valid trust and expected failure behavior.
No production API deployment changes occur without approval.

### Phase 4 - Build the reader on real local storage

**Goal:** A comfortable offline recipe book before network synchronization.

- [x] Integrate `@capacitor-community/sqlite` and prove native snapshot reads,
  writes, and persistence across force-stop/relaunch on the emulator.
  Final plugin approval/export-notice review remains open in Phase 0.
- [x] Define schema version 1 and the snapshot repository for recipes, categories,
  ingredients, committed collection revision, and last-success time. The actual
  design is one validated JSON snapshot row, transactionally replaced, rather
  than separate entity/staging tables. No schema upgrade has yet been needed.
- [x] Keep synthetic text fixtures confined to browser preview and unit tests;
  Android uses only its real SQLite data and never falls back to fixtures.
  The original proposed native fixture-seeding task was not needed for live proof.
- [x] Build list/detail navigation, local title search and category/author filters,
  author and recommended (thumbs-up) indicators on cards and details,
  ingredients and safe formatted instructions; no photo UI. Instructions are
  stored rich-text HTML (paragraphs, bold/italic, lists, `<br />`, entities):
  render through an allow-list sanitizer (no scripts, styles, links, or remote
  resources), and convert `&nbsp;`/U+00A0 to normal spaces so long lines wrap
  on phones.
- [ ] Provide first-launch/no-data, no-results, database-error,
  syncing, and sync-failure states. Automatic synchronization is foreground-only.
  **Partial:** empty/no-results and database/sync-error feedback exist; the
  startup "Your shelf is empty" flash while SQLite loads remains unresolved.
- [x] Implement phone-sized reader layouts, first-release portrait lock,
  fixed navigation, detail-at-top, and list-position restoration on Back.
  Emulator checks passed; phone operation is maintainer-reported.
- [ ] Complete font scaling, system-bar, Android system Back, and tablet layout
  acceptance. Landscape-first acceptance is deferred, not a first-release gate.
- [x] Prevent remote image, CSS, or instruction resources from making implicit
  network requests; text-only v1 has no image/file cache.
- [ ] Demonstrate restart/reboot persistence and browsing with the network off.
  **Partial:** force-stop/reopen in airplane mode passed on the emulator.
  Full reboot and target-device evidence remain open.

**Exit gate:** Native SQLite-backed browsing, filtering, and text details work
after an offline restart; reading requires no API or photo requests.

### Phase 5 - Implement transactional manifest-based synchronization

**Goal:** Automatic foreground refresh that cannot destroy the last good collection.

- [x] Add automatic synchronization and one manual refresh action with overlap
  prevention, progress/status feedback, timeouts, errors, and the manual limit.
- [x] Track last attempt in memory, last successful commit time in the snapshot,
  and active recipe count. Added/updated/removed counts appear in the bell.
- [ ] Expose last successful sync time and a clearly distinguished last attempt
  in the status UI. Current message time is not a last-success timestamp.
- [x] Validate JSON response shapes, contract version, IDs/revisions, manifest
  counts when matching status, category references, and required fields.
  JSON/schema parsing rejects non-JSON responses; an explicit HTTP Content-Type
  header check is not implemented.
- [x] Compare committed local revisions; fetch all bodies initially, then only
  missing/changed bodies in bounded batches. Unchanged sync fetches zero bodies.
- [x] Reuse validated unchanged local recipes; stage new/changed bodies in memory and
  authoritative deletions. Never infer a deletion from partial/failed inventory.
- [x] Validate expected revisions and the agreed concurrent-change protocol
  before activation. Changes during transfer require bounded retry or explicit
  failure, never mixed-version activation. Category-only changes must be covered.
- [x] Atomically commit the resulting recipes, deletions, categories, revisions, and last-success
  metadata plus the corresponding manifest collection revision in SQLite.
  Interrupted sync must not expose partial results or advance the revision.
  Never store a newer status revision without its data. Recheck availability after
  commit so changes made during sync can still indicate newer updates.
  One parameterized SQLite transaction replaces the complete snapshot row;
  store unit tests and live emulator first-sync/relaunch support this design.
  Interrupted-write/process-death behavior still requires device fault injection.
- [x] Avoid abandoned disk staging: staging is memory-only and is discarded on
  restart; the previous SQLite snapshot is never cleared to make room.
- [ ] Verify preservation under storage exhaustion, cancellation, and process
  death around commit. Failed transfer/schema/revision checks are unit-tested,
  but these native failure cases have not been exercised.
- [x] Report sync counts and errors and handle an authoritative empty inventory
  only by successful commit (unit-tested). Last-attempt/success display is the
  separate open UI item above.
- [x] Keep mobile sync text-only: no photo requests, metadata, cache, or NAS
  operations in the client path; sanitized instructions remove remote resources.
  API no-photo dependency and sanitizer behavior have tests.

**Exit gate:** First/repeat/changed/deleted/empty/no-change refreshes work; only
required bodies transfer and injected failures preserve a complete usable dataset.

### Phase 6 - Acceptance on Android 13, 14, and 16

**Goal:** Verify the gift experience, not just a successful compilation.

**Status:** Phone debug UAT is in progress (maintainer-reported). The bullets
below are acceptance coverage, not another list of missing implementation.
Unit/emulator results support progress but do not complete a multi-device
release-candidate test matrix.

- [ ] Run the specification's test matrix on release-candidate builds, including
  empty collection, many recipes/categories, long instructions, and special characters.
- [ ] Sync, enable airplane mode, force-stop/reopen, then reboot and read again.
  Force-stop/reopen offline passed on the emulator; reboot and release/device
  coverage remain open.
- [ ] Verify reading generates no content requests. The status request itself
  never downloads recipes; a changed revision intentionally starts automatic
  foreground sync (D-019). Inspect sanitized instructions for implicit
  image/style requests on the release candidate.
- [ ] Interrupt manifest/body downloads and kill the process around activation.
  Test malformed/incomplete manifests, unsupported schemas, TLS errors, full
  storage, and database failures.
- [ ] Confirm removed recipes disappear only after complete successful commit;
  repeat/no-change sync leaves no duplicates and transfers zero unchanged bodies.
  Deletion/empty behavior is unit-tested; live no-change sync is emulator-verified.
  Real edited/deleted recipes still need device acceptance.
- [ ] Test backdated/tied-date changes, category/ingredient-only changes, races
  between manifest/body operations, and leaving the LAN after availability succeeds.
- [ ] Test the approved bell/refresh UX on release-candidate devices: equal
  revisions and connectivity changes stay quiet; completed syncs/errors flag
  the bell; first-use sync is automatic. Check failed/pending states, revision
  persistence, and post-sync refresh races. Quiet/badge/manual-limit behavior
  already has unit and debug-emulator evidence.
- [ ] Confirm NAS/photo failures do not affect any mobile v1 operation.
- [ ] Check layout, touch targets, text scaling, rotation, Back, and WebView
  behavior on available phones/tablets; record device-specific results.
- [ ] Measure startup, search/filter response, first/incremental sync time,
  manifest/body transfer sizes, and disk usage on
  the actual collection; agree measurable usability thresholds before sign-off.
- [x] Record API regression baseline and relevant endpoint smoke results:
  the 2026-10-23 API suite had 27 passes and the same two known baseline failures;
  live categories continued returning 200 after deployment.
- [ ] Repeat relevant API/Web smoke checks for the final release candidate;
  do not treat the historical baseline as current full-regression acceptance.

**Exit gate:** Acceptance evidence on all five target devices and Android 13,
14, and 16 (physical device or identified emulator where necessary), no
data-loss defects, and maintainer approval on the primary tablet. Newer releases
need regression testing before being described as verified.

### Phase 7 - Signed APK, updates, and handover

**Goal:** Install the actual deliverable and make future rebuilds/updates possible.

- [x] Set app name/application ID and replace stock launcher/splash artwork
  with the branded fork-and-knife design; emulator-verified.
- [ ] Finalize release `versionName` and increasing `versionCode` (currently
  `0.0.1` / `1`); verify production packaging excludes browser preview fixtures,
  debug flags, and live-reload URLs. Keep the intentional domain-scoped LAN CA
  trust in release; do not remove it as though it were a debug-only workaround.
- [ ] Verify release logging does not expose the embedded mobile key; debug
  Capacitor HTTP logging currently does.
- [ ] Configure release signing with protected local secrets, not repository
  files or plaintext commands saved in shared documentation. Back up the keystore
  and credentials securely: updates require the same application ID and signing key.
- [ ] Build the release APK through the documented Gradle signing process.
  Verify its signature with SDK `apksigner`; record versions and APK checksum.
- [ ] Test fresh install, then an in-place signed release update with local data
  preserved. Debug/release signature differences may require uninstalling a debug
  build (which erases its data); use a separate debug application ID if appropriate.
- [ ] Install the final APK, synchronize at home, then repeat offline/reboot
  checks with that exact file. Retain the tested artifact outside Git.
- [x] Document debug build/USB install and direct sideloading, installer
  permission, same-signature update constraints, CA/LAN prerequisites, and sync
  failure/re-key recovery in the mobile README.
- [ ] Document the actual release rebuild/signing process and verify in-place
  updates with the backed-up release key. Debug instructions alone are not a
  release signing guide.
- [x] Explain that clearing app storage/uninstalling removes local recipes;
  the family can read offline away from home but must return to the LAN to refresh.
- [ ] Review release notes and tag only after approval. No store account, AAB,
  Firebase, or cloud service is required for this APK-only release.

**Exit gate:** Signed release installed and pre-synced on the selected personal
devices (and the gift device only if gifting is chosen),
offline acceptance passed, update path demonstrated, signing backup confirmed,
and owner-facing instructions available.

## 5. Early risks and guardrails

| Risk | Treatment |
| --- | --- |
| Installed CA is not automatically trusted by modern apps | Domain-scoped release trust configuration; Phase 3 real-device proof |
| WebView and native plugins behave differently | Native-device SQLite/network tests, not browser-only acceptance |
| Date-only sync misses changes/deletions | Complete manifest with revisions covering text/relationships; refresh categories |
| Manifest/body versions drift during transfer | Define consistency/expected-revision validation and bounded retry before transactional commit |
| Stale reachability or rejected key | Availability is only a hint; revalidate on tap, report errors, preserve offline data |
| Live server differs from development branch | Record/deploy approved server version; do not infer live capabilities |
| Large manifest or limited disk | Measure payloads and database work, bound batches, keep active data during staging |
| Device lacks virtualization/USB setup fails | Physical-device route or emulator alternative; troubleshoot permissions explicitly |
| Signing key is lost or changed | Secure backup and signed update rehearsal before handover |

## 6. Setup references

Consult these again when choosing versions; do not treat a changing website's
latest release as a tested project pin:

- [Capacitor environment setup](https://capacitorjs.com/docs/getting-started/environment-setup)
  (reviewed 2026-10-22: documents Node 22+, Android Studio, and a bundled JDK).
- [Capacitor Android workflow](https://capacitorjs.com/docs/android).
- [Android Studio Linux setup](https://developer.android.com/studio/install).
- [Android Network Security Configuration](https://developer.android.com/privacy-and-security/security-config)
  (modern apps do not trust user-added CAs by default).
- [Run on a hardware device](https://developer.android.com/studio/run/device).
- [Sign an Android app](https://developer.android.com/studio/publish/app-signing).
- [Angular runtime/compiler compatibility](https://angular.dev/reference/versions)
  and published npm package engines/peers (queried 2026-10-22).
- [Capacitor 8 Android requirements](https://capacitorjs.com/docs/updating/8-0),
  [tagged Java/SDK settings](https://github.com/ionic-team/capacitor/blob/8.5.3/android/capacitor/build.gradle),
  and [tagged Gradle wrapper](https://github.com/ionic-team/capacitor/blob/8.5.3/android-template/gradle/wrapper/gradle-wrapper.properties).
- [AGP 8.13 tool compatibility](https://developer.android.com/build/releases/agp-8-13-0-release-notes).
- [SQLite 8.1.1 README and SQLCipher notice](https://github.com/capacitor-community/sqlite/tree/v8.1.1)
  and [tagged Android build](https://github.com/capacitor-community/sqlite/blob/v8.1.1/android/build.gradle).

## 7. Progress and evidence

| Milestone | Status | Evidence / next step |
| --- | --- | --- |
| Planning | Revised | Text-only manifest scope retained; maintainer requested automatic synchronization on app open, replacing manual-only transfers |
| Phase 0 | Core decisions complete; device/compliance follow-up open | Toolchain, identity, portrait v1, text scope, live API, SDK settings, and revision/ingredient-order contract established. Device measurements, S22+ inventory, and SQLite/SQLCipher approval remain open |
| Phase 1 | Complete 2026-10-23 | Contract v1 (D-017, D-018) with 14 passing tests; deployed by maintainer; live status/manifest/body checks passed (477 recipes, 22 categories, 46.9 KB manifest in 0.065 s). Instructions are rich-text HTML; reader must sanitize and normalize `&nbsp;` |
| Phase 2 | Physical-phone installation reported; remaining coverage open | Debug APK builds and installs/launches in the API 37 emulator. Maintainer reports the debug app installed and working on a phone (2026-11-12); exact device/build evidence and other target installations remain open |
| Phases 3-5 | Core implementation complete; validation and UX gaps open | Native HTTP/TLS configuration, SQLite transactional snapshot, validation, bounded foreground/manual sync, and reader implemented. First sync (478 recipes), no-change, offline relaunch, and missing-CA rejection emulator-verified. Last-success/attempt status display, startup loading flash, broader device/release trust, reboot, and native fault injection remain open |
| Phase 6 | In progress | Maintainer began functional user acceptance testing on a phone with the debug app (2026-11-12), planned over the next few weeks; final acceptance and full device/matrix coverage remain pending |
| Phase 7 | Not complete | Signed release build, signing backup, and release update/acceptance checks remain pending |

### Remaining path to a release candidate

The debug implementation is in functional UAT, not at the starter/scaffolding
stage. A release candidate is the next delivery milestone if testing goes well;
a working debug APK is not yet a signed-release acceptance result.

1. Finish UAT and record the actual phone/build and individual outcomes. Include
   offline reboot, navigation, live incremental/deletion sync, and failure
   recovery; expand coverage to the primary tablet and remaining target devices.
2. Resolve the startup empty-state flash and expose last-successful-sync versus
   last-attempt information in the bell. These are existing first-release UX
   requirements, not completed by the current message timestamp.
3. Review the SQLite plugin's SQLCipher export/compliance notice and complete
   native interruption/low-storage checks. Capture startup/search/sync/storage
   measurements and agree acceptance thresholds.
4. Configure and securely back up a stable release signing key, finalize version
   numbers, build with production assets, and verify signature/checksum and that
   release logging does not reveal the embedded sync key.
5. Test the actual signed APK's TLS, first sync, offline/reboot behavior, and
   same-key update preserving local data. Document the signing/rebuild process,
   then obtain release approval before tagging/distributing.

The original all-five-device acceptance target remains in place. Narrowing that
target or deferring an existing gate needs an explicit maintainer decision; this
checklist review does not silently waive it.

For each completed milestone, add a concise result here: date, commands, exact
versions, device/Android version, debug or release variant, outcome, and remaining
limitations. Keep credentials and private recipe contents out of this record.

**Phase 2 progress (2026-11-10):** Generated the separate `Kiosk.Mobile/`
Ionic Angular app with Ionic CLI 7.2.1, Capacitor 8.5.3, Angular 22.2.3,
TypeScript 6.0.3, and an npm lockfile. Set application ID
`com.baileysoft.kiosk.mobile`, display name Kitchen Kiosk, and Android min/compile/
target SDK 33/36/36. `npm run build` passed; `npx cap add android` generated the
native project. `npm test -- --watch=false` passed (2 tests), and
`npm audit --omit=dev` reported no production dependency advisories. npm reports
19 findings in the full development dependency tree; review before release.
Node 22.22.3/npm 10.9.8 and ADB 37.0.1 are available. Android Studio Rabbit 2
2026.2.2 Patch 1 was installed under `~/opt/android-studio-2026.2.2.9` from the
official archive after SHA-256 verification; its bundled runtime is Java 25.
Temurin JDK 21.0.13+9 was installed under `~/opt/jdk-21.0.13+9` and verified.
The SDK under `~/Android/Sdk` contains Platform 36/37, Build-Tools 35.0.0/36.0.0,
Platform-Tools, Command-line Tools, Emulator 37.2.13, and the API 37 Google Play
x86_64 image. With JDK 21 and SDK paths supplied to the process,
`./gradlew assembleDebug` passed using Gradle 8.14.3; `apksigner verify` passed.
The debug APK installed on `emulator-5554` (`Medium_Phone_API_37.0`), launched,
and remained running (API 37). This is emulator smoke evidence, not physical
device acceptance. The latest `adb devices -l` lists only the emulator; Linux
`lsusb` does not enumerate the connected S23+ at this check.
Android Studio's first-run completion and Gradle JDK selection remain unverified;
the terminal build explicitly selected Temurin 21. Gradle emitted an SDK XML
version 4 compatibility warning but completed successfully.
See the [mobile setup guide](../Kiosk.Mobile/README.md).

**Sync progress (2026-11-12):** Native HTTP and an unencrypted SQLite snapshot
store have been wired to the reader. A foreground coordinator checks status and
downloads changed bodies automatically, validates before committing, and keeps
the previous snapshot on failure. Browser development uses synthetic fixtures;
Android never substitutes fixtures for missing data. `GOMAXPROCS=2
NG_BUILD_MAX_WORKERS=1 npm test -- --watch=false` passed 34 tests; `npm run lint`
passed. The API 37 debug APK built and launched, and the emulator created
`kiosk_recipesSQLite.db`; it displayed the unconfigured state. This proves
database initialization only, not a successful write, persistence, TLS trust,
or real-data synchronization. The connection file and mobile key were absent.
The SQLite plugin packages SQLCipher; native compatibility and its export notice
still require review before release. No physical-device acceptance is claimed.

**First live sync on the emulator (2026-11-12):** The maintainer provisioned the
limited-scope key. It was first saved at the `Kiosk.Mobile/` root, which is
neither packaged nor ignored. It was moved to the ignored
`src/assets/mobile-connection.json`, and `/mobile-connection.json` was added to
`Kiosk.Mobile/.gitignore` as a safeguard. The key
was validated with an authenticated host `GET /api/mobile/status` (HTTP 200,
contract 1, sync enabled, 478 recipes, 22 categories). It was never printed.
The VS Code *Build Preview APK* steps rebuilt the debug APK, and the packaged
`assets/public/assets/mobile-connection.json` was confirmed. The APK was installed on `emulator-5554`
(`Medium_Phone_API_37.0`, API 37). Observed results:

| Check | Result |
| --- | --- |
| Launch without LAN CA | Native `CapacitorHttp` status request failed closed: `SSLHandshakeException: Trust anchor for certification path not found`; empty shelf kept |
| Install CA | Public `BaileySoft LAN CA` (expires 2036) installed via Settings as a user CA; listed under *Trusted credentials > User* |
| First sync on relaunch | Status, manifest, five `POST /recipes` batches (100-id maximum), one SQLite snapshot write, post-commit status recheck. UI: "478 added, 0 updated, 0 removed", *Server online* |
| Force-stop, relaunch online | Only one status request; no manifest or bodies (equal revision) |
| Force-stop, relaunch in airplane mode | Recipes rendered from SQLite; *Unavailable* badge and sync-failure note; last saved data retained |
| Recipe detail | Author, recommended flag, ingredients, and sanitized ordered instructions rendered |

This is emulator debug-build evidence through the real native request stack.
It is not physical-device acceptance, signed-release, reboot, or Android 13/14/16
evidence. No code changed in this step. Unit tests were not rerun.

**Outstanding issues (2026-11-12):**

- Debug builds log full `CapacitorHttp` request data (including the
  `X-Kiosk-Mobile-Key` header) to logcat. Capacitor's default logging behavior
  should suppress this in release builds; verify before Phase 7 and consider
  `loggingBehavior: 'none'` if it does not.
- An automatic check that fails offline shows "Synchronization failed. Check LAN
  access and certificate trust…". The constitution asks for quiet unavailable
  status without alerts unless the user started the sync. Review the wording
  and prominence during Phase 3/6 UX acceptance. *Resolved later the same day by
  the notification bell; see below.*
- Key revocation currently strands installed apps on their last-good data until
  a rebuilt APK is installed. The in-app replacement-key prompt is deferred to a
  later phase (D-020) and is not part of v1 acceptance.
- Still pending: full physical-device acceptance (phone debug UAT subsequently started; see below; Tab S7 FE remains primary), signed
  release trust, reboot persistence, invalid-hostname/disabled/rate-limited
  cases, interrupted-transfer/process-death preservation, deletion and
  changed-body incremental syncs against live edits, SQLCipher export notice,
  and committing the mobile project and lockfile. *The source/lockfile commit
  item is now resolved by `8d2f605`; subsequent local edits remain uncommitted.*

**Notification bell (2026-11-12):** At the maintainer's request, the Home-page
status line was removed. All sync and status messages now appear in a bell
popover next to the server chip. `MobileApi` now classifies native transport
failures. Certificate/SSL errors become `tls_failed`, which is reported as an
error. Every other connection failure becomes `unreachable`, which is quiet, like
going offline. `RecipeLibrary` keeps the current message with its time, plus an
in-memory notice list (20 entries) and an `unread` flag. Only completed syncs and
errors set the flag; an identical repeat does not set it again. `npm test --
--watch=false` passed 40 tests (6 new), and `npm run lint` passed. On the API 37
emulator (debug):

| Check | Result |
| --- | --- |
| Relaunch, unchanged revision | No status text on Home; bell without indicator; panel shows *Recipes are up to date.* with time |
| Cleared app data, relaunch (first sync) | Bell shows **!**; panel shows "Recipes synchronized: 478 added, 0 updated, 0 removed."; indicator clears on open |
| Airplane mode while running, then relaunch offline | *Unavailable* chip, no indicator; panel shows "Home server not reachable. Downloaded recipes are still available." |
| Airplane mode off | Connectivity listener rechecked automatically; *Server online*, *Recipes are up to date.*, no indicator |

An inline `ion-popover` is moved to the app root, so the page theme variables
were also applied to `.notification-popover`. The `tls_failed` path is covered
by unit tests only; it was not repeated on the emulator.

**Outstanding (notifications):** Activity history is not persisted, so after a
restart only the current status is shown.

**Manual refresh (2026-11-12):** This closes the missing *Check for updates* gap.
`RecipeLibrary.refreshNow()` skips the automatic 30-second throttle. It is
capped at 5 attempts per rolling 30 minutes (`MANUAL_REFRESH_LIMIT`,
`MANUAL_REFRESH_WINDOW_MS`). Attempt times are persisted to `localStorage`, with
an in-memory fallback. A server `Retry-After` is now tracked separately, so
manual refreshes honor it too. Taps during a running check reuse that check and
are not counted. Hitting the limit records an error notice with the next
available time. `npm test -- --watch=false` passed 44 tests (4 new), and
`npm run lint` passed. On the API 37 emulator, the button appears between
*Server online* and the bell. Six taps about 3 s apart produced exactly 5
`/api/mobile/status` requests. The 6th tap dimmed the button, showed **!**, and
put "Manual refresh is limited to 5 times every 30 minutes. Try again after
10:40 AM." in the bell. After a force-stop and relaunch, the automatic launch
check ran and a manual tap was still blocked. Not yet observed on the device:
the button re-enabling when the window expires (unit-tested only) and its
behavior on the tablet layout. Remaining limitation: the cap applies only to
the button. Relaunching the app still triggers the normal automatic check;
server-side rate limiting remains the real protection.

**Header cleanup (2026-11-12):** At the maintainer's request, the server status
chip was removed. The bell panel now opens with "Home server: <state>", shown
with a green, amber, or red dot. The bell's aria-label carries the state, and
the refresh button sits just left of the bell. Tests (44) and lint passed. On
the emulator, the header shows only the brand, refresh, and bell. The online
panel showed "Home server: Online" with "Recipes are up to date.". In airplane
mode, the refresh button was hidden and the panel showed "Home server:
Unavailable" with the offline message. Earlier evidence in this section that
mentions the *Server online* chip predates this change. Follow-up: the label
now shows the configured API host name (`MobileApi.serverName()` reads the
hostname from `apiBase`). The line was then reordered to dot, state, then
host; the emulator panel shows "● Online: recipes.baileysoft.lan"; when the build is not configured, the label falls back to *Home server*.

**Portrait lock (2026-11-12):** The lock was added to `MainActivity`. On the
API 37 emulator with auto-rotate off and `user_rotation=1` (landscape), the
display stayed at `ROTATION_0` (1080x2400) and the app stayed portrait. Not yet
checked on the S23+ or the tablets. The Tab S7 FE (the primary tablet) will now
run in portrait.

**Launcher icon (2026-11-12):** At the maintainer's request, the stock
Capacitor icon was replaced with a cooking icon. It is an adaptive vector: a
white fork and knife (Ionicons `restaurant` glyph, MIT, matching the in-app
brand mark) on `#B94A1D`, with a monochrome layer for themed icons. The legacy
PNGs were regenerated, and the unreferenced `ic_launcher_foreground.png` files
were removed. The emulator app drawer shows the new icon. Follow-up the same
day: the stock Capacitor splash (blue "X" PNGs) was replaced. The new splash is
a `drawable/splash.xml` layer list (orange plus the fork-and-knife vector),
plus the Android 12+ splash attributes on the launch theme. A screen recording
of a cold launch on the emulator showed the orange fork-and-knife splash, then
the app, with no stock artwork. The same recording showed a pre-existing
"Your shelf is empty" flash for about 0.5 s while the SQLite snapshot loads;
it is not addressed yet.

**Reader scroll position (2026-11-12):** Recipe detail now opens at the top;
returning restores the list's prior scroll position and filters. On the API 37
debug emulator, scrolled Home and filtered search lists both returned to the
same visible cards after opening a recipe and using the in-app Back button.
`npm test -- --watch=false` passed 45 tests and `npm run lint` passed.
Physical-device and Android system Back acceptance remain pending.

**Category ordering (2026-11-12):** Category browsing and the search category
filter now sort by name instead of ID, for both saved recipes and browser
preview data. IDs and stored snapshot order are unchanged. Tests: 46 passed;
lint and the debug APK build passed. Device visual acceptance remains pending.

**Phone debug deployment and UAT (2026-11-12):** The maintainer reports the app
installed and working on a physical phone. Functional user acceptance testing
will continue over the next few weeks. This establishes a reported phone
installation and working debug app, not completion of the acceptance matrix.
The phone model/OS, installed APK version/checksum, and individual test outcomes
have not been recorded. Earlier notes describing physical installation as
entirely pending predate this report.

**Next step:** Collect UAT feedback and record reproducible defects and verified
outcomes as testing proceeds. Cover offline/restart/reboot behavior, navigation,
search/filtering, incremental/deletion sync, and failure recovery before final
acceptance. The Tab S7 FE remains the primary tablet acceptance device; broader
device coverage and signed-release validation remain open. Photo work remains deferred.