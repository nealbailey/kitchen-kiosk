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
| Available test devices | Android 13 / API 33, Android 14 / API 34, Android 16 / API 36 |
| Orientation | Landscape preferred; responsive layouts rather than assuming one fixed tablet size |
| API base | `https://baileyfs02.baileysoft.lan/kiosk/api` |
| Certificate prerequisite | Baileysoft LAN CA must already be installed on each device |
| Image failures | Every referenced thumbnail must download and validate before activation; intentionally photo-less recipes use placeholders |
| Distribution | Signed APK, installed directly; no Play Store or paid cloud build service required |
| Scope | Read-only, no login/accounts, no writes, explicit full sync only, offline browsing |

**Still to confirm before the relevant phase:** exact device models, screen sizes,
whether portrait should remain available (recommended), final application ID/name,
current live API deployment, compatible dependency versions, snapshot DTO, and
SQLite plugin. Android 13+ is a support target, not a claim that untested future
Android versions already work.

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
The critical path is **0 -> 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7**. UI work in
Phase 4 can proceed independently of unfinished server work once the contract
and local fixtures are agreed, but synchronization cannot pass without Phase 3.

## 4. Phases and exit gates

### Phase 0 - Confirm the baseline and compatibility choices

**Goal:** Know what we are targeting before installing or generating anything.

- [ ] Record desktop CPU architecture, RAM, free disk, virtualization capability,
  existing Node/npm/.NET versions, and any existing Java/Android tools.
- [ ] Record device models, Android versions, screen sizes, USB availability,
  and Android System WebView versions; choose a primary acceptance tablet.
- [ ] Confirm portrait behavior; start with landscape-first, rotation-safe layouts.
- [ ] Review current Ionic/Angular, Capacitor, SQLite plugin, Node, JDK,
  Android Gradle Plugin (AGP), and SDK compatibility as one version matrix.
  Select and record exact versions; do not install unrelated latest versions.
- [ ] Choose application ID before first distribution. Set `minSdk` to 33;
  choose compile/target SDK supported by the selected Capacitor/AGP release.
  Minimum supported Android and compile/target SDK are different settings.
- [ ] Confirm LAN DNS, reverse-proxy `/kiosk` handling, certificate issuer/chain,
  and which live server version will receive the sync endpoint.
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
- [ ] Add clearly named mobile VS Code tasks without replacing API/Web tasks.
  Record a clean install/build sequence in the mobile README.

**Exit gate:** A starter APK launches on a real Android 13+ device. Repeating the
build from VS Code's terminal works without relying on Android Studio being open.

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
- [ ] Document the DTO and thumbnail routes in the API guide. Run focused API
  tests and relevant regressions; distinguish existing baseline failures.
- [ ] Deploy the endpoint to the LAN only with approval, backup/rollback guidance,
  and verification against the actual `/kiosk` proxy path.

**Exit gate:** Tested full snapshot and thumbnails are reachable on the LAN;
the contract is sufficient for offline reading and is not a domain-entity dump.

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

**Exit gate:** Acceptance evidence on all three available Android versions, no
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

**Exit gate:** Signed release installed and pre-synced on the gift device,
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

## 7. Progress and evidence

| Milestone | Status | Evidence / next step |
| --- | --- | --- |
| Planning | Complete | Mobile notes and relevant source reviewed; layout, Android minimum, LAN URL, CA prerequisite, and image policy confirmed on 2026-10-22 |
| Phase 0 | Not started | Inventory desktop/devices and choose compatible pinned versions |
| Phase 1 | Not started | No Android tool installation or starter build performed |
| Phases 2-7 | Not started | No mobile HTTPS, SQLite, synchronization, or APK acceptance claims |

For each completed milestone, add a concise result here: date, commands, exact
versions, device/Android version, debug or release variant, outcome, and remaining
limitations. Keep credentials and private recipe contents out of this record.

**Next session:** Phase 0 inventory, then guide the maintainer through Android
Studio/SDK setup and the first starter APK in Phase 1.