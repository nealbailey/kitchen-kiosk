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
| Stack | Separate Ionic Angular application packaged using Capacitor; local SQLite and application-private thumbnail files |
| Location | Repository-root `Kiosk.Mobile/`, with Capacitor's conventional lowercase `android/` inside |
| Editor | VS Code for everyday work; Android Studio for SDK/device management and native troubleshooting |
| Device support | Android 13 and newer; set the product minimum to API 33 |
| Available test devices | EM101A on Android 13; two Samsung tablets on Android 14; Galaxy S23+ on Android 16; S22+ OS pending confirmation |
| Primary tablet | Galaxy Tab S7 FE (SM-T733), confirmed 2026-10-22 |
| Orientation | Both orientations supported; landscape-first tablet design, confirmed 2026-10-22 |
| Application identity | Kitchen Kiosk / `com.baileysoft.kiosk.mobile`, confirmed 2026-10-22 |
| API base | `https://baileyfs02.baileysoft.lan/kiosk/api` |
| Certificate prerequisite | Baileysoft LAN CA must already be installed on each device |
| Image failures | Every referenced thumbnail must download and validate before activation; intentionally photo-less recipes use placeholders |
| Distribution | Signed APK, installed directly; no Play Store or paid cloud build service required |
| Scope | Read-only, no login/accounts, no writes, explicit full sync only, offline browsing |
| Photos | Synchronize all recipe photo thumbnails, not only a cover image |
| API-first delivery | Implement/test new endpoints in development `Kiosk.Api`, deploy an approved compatible server release, then use the live LAN API for APK integration with real photos |

**Still to confirm before the relevant phase:** S22+ model variant/installed OS,
device display/WebView/ABI/storage measurements, approved server deployment
artifact/runtime and rollback procedure, exact installed Android Studio/JBR patch, ingredient ordering,
snapshot DTO, and final SQLite plugin approval. Android 13+ is a support target,
not a claim that untested future
Android versions already work.

### Device inventory for Phase 1

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

Planned read-only checks after Phase 1 SDK setup (not executed yet):

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
were checked together on 2026-10-22. These are exact candidate pins for Phase 1,
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
| Filesystem candidate | `@capacitor/filesystem` 8.1.5 | Peer requires Capacitor >=8; needed for private thumbnail storage |
| Java | JDK/JBR 21 | Required by Capacitor/SQLite Java source level even though AGP alone has a lower minimum; record exact bundled runtime when Studio is installed |
| Android Studio | Stable Linux release >=2025.2.1 | Record exact installed build in Phase 1; use its compatible JBR rather than installing arbitrary system Java |
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
  live LAN API from the APK so recipe photos are available during integration.
  Agreement on this sequence is not authorization to change production immediately.
- Desktop `curl` to `/kiosk/api/categories` returned HTTP 200 with TLS
  verification result 0. A separate verified TLS handshake succeeded using
  TLS 1.3. Response recipe data was not saved. This confirms desktop connectivity
  and trust only, not the deployed commit/runtime or Android app trust.
- A separate device-facing development HTTPS server is no longer required for
  the main integration path. Use the confirmed live `/kiosk/api` base after the
  endpoint is deployed. Local API tests use synthetic image fixtures; real image
  availability is verified on the live server before Android integration.
  If a development-device URL is later needed, configure it explicitly: device
  `localhost` is not this desktop, and the development prefix may differ.
- Source inspection confirms recipe list queries paginate; a full snapshot must
  use an explicit complete query, not a large guessed page size. Categories have
  stable IDs and primary/additional relationships; category listing sorts by name,
  but per-recipe category queries do not define ordering.
- Ingredient keys are `(Ingredient, RecId)` and queries have no `OrderBy`; there
  is no persisted authored sequence, quantity/unit breakdown, or independent ID.
  Ingredient ordering remains a contract decision before Phase 3. Do not promise
  original author order or introduce a database migration without agreement.
