# Kitchen-Kiosk Mobile: Phased Development Plan

- **Status:** Agreed scope and layout; implementation not started.
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
| Orientation | Both orientations supported; landscape-first tablet design, confirmed 2026-10-22 |
| Application identity | Kitchen Kiosk / `com.baileysoft.kiosk.mobile`, confirmed 2026-10-22 |
| API base | `https://baileyfs02.baileysoft.lan/kiosk/api` |
| Certificate prerequisite | Baileysoft LAN CA must already be installed on each device |
| Distribution | Signed APK, installed directly; no Play Store or paid cloud build service required |
| Scope | Read-only, no login/accounts or writes; explicit manifest-based sync; offline browsing |
| Transfers | Complete lightweight ID/revision manifest and category catalog each sync; only new/changed recipe bodies; remove server-deleted recipes after successful sync |
| Availability | Throttled authenticated cached collection-revision checks on open/resume/connectivity changes; prominent Sync only for updates/first download when server permits; quiet status/manual check otherwise; never automatic recipe sync |
| Photos | All photo display/download/cache deferred from v1; photo indexing is separate future work |
| API-first delivery | Implement/test new endpoints in development `Kiosk.Api`, approve/deploy compatible release, then integrate APK against live text data; no photo dependency |
| Sync API contract | Version 1 approved and implemented locally (D-017): shared key header plus server switch, alphabetical ingredients, API-write invalidation only, single API process, about 500 recipes, 100-id batches |

**Still to confirm before the relevant phase:** S22+ model variant/installed OS,
device display/WebView/ABI/storage measurements, approved server deployment
artifact/runtime and rollback procedure, exact installed Android Studio/JBR patch,
how the mobile key is supplied to builds, and final
SQLite plugin approval. Android 13+ is a support target,
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
- [ ] Enable Developer options and USB debugging on each authorized test device,
  connect with a data-capable cable, and approve this desktop's debugging prompt.
  On Samsung, Developer options are normally unlocked by tapping Build number
  seven times under Settings > About tablet/phone > Software information.
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
| Java / Android CLI tools | `java`, `adb`, `sdkmanager`, and `emulator` not on PATH |
| Common install locations | No Android Studio under `/opt`, `/usr/local`, home, or checked Toolbox location; no SDK at `~/Android/Sdk` |
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
| Java | JDK/JBR 21 | Required by Capacitor/SQLite Java source level even though AGP alone has a lower minimum; record exact bundled runtime when Studio is installed |
| Android Studio | Stable Linux release >=2025.2.1 | Record exact installed build in Phase 2; use its compatible JBR rather than installing arbitrary system Java |
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
  `https://baileyfs02.baileysoft.lan/kiosk`. Development may use the development
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

### Phase 0 - Confirm the baseline and compatibility choices

**Goal:** Know what we are targeting before installing or generating anything.

- [x] Record desktop CPU architecture, RAM, free disk, virtualization capability,
  existing Node/npm/.NET versions, and any existing Java/Android tools.
- [x] Transcribe the three tablets' model/OS/software information and register the
  two phone targets (see device inventory; images no longer required).
- [ ] Finish device measurements and S22+ inventory: screen sizes, USB availability,
  Android System WebView versions, CPU ABIs, and storage. Primary tablet is confirmed.
- [x] Confirm portrait behavior: support both orientations, landscape-first.
- [x] Review current Ionic/Angular, Capacitor, SQLite plugin, Node, JDK,
  Android Gradle Plugin (AGP), and SDK compatibility as one version matrix.
  Record exact candidate versions; combined build verification remains Phase 2 work.
- [ ] Approve the SQLite candidate after reviewing its SQLCipher notice and
  verifying native device packaging in the local-storage proof.
- [x] Choose application name/ID: Kitchen Kiosk / `com.baileysoft.kiosk.mobile`.
- [ ] Apply `minSdk` 33 and compile/target SDK 36 during scaffolding;
  Minimum supported Android and compile/target SDK are different settings.