- Photo enumeration can return many files, has no defined ordering, and emits
  a filename-less entry for a missing directory. Its existing error handling can
  return an empty list on filesystem failures. The new snapshot path must
  distinguish intentional no-photo data from enumeration failure, filter out
  non-photo sentinel entries, emit no host filesystem paths, and construct
  prefix-safe encoded thumbnail references. All actual photo thumbnails are
  required by the confirmed scope; no original image requests.

**Phase 0 readiness:** Desktop prerequisites, hardware OS coverage, application
identity, primary tablet, orientation, and photo scope are established. API work
in Phase 3 is next; Phase 1 tool setup may proceed independently. Device
measurements require Phase 1 `adb`; approved API deployment, ingredient ordering,
DTO details, and SQLite approval remain explicit
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
  not a query parameter. Evaluate the existing size before proposing a shared
  server setting change to approximately 300 pixels.
- `GET /api/mobile/sync` is proposed, not implemented or verified on the LAN.
  With the confirmed deployment prefix its URL would be
  `https://baileyfs02.baileysoft.lan/kiosk/api/mobile/sync`.

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
The revised critical path is **0 -> 3 (API + approved deployment) -> 1 -> 2 ->
4 -> 5 -> 6 -> 7**. Phase numbers are retained to preserve existing references;
execution order takes precedence over numbering. Phase 1 tool setup can run
independently while API work is underway, and Phase 4 UI work can use fixtures
after contract agreement. Phase 2's live integration requires both Phase 1's
starter app and Phase 3's deployed endpoint. Image synchronization remains part
of Phase 5's first complete refresh, not a deferred final-release addition.

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
  Record exact candidate versions; combined build verification remains Phase 1 work.
- [ ] Approve the SQLite candidate after reviewing its SQLCipher notice and
  verifying native device packaging in the local-storage proof.
- [x] Choose application name/ID: Kitchen Kiosk / `com.baileysoft.kiosk.mobile`.
- [ ] Apply `minSdk` 33 and compile/target SDK 36 during scaffolding;
  Minimum supported Android and compile/target SDK are different settings.
- [x] Confirm production LAN route and desktop TLS access; maintainer confirms
  production `release-mysql` and development `Kiosk.Api` as endpoint work target.
- [ ] Verify the approved deployed snapshot endpoint and real thumbnails at the
  existing LAN HTTPS base before Phase 2; no separate dev-device URL is required.
- [ ] Inspect full recipe/category/ingredient/photo queries and decide source
  ordering, optional fields, and whether all photo thumbnails are included.

**Exit gate:** Device inventory and version matrix recorded; unresolved server
or UX decisions have owners. Existing web/API behavior remains unchanged.

### Phase 1 - Set up Pop!_OS 24.04 and install a starter APK

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

### Phase 2 - Prove LAN HTTPS from the actual Android app

**Goal:** Eliminate DNS, trust, proxy, and request-stack surprises early.

- [ ] Confirm the Baileysoft LAN CA is installed as a CA certificate, not merely
  copied onto the device. Check hostname, expiry, complete chain, and LAN DNS.
- [ ] Add Android Network Security Configuration referenced by the manifest.
  Permit the user-installed CA store for the exact LAN API hostname only;
  preserve certificate/hostname verification and disallow cleartext traffic.
  This must apply to release builds, not only `debug-overrides`.
- [ ] Choose and test the actual request path (WebView fetch versus Capacitor
  native HTTP) for JSON and thumbnail bytes. Record behavior on the selected
  versions; a browser's certificate acceptance is not app-level proof.
- [ ] If WebView requests require CORS, allow only the verified mobile origin
  for read-only endpoints. Do not enable permissive global production CORS.
  A native request path may avoid CORS but still requires verified TLS trust.
- [ ] Fetch an existing read-only endpoint and a thumbnail, retaining `/kiosk/api`
  exactly once and safely encoding filenames. Confirm JPEG bytes, not a login
  page, HTML proxy error, or original image.
- [ ] Prove success with the CA installed and failure without valid trust, with
  an invalid hostname/certificate, and outside the LAN. Never use trust-all code,
  `curl -k` as acceptance evidence, or a release live-reload server URL.
- [ ] Exercise a minimally signed release build as well as debug on available
  Android 13, 14, and 16 devices; keep the signing key safe from the start.

**Exit gate:** Debug and signed release builds reach the confirmed HTTPS API
through their real request stack, with valid trust and expected failure behavior.
No production API deployment changes occur without approval.

### Phase 3 - Implement and verify the read-only snapshot contract

**Goal:** Deliver a complete, versioned dataset without changing existing clients.
**Execution priority:** Next after Phase 0, before live Android integration.

- [ ] Define explicit mobile DTOs and fixtures: schema version, generated time,
  recipes, primary/additional categories, ingredient text, instructions, and
  required thumbnail identifiers. Exclude credentials, private user data,
  filesystem paths, and original images.
- [ ] Define empty-snapshot semantics, optional values, deterministic ordering,
  and consistent reads under concurrent recipe edits. Do not rely on paginated
  listing defaults or assume database rows and filesystem photos change atomically.
- [ ] Implement `GET /api/mobile/sync` using repository/API conventions and
  appropriate HTTP errors. Preserve existing authorization and all write routes.
- [ ] Test complete counts beyond normal page sizes, category relationships,
  zero/multiple photos, Unicode, HTML instructions, invalid records, and failures.
  Use temporary synthetic JPEG fixtures for local filesystem/thumbnail tests;
  missing local production photos must not block these tests or force copying
  the private photo library onto the desktop.
- [ ] Document the DTO and thumbnail routes in the API guide. Run focused API
  tests and relevant regressions; distinguish existing baseline failures.
- [ ] Deploy the endpoint to the LAN only with approval, backup/rollback guidance,
  and verification against the actual `/kiosk` proxy path.
  Confirm the live runtime/deployment method and release artifact first: do not
  accidentally bundle an unapproved .NET runtime upgrade or unrelated changes.
  Preserve the web app, database, provisioned photos, secrets, and existing routes.
- [ ] After approved deployment, verify the versioned snapshot against the live
  recipe collection and retrieve its referenced thumbnail JPEGs through the
  exact `/kiosk/api` routes. Confirm that no photo metadata silently becomes an
  empty set due to filesystem access errors. Record counts/results, not private
  recipe contents, and demonstrate existing web/API smoke checks and rollback.

**Exit gate:** Tested full snapshot and thumbnails are reachable on the LAN;
the contract is sufficient for offline reading and is not a domain-entity dump.
This is the backend used by subsequent APK sync integration. Real thumbnail
retrieval must pass before calling the API-first milestone complete.

### Phase 4 - Build the reader on real local storage

**Goal:** A comfortable offline recipe book before network synchronization.

- [ ] Select a maintained Capacitor-compatible SQLite plugin; prove SQLite and
  app-private file operations on Android before building abstractions around it.
- [ ] Define local schema/migrations and repositories for recipes, categories,
  ingredients, photo references, dataset generations, and sync status.
- [ ] Seed synthetic fixtures into SQLite and local image files in debug/test
  builds only. Never substitute an in-memory/browser fallback for native proof.
- [ ] Build list/detail navigation, local title search and category filters,
  ingredients, safe formatted instructions, and thumbnail display.
- [ ] Provide first-launch/no-data, no-results, photo-less, database-error,
  syncing, and sync-failure states. Never trigger automatic synchronization.
- [ ] Make layouts readable in landscape, usable on phone-sized screens, and
  safe under rotation, font scaling, system bars, and Android Back navigation.
- [ ] Map private file paths to WebView-safe local URLs. Prevent remote image,
  CSS, or instruction resources from making browsing depend on the network.
- [ ] Demonstrate restart/reboot persistence and browsing with the network off.

**Exit gate:** Native SQLite-backed browsing, filtering, details, and images work
after an offline restart; no browsing screen calls the API.

### Phase 5 - Implement crash-safe full synchronization

**Goal:** Explicit refresh that cannot destroy the last good collection.

- [ ] Add one Synchronize action, overlap prevention, progress, timeouts,
  actionable errors, last attempt, last success, and active recipe count.
- [ ] Validate status/content type, schema version, IDs, relationships, required
  fields, and complete snapshot before accepting data.