- [x] Confirm production LAN route and desktop TLS access; maintainer confirms
  production `release-mysql` and development `Kiosk.Api` as endpoint work target.
- [ ] Verify the approved deployed availability/manifest/body operations at the
  existing LAN HTTPS base before Phase 3; no separate dev-device URL is required.
- [ ] Finalize text revision coverage, source ordering, optional fields, complete
  manifest semantics, and concurrent-change behavior; photo work is deferred.

**Exit gate:** Device inventory and version matrix recorded; unresolved server
or UX decisions have owners. Existing web/API behavior remains unchanged.

### Phase 1 - Implement and verify the manifest-based text sync contract

**Goal:** Deliver bounded, read-only text synchronization without photo/NAS work
or changes to existing web/API contracts.

**Status 2026-10-22:** Contract version 1 implemented in `Kiosk.Api/MobileSync/`
and `MobileController`, documented in the
[API guide](../Kiosk.Api/README.md#mobile-sync-apimobile), and covered by 13
tests in `UnitTests/Api/MobileControllerTests.cs`. Full suite: 26 passed, 2
failed; both failures (`CategoryController_Create`, `Recipes_GetOne`) were present
before the change. A read-only local run against the development `kiosk_test`
MySQL database (one recipe) confirmed key rejection, status, manifest, and batch
body queries with matching revisions. **Not deployed.** The checklist below is the
original design checklist; items through documentation are satisfied, except
production-size performance, which is not yet measured.

- [ ] Finalize versioned DTOs/routes for authenticated availability (no collection
  scan), complete recipe ID/revision manifest plus categories, and bounded
  requested-body retrieval. Exclude photos, private users, secrets, and host paths.
- [ ] Define deterministic revision coverage over all reader-visible recipe
  text, ingredients, and category relationships. Refresh category catalog even
  for category-only changes; do not use recipe `Date` as a sole high-water mark.
- [ ] Define cached opaque collection revision covering the whole manifest and
  category catalog; status returns it cheaply. Wire invalidation after every
  relevant successful API write and serialize/coalesce rebuilds. Define direct-DB
  change freshness, restart/multiple-instance behavior, and pending/error status.
  Verify repeated unchanged checks perform no full collection scan/hash rebuild.
- [ ] Define complete inventory/empty semantics, expected body revisions, bounded
  batching, retry limits, and coherent manifest/catalog validation under concurrent
  updates or deletion. Content hashes are a candidate, not a finalized protocol.
  Recheck consistency before commit; failure must preserve last-good local data.
- [ ] Finalize dedicated key, server switch, fail-closed configuration, and
  rate/concurrency policies before implementing access. APK keys are extractable;
  do not claim app attestation or make existing public routes private by implication.
- [ ] Implement using repository conventions and explicit HTTP errors, resource
  bounds, cancellation, and no recipe writes or photo/NAS dependencies.
- [ ] Test full inventory beyond normal pagination, first/no-change sync,
  backdated additions, tied dates, deleted recipes, category/ingredient-only edits,
  null/optional values, Unicode/HTML, invalid/incomplete requests, and races.
- [ ] Test collection revision stability, all relevant write invalidations,
  direct database refresh policy, cache cold/stale/failure behavior, and coalesced
  concurrent checks. Never return a misleading equal/current revision on failure.
  Assert zero photo enumeration calls. Use synthetic text fixtures locally.
- [ ] Document all operations and the concurrency protocol in the API guide. Run focused API
  tests and relevant regressions; distinguish existing baseline failures.
- [ ] Deploy the endpoint to the LAN only with approval, backup/rollback guidance,
  and verification against the actual `/kiosk` proxy path.
  Confirm the live runtime/deployment method and release artifact first: do not
  accidentally bundle an unapproved .NET runtime upgrade or unrelated changes.
  Preserve the web app, database, provisioned photos, secrets, and existing routes.
- [ ] After approved deployment, verify live availability, full manifest/category
  completeness, and bounded recipe bodies through `/kiosk/api`. Record counts
  and request sizes rather than private text; demonstrate existing web/API smoke
  checks and rollback. Photo/NAS availability must not affect mobile v1 operations.

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

- [ ] Complete the inventory first, then install only missing tools. Document
  Pop!_OS-specific packages/permissions actually needed, not speculative commands.
- [ ] Record SDK/JDK paths. Set `ANDROID_HOME`, `JAVA_HOME`, and terminal PATH as
  required; verify `node --version`, `npm --version`, `java -version`,
  `adb version`, and later `./gradlew --version`.
  Restart VS Code or its terminal after environment changes.
- [ ] For emulation, verify BIOS virtualization and Linux KVM access, then create
  one AVD. If unavailable, use a real device rather than blocking all progress.
- [ ] Scaffold Ionic Angular into `Kiosk.Mobile/` using compatible versioned
  tooling. Add Capacitor Android and set `minSdk` 33.
- [ ] Commit the npm lockfile and native project source; configure focused ignore
  rules for Android local settings, outputs, signing material, and caches.
- [ ] Build the starter web assets, synchronize Capacitor, assemble a debug APK,
  install it, and open it on a physical device. Also test an emulator if available.
- [ ] Follow the device-inventory setup checks above. Demonstrate the first
  install on the agreed primary tablet, then smoke-test that same APK on the
  other two tablets and both phones as they become available.
- [ ] Add clearly named mobile VS Code tasks without replacing API/Web tasks.
  Record a clean install/build sequence in the mobile README.

**Exit gate:** A starter APK launches on a real Android 13+ device. Repeating the
build from VS Code's terminal works without relying on Android Studio being open.
Record the other four device results separately; pending devices are not passes.

**Typical loop after scaffolding** (commands are planned, not run yet):

```bash
cd Kiosk.Mobile
npm ci                         # First checkout or lockfile/dependency changes
npm run build                  # Build packaged web assets
npx cap sync android           # Copy assets and synchronize native plugins
cd android
./gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

`npx cap run android` can build/install/launch interactively after assets are
built. Browser preview is useful for layout but does not prove native SQLite,
certificate trust, or offline file access. Use Chrome remote WebView inspection
for debug builds and `adb logcat`/Android Studio for native errors. First-time
dependency/SDK downloads need internet; offline app use does not.

### Phase 3 - Prove LAN HTTPS from the actual Android app

**Goal:** Eliminate DNS, trust, proxy, and request-stack surprises early.

- [ ] Confirm the Baileysoft LAN CA is installed as a CA certificate, not merely
  copied onto the device. Check hostname, expiry, complete chain, and LAN DNS.
- [ ] Add Android Network Security Configuration referenced by the manifest.
  Permit the user-installed CA store for the exact LAN API hostname only;
  preserve certificate/hostname verification and disallow cleartext traffic.
  This must apply to release builds, not only `debug-overrides`.
- [ ] Choose and test the actual request path (WebView fetch versus Capacitor
  native HTTP) for availability/manifest/body JSON. Record behavior on the selected
  versions; a browser's certificate acceptance is not app-level proof.
- [ ] If WebView requests require CORS, allow only the verified mobile origin
  for read-only endpoints. Do not enable permissive global production CORS.
  A native request path may avoid CORS but still requires verified TLS trust.
- [ ] Fetch availability, manifest/categories, and bounded body responses with
  `/kiosk/api` retained exactly once; reject HTML proxy/login error responses.
- [ ] Implement bounded authenticated availability checks on open/resume and
  connectivity changes, with timeout/debounce/no overlap and a lightweight recheck
  action. Compare cached server collection revision to the device's committed
  revision. Show prominent updates/Sync only on mismatch and available/compatible/
  enabled server; first use shows Download recipes, including an empty collection.
  Equal revisions hide prominent Sync. Keep quiet status/Check for updates and
  explicit failure/retry feedback; report unavailable, unauthorized, disabled,
  rate-limited, or pending revisions without repeated alerts. No recipe download
  without tapping Sync; browsing remains local. Optional foreground-only periodic
  checks need a defined modest interval; no background polling or notifications.
- [ ] Test stale availability and connection loss after tapping Sync/after leaving
  the LAN. Revalidate on tap and preserve data on failure. Reachability is not
  LAN identity or authorization; LAN routing/firewall and TLS remain necessary.
- [ ] Prove success with the CA installed and failure without valid trust, with
  an invalid hostname/certificate, and outside the LAN. Never use trust-all code,
  `curl -k` as acceptance evidence, or a release live-reload server URL.
- [ ] Exercise a minimally signed release build as well as debug on available
  Android 13, 14, and 16 devices; keep the signing key safe from the start.

**Exit gate:** Debug and signed release builds reach the confirmed HTTPS API
through their real request stack, with valid trust and expected failure behavior.
No production API deployment changes occur without approval.

### Phase 4 - Build the reader on real local storage

**Goal:** A comfortable offline recipe book before network synchronization.

- [ ] Select a maintained Capacitor-compatible SQLite plugin; prove native
  SQLite operations before building abstractions around it.
- [ ] Define local schema/migrations and repositories for recipes, categories,
  ingredients, committed revisions, staging, and sync status.
- [ ] Seed synthetic text-only fixtures into SQLite in debug/test
  builds only. Never substitute an in-memory/browser fallback for native proof.
- [ ] Build list/detail navigation, local title search and category filters,
  ingredients and safe formatted instructions; no photo UI.
- [ ] Provide first-launch/no-data, no-results, database-error,
  syncing, and sync-failure states. Never trigger automatic synchronization.
- [ ] Make layouts readable in landscape, usable on phone-sized screens, and
  safe under rotation, font scaling, system bars, and Android Back navigation.
- [ ] Prevent remote image, CSS, or instruction resources from making implicit
  network requests; text-only v1 has no image/file cache.
- [ ] Demonstrate restart/reboot persistence and browsing with the network off.

**Exit gate:** Native SQLite-backed browsing, filtering, and text details work
after an offline restart; reading requires no API or photo requests.

### Phase 5 - Implement transactional manifest-based synchronization

**Goal:** Explicit refresh that cannot destroy the last good collection.

- [ ] Add one Synchronize action, overlap prevention, progress, timeouts,
  actionable errors, last attempt, last success, and active recipe count.
- [ ] Validate status/content type, schema version, IDs/revisions, complete
  authoritative manifest, category catalog, and required fields.
- [ ] Compare committed local revisions; fetch all bodies initially, then only
  missing/changed bodies in bounded batches. Unchanged sync fetches zero bodies.
- [ ] Reuse validated unchanged local rows; stage new/changed bodies and
  authoritative deletions. Never infer a deletion from partial/failed inventory.
- [ ] Validate expected revisions and the agreed concurrent-change protocol
  before activation. Changes during transfer require bounded retry or explicit
  failure, never mixed-version activation. Category-only changes must be covered.
- [ ] Atomically commit upserts, deletes, categories, revisions, and last-success
  metadata plus the corresponding manifest collection revision in SQLite.
  Interrupted sync must not expose partial results or advance the revision.
  Never store a newer status revision without its data. Recheck availability after
  commit so changes made during sync can still indicate newer updates.
- [ ] Clean abandoned staging safely on restart without deleting active data.
  Storage exhaustion, cancellation, process death, schema errors, or unavailable
  server leave the prior collection intact. Never clear active data to make room.
- [ ] Report added/updated/removed counts, active count, last attempt/success,
  and errors. Allow validated empty inventory to remove all only on successful commit.
- [ ] Prove no photo requests, metadata retrieval, cache, or NAS enumeration.

**Exit gate:** First/repeat/changed/deleted/empty/no-change refreshes work; only
required bodies transfer and injected failures preserve a complete usable dataset.

### Phase 6 - Acceptance on Android 13, 14, and 16

**Goal:** Verify the gift experience, not just a successful compilation.

- [ ] Run the specification's test matrix on release-candidate builds, including
  empty collection, many recipes/categories, long instructions, and special characters.
- [ ] Sync, enable airplane mode, force-stop/reopen, then reboot and read again.
- [ ] Verify reading generates no content requests; availability checks never
  download recipes. Inspect sanitized instructions for implicit image/style requests.
- [ ] Interrupt manifest/body downloads and kill the process around activation.
  Test malformed/incomplete manifests, unsupported schemas, TLS errors, full
  storage, and database failures.
- [ ] Confirm removed recipes disappear only after complete successful commit;
  repeat/no-change sync leaves no duplicates and transfers zero unchanged bodies.
- [ ] Test backdated/tied-date changes, category/ingredient-only changes, races
  between manifest/body operations, and leaving the LAN after availability succeeds.
- [ ] Test up-to-date devices remain visually quiet, changes show the action,
  first-use empty inventory shows Download recipes, and failed/pending checks
  never claim "up to date". Check revision persistence and post-sync refresh races.
- [ ] Confirm NAS/photo failures do not affect any mobile v1 operation.
- [ ] Check layout, touch targets, text scaling, rotation, Back, and WebView
  behavior on available phones/tablets; record device-specific results.
- [ ] Measure startup, search/filter response, first/incremental sync time,
  manifest/body transfer sizes, and disk usage on
  the actual collection; agree measurable usability thresholds before sign-off.
- [ ] Confirm API/Web regressions relevant to the endpoint remain unchanged.

**Exit gate:** Acceptance evidence on all five target devices and Android 13,
14, and 16 (physical device or identified emulator where necessary), no
data-loss defects, and maintainer approval on the primary tablet. Newer releases
need regression testing before being described as verified.

### Phase 7 - Signed APK, updates, and handover

**Goal:** Install the actual deliverable and make future rebuilds/updates possible.

- [ ] Finalize app name, icon, application ID, `versionName`, and increasing
  `versionCode`. Remove test fixtures, debug flags, live-reload URLs, and dev-only trust.
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
- [ ] Document USB installation and direct sideloading ("Install unknown apps"
  permission for the installer), updating without uninstalling, CA/LAN prerequisites,
  sync failure recovery, and rebuild/signing steps.
- [ ] Explain that clearing app storage/uninstalling removes local recipes;
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
| Planning | Complete | Text-only manifest scope and cached collection-revision UX approved 2026-10-22; prominent Sync only for updates/first use, quiet status/manual check otherwise; recipe transfers remain explicit |
| Phase 0 | Ready for API-first work; integration gates open | Desktop inventory and compatible candidate pins recorded; S23+ Android 16 confirmed; app identity, orientation, primary tablet, photo scope, and API-first/live-integration sequence agreed. Device measurements, S22+ OS, approved server deployment, ingredient order, and final SQLite approval pending |
| Phase 1 (current) | Implemented and tested locally; deployment pending | Contract v1 (D-017) with 13 passing tests and a read-only `kiosk_test` MySQL check. Next: confirm production runtime/commit, deployment artifact, backup/rollback, and mobile key provisioning; then deploy with approval and verify live `/kiosk/api/mobile/*` |
| Phase 2 | Not started | No Android tool installation or starter build performed |
| Phases 3-7 | Not started | No mobile HTTPS, SQLite, synchronization, or APK acceptance claims |

For each completed milestone, add a concise result here: date, commands, exact
versions, device/Android version, debug or release variant, outcome, and remaining
limitations. Keep credentials and private recipe contents out of this record.

**Next step:** Approved Phase 1 deployment. The text-sync endpoints are implemented
and tested locally but not deployed. Production runs `release-mysql`, last
recorded as .NET 9, while this branch targets .NET 10. Choose and approve
the release path before deploying, then perform live status/manifest/body checks.
Photo indexing and synchronization are deferred; no NAS access is needed for v1
mobile sync. Phase 2 Android setup can start in parallel because it does not
depend on deployment. Phase 3 app-level TLS needs the live server. No Android
installation or APK build has been performed yet.