- [ ] Download all referenced thumbnail JPEGs to a new private generation
  directory with bounded concurrency. Validate image content and generate safe
  local names; never trust server filenames as local paths.
- [ ] Write new generation rows without replacing active rows. Only after all
  images are durable and validated, atomically switch the active generation and
  last-success metadata in one SQLite transaction.
- [ ] Read images using generation-specific paths. A filesystem rename and a DB
  commit are not one atomic operation; do not claim they form a shared transaction.
- [ ] On restart, resolve the committed active generation; ignore incomplete
  staging. Clean abandoned generations without deleting active files or files
  still needed by readers. Report cleanup problems without undoing a valid sync.
- [ ] Ensure storage exhaustion, cancellation/process death, or failed downloads
  preserve the old generation. Reserve enough space for old and staged data;
  do not delete the active snapshot to make room.
- [ ] Distinguish a legitimate no-photo recipe from a referenced image failure.
  The latter fails the whole refresh. Update last success only on committed activation.

**Exit gate:** First/repeat/changed/deleted-data refreshes work; injected failures
before, during, and immediately after activation preserve a complete usable dataset.

### Phase 6 - Acceptance on Android 13, 14, and 16

**Goal:** Verify the gift experience, not just a successful compilation.

- [ ] Run the specification's test matrix on release-candidate builds, including
  empty collection, many recipes/photos, long instructions, and special characters.
- [ ] Sync, enable airplane mode, force-stop/reopen, then reboot and read again.
- [ ] Verify search, categories, details, and thumbnails generate no network
  requests; inspect sanitized instruction content as well as ordinary UI calls.
- [ ] Interrupt JSON/image downloads and kill the process around activation.
  Test malformed/unsupported snapshots, TLS errors, full storage, and DB/file failures.
- [ ] Confirm removed recipes disappear only after successful full activation;
  repeated refreshes leave no duplicates or unbounded orphan image directories.
- [ ] Check layout, touch targets, text scaling, rotation, Back, and WebView
  behavior on available phones/tablets; record device-specific results.
- [ ] Measure startup, search/filter response, full-sync time, and disk usage on
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
| Installed CA is not automatically trusted by modern apps | Domain-scoped release trust configuration; Phase 2 real-device proof |
| WebView and native plugins behave differently | Native-device SQLite/files/network tests, not browser-only acceptance |
| Shared thumbnail width affects the web app | Evaluate current output first; request approval for server changes |
| Snapshot DB and images drift during failure | Immutable file generations plus transactional active-generation switch |
| Live server differs from development branch | Record/deploy approved server version; do not infer live capabilities |
| Large photo collection/limited disk | Measure early, bounded downloads, enough staging space, safe cleanup |
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
| Planning | Complete | Mobile notes and relevant source reviewed; layout, Android minimum, LAN URL, CA prerequisite, and image policy confirmed on 2026-10-22 |
| Phase 0 | Ready for API-first work; integration gates open | Desktop inventory and compatible candidate pins recorded; S23+ Android 16 confirmed; app identity, orientation, primary tablet, photo scope, and API-first/live-integration sequence agreed. Device measurements, S22+ OS, approved server deployment, ingredient order, and final SQLite approval pending |
| Phase 1 | Not started | No Android tool installation or starter build performed |
| Phase 3 (next) | Not started | Implement/test snapshot endpoint, approve/deploy compatible server release, verify real live thumbnails |
| Phases 2, 4-7 | Not started | No mobile HTTPS, SQLite, synchronization, or APK acceptance claims |

For each completed milestone, add a concise result here: date, commands, exact
versions, device/Android version, debug or release variant, outcome, and remaining
limitations. Keep credentials and private recipe contents out of this record.

**Next step:** Phase 3 API contract and implementation, with synthetic photo
fixtures for local tests, followed by an explicitly approved live deployment and
real-thumbnail smoke checks. Then Phase 1 Android setup and Phase 2 app-level TLS
proof against that live server. No installation, endpoint implementation,
deployment, or APK build has been performed yet.