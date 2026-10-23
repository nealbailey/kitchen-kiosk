# Kitchen-Kiosk Mobile Specification

- **Status:** Approved v1 scope; implementation pending.
- **Last revised:** 2026-10-22.
- **Product rules:** [Mobile constitution](kiosk-mobile.constitution.md), version 1.3.
- **Execution guide:** [Phased development plan](kiosk-mobile.plan.md).
- **Parent context:** [Application specification](app.spec.md).

This specification records the text-only, manifest-based v1 approved by the
maintainer on 2026-10-22. It supersedes the previous full-body/photo snapshot
checklist. The execution guide owns workstation setup, exact candidate tool
versions, device inventory, dependencies, and verification evidence. No endpoint
or APK is implemented merely because it is specified here.

## 1. Definition of Done

- [ ] A reproducible signed APK installs on the target Android 13+ tablets/phones.
- [ ] Browsing, title search, category and author filtering, author and
  recommended (thumbs-up) display, ingredients, and formatted
  instructions use local SQLite, including after an offline restart/reboot.
- [ ] A prominent Sync button appears only when an authenticated check reports
  a reachable, compatible, sync-enabled server with a collection revision different
  from the device's committed revision. Equal revisions hide the prominent action.
- [ ] Before the first successful sync, show Download recipes when available;
  retain a quiet status/Check for updates entry and clear user-initiated failure/retry feedback.
- [ ] Open/resume and connectivity changes trigger bounded availability checks,
  not automatic recipe synchronization; checks have timeouts and do not overlap.
- [ ] The first explicit sync downloads the manifest, categories, and all recipe bodies.
- [ ] Later explicit syncs download the complete lightweight ID/revision manifest
  and categories, but only new/changed recipe bodies.
- [ ] Successful sync removes local recipes absent from the complete authoritative manifest.
- [ ] Failed, interrupted, invalid, or concurrently inconsistent sync preserves
  the complete last-good collection and last-success metadata.
- [ ] No v1 mobile operation calls photo endpoints, enumerates NAS storage, or
  displays/caches photos, including remote images embedded in instructions.
- [ ] Offline/unavailable/unauthorized/disabled/rate-limited states are clear and
  never block local reading. Availability is rechecked when Sync is pressed.
- [ ] No recipe writes, accounts/login UI, direct MySQL access, or remote sync
  outside the home LAN is introduced.
- [ ] Build, signing, installation/update, sync, and failure recovery are documented.

## 2. Phased development checklist

## Phase 0 - Repository Reconnaissance and Decisions

- [ ] Verify required recipe/category/ingredient fields, formatting, ordering,
  optional values, stable identifiers, current queries, and date behavior.
- [ ] Confirm desktop prerequisites, device inventory, LAN base URL and CA assumptions.
- [ ] Agree revision coverage, completeness, deletion, and concurrency semantics
  before implementing the contract. Do not infer correctness from recipe dates.
- [ ] Keep remaining device and plugin decisions visible in the execution guide.

**Exit criteria:** Sufficient evidence to design Phase 1; remaining gates assigned.
See the execution guide for completed reconnaissance rather than inferring
completion from the original checklist.

## Phase 1 - API Contract, Implementation, and Approved Deployment

Contract approved 2026-10-22 (D-017) and documented in the
[API guide](../Kiosk.Api/README.md#mobile-sync-apimobile).

- [x] Versioned routes/DTOs (contract version 1): `GET api/mobile/status`,
  `GET api/mobile/manifest`, `POST api/mobile/recipes` (1-100 distinct ids).
- [x] Revision coverage: SHA-256 over title, description, instructions, stored
  date, primary category, author username, recommended flag, sorted category
  ids, and case-insensitive alphabetical ingredients (D-018). Collection revision covers contract version, category catalog,
  and every recipe id/revision. Dates are display data, not a cursor.
- [x] Status returns the cached collection revision; unchanged checks do no
  rebuild (tested by build counter).
- [x] Invalidation on API recipe create/update/delete, favorite add/remove,
  category add/delete, and user delete (favorites cascade), including failed attempts; concurrent rebuilds coalesce; snapshots built
  during a write are discarded and `503 revision_pending` is returned instead of
  a possibly stale revision. Direct MySQL edits need a service restart; a single
  API process is assumed. Cold start rebuilds on first request.
- [x] Complete-manifest, first-sync, no-change, empty, deletion, and retry rules
  documented. Client validates each body revision against the manifest; a
  mismatch or `missingIds` entry means restart from the manifest without commit.
- [x] Access: `X-Kiosk-Mobile-Key` header, `MobileSync__Enabled` switch, fail
  closed (`503 sync_disabled` / `sync_not_configured`, `401 invalid_key`) before
  any database work; global per-minute and data-concurrency limits (`429`). No
  JWT/admin secrets reused; key is not app attestation. Tests keep the key on.
- [x] Tests: invalid keys, disabled/misconfigured, rate limit, cache reuse,
  complete ordered manifest, body/manifest revision agreement, missing ids,
  private-field exclusion, author/recommended values, favorite invalidation
  changing only that recipe's revision, invalid requests, write invalidation,
  coalescing, pending state, revision sensitivity, and no photo dependency
  (14 tests).
- [x] Production-size check: 477 recipes / 22 categories; manifest 46.9 KB in
  0.065 s over the LAN (2026-10-23).
- [ ] Still untested: concurrency `busy` limit and a real manifest/body race
  across separate HTTP requests (client protocol handles both).
- [x] Deployed by the maintainer 2026-10-23 (self-contained .NET 10 build);
  existing `/categories` still served.
- [x] Live status/manifest/body operations verified through `/kiosk/api`
  (see [plan](kiosk-mobile.plan.md) Phase 1 status), including the no-key `401`
  and a live favorite toggle changing, then restoring, `collectionRevision`.

**Exit criteria:** Tested versioned contract deployed with explicit approval;
live text sync works with no dependency on photo availability or indexing.

## Phase 2 - Development Environment and Android Build Proof

- [ ] Install missing Android Studio/SDK/JDK components on Pop!_OS, following the
  compatible version matrix and beginner-friendly steps in the execution guide.
- [ ] Scaffold separate `Kiosk.Mobile/` Ionic Angular/Capacitor project.
- [ ] Set app name/ID and minimum/compile/target SDK; version native configuration
  and lockfile, excluding local paths, build output, and signing secrets.
- [ ] Build/install/launch a starter APK from VS Code's terminal on the Tab S7 FE;
  record other-device/emulator checks and pending coverage honestly.
- [ ] Record device display, ABI, storage, WebView, and USB authorization evidence.

**Exit criteria:** Repeatable starter APK build/install on real hardware.

## Phase 3 - Android LAN HTTPS and Availability Proof

- [ ] Configure release/debug domain-scoped user-CA trust with TLS validation intact.
- [ ] Verify the actual WebView/native request stack against live availability,
  manifest, and body operations, retaining `/kiosk/api` exactly once.
- [ ] Restrict any necessary CORS to verified mobile origins.
- [ ] Implement throttled checks on open/resume and connectivity changes. Compare
  server collection revision with the committed local revision; show updates only
  on mismatch, Download recipes before first sync, and quiet status/check otherwise.
  Define an interval before adding optional foreground-only polling; no background polling.
- [ ] Test connection loss after a successful check and after leaving the LAN;
  online status is a hint, never authorization or a guarantee a sync will succeed.
- [ ] Test invalid certificates/trust, access denied, server disabled, rate limits,
  and timeouts in debug and signed release on Android 13, 14, and 16.

**Exit criteria:** Prominent Sync reflects available updates, not mere LAN presence;
invalid trust fails, and offline reading stays independent of all checks.

## Phase 4 - Offline Reader and SQLite

- [ ] Approve/pin a maintained native SQLite plugin and prove Android persistence.
- [ ] Define migrations and local recipe/category/ingredient/revision/sync metadata.
- [ ] Seed synthetic text-only fixtures for local-storage tests, not production fallback.
- [ ] Build browse/detail navigation, local title search/category/author filters,
  author and recommended indicators on list cards and details, and
  readable ordered ingredients and safely formatted instructions (stored
  rich-text HTML: allow-list sanitize; turn `&nbsp;` into normal spaces).
- [ ] Support both orientations, landscape-first tablets, phone-sized viewports,
  text scaling, system bars, accessible touch targets, and Android Back.
- [ ] Provide first-launch/empty/no-results/database-error/sync-status states.
- [ ] Ensure embedded images/styles/links cannot initiate implicit external
  requests while reading; do not render photos in v1.
- [ ] Demonstrate browsing after network loss, force-stop/reopen, and reboot.

**Exit criteria:** SQLite is authoritative; all recipe reading works offline.

## Phase 5 - Transactional Manifest-Based Synchronization

- [ ] Only tapping Sync starts collection transfer; prevent overlapping attempts.
- [ ] Obtain/validate a complete authoritative manifest and category catalog.
- [ ] Compare committed local IDs/revisions; fetch all missing/changed bodies in
  bounded requests and reuse unchanged validated local bodies.
- [ ] Validate expected body revisions, schema, relationships, completeness, and
  the agreed concurrent-change protocol; never activate mixed versions.
- [ ] Stage changes and atomically apply upserts, authoritative deletions,
  category refresh, recipe revisions, corresponding manifest collection revision,
  and last-success metadata in SQLite. Never persist a status-only newer revision.
- [ ] After commit, recheck status; a newer concurrent collection still indicates
  updates. Failures preserve the old revision and provide a retry/status action.
- [ ] Preserve the previous collection on every pre-commit failure, low storage,
  process death, cancellation, invalid response, or retry exhaustion.
- [ ] Report progress, last attempt/success, active count, and added/updated/
  removed counts; a no-change success transfers zero recipe bodies.
- [ ] Never infer deletion from an incomplete page, timeout, or error response.

**Exit criteria:** First/repeat/changed/deleted/no-change sync is correct,
transactional, and transfers only required recipe bodies without photo work.

## Phase 6 - Offline, Reliability, and Device Acceptance

- [ ] Execute section 4's matrix on the five target devices and available
  Android 13, 14, and 16 hardware; record exact build/device versions.
- [ ] Measure startup, local search, manifest/body transfer sizes, sync time,
  and disk use against agreed thresholds before sign-off.
- [ ] Test long instructions, Unicode, many recipes/categories, rotation, text
  scaling, and phone/tablet layouts.
- [ ] Verify no recipe transfer without tapping Sync and no photo/NAS work.
- [ ] Preserve relevant existing web/API behavior; distinguish baseline failures.

**Exit criteria:** Maintainer accepts the actual devices' offline/recovery UX;
no data-loss defects or unverified device claims.

## Phase 7 - Signed APK, Updates, and Optional Gift Handover

- [ ] Finalize icon/version; remove fixtures, debug flags, and live-reload URLs.
- [ ] Back up release signing material outside Git; build and verify signed APK.
- [ ] Test fresh install and in-place signed update preserving local data.
- [ ] Perform final live text sync then airplane-mode/reboot tests with that APK.
- [ ] Document APK installation/update, LAN CA prerequisite, availability checks,
  explicit sync, error recovery, and rebuilding/signing.
- [ ] Explain that clearing storage/uninstall removes the local collection and
  returning to the home LAN is required for refresh.
- [ ] Retain tested APK/release notes outside Git; tag only with approval.
- [ ] Prepare a pre-synced gift tablet only if gifting is chosen.

**Exit criteria:** Tested signed APK, safe update path, signing backup, and owner instructions.

## 3. Contract checklist (implemented contract version 1; see API guide)

| Operation | Required semantics |
| --- | --- |
| Availability | Lightweight authenticated read; compatibility, sync-enabled status, cached opaque `collectionRevision`; no per-check collection scan/hash, recipe bodies, or photos; explicit pending/error state |
| Manifest | Schema version, coherent collection revision/generation, complete recipe ID/revision inventory and category catalog; never normal listing's truncated page |
| Recipe bodies | Bounded retrieval of requested IDs with expected revisions; all text fields/relationships required by reader, author username, and recommended flag; no user ids/emails/secrets/host paths/photo metadata |
| Local sync status | Last attempt, last successful committed sync, active count, revision state, added/updated/removed counts, actionable errors |

Use deterministic revision rules that include ingredients and category
relationships; category renames/deletions must also refresh correctly.
Implemented as SHA-256 content revisions (contract version 1). A newer
recipe `Date` alone cannot establish what changed. Across multiple HTTP
requests the client accepts a body only when its revision equals the manifest
entry; otherwise it restarts from a fresh manifest and never prunes against a
partial manifest.

## 4. Test matrix

| Scenario | Expected result |
| --- | --- |
| First sync | Complete manifest/categories and all bodies committed |
| Repeat without changes | Manifest/categories transferred; zero recipe bodies; no duplicates |
| New/backdated recipe or tied dates | Manifest detects missing/changed ID/revision regardless of date |
| Favorite added/removed by any user | Only that recipe's revision changes; recommended indicator updates after sync |
| Ingredients/category relationships change | Correct body revision/change detected |
| Category renamed/deleted | Catalog and references reconciled consistently |
| Recipe deleted | Removed only after complete successful sync |
| Valid empty collection | Removes local recipes only after explicit valid complete empty manifest |
| Partial manifest/duplicate IDs/invalid schema | Reject; keep last-good data and last success |
| Edit/delete during transfer | Safely retry/fail via agreed protocol; no mixed activation |
| JSON transfer interrupted/process killed/low storage | Previous committed collection remains usable |
| Open/resume/connectivity change | Bounded authenticated availability check, no automatic recipe transfer |
| Reachable and equal collection revision | Prominent Sync hidden; quiet up-to-date/status/manual-check entry |
| Reachable and different revision | Show updates action only if compatible and sync enabled; includes deletions/category-only changes |
| No committed revision, including empty server | Show Download recipes when available; valid empty sync establishes baseline |
| Failed sync/newer status arrives during sync | Do not advance local revision without matching data commit; retain retry/update indication |
| API write/direct DB edit/cache cold or stale | Correct invalidation/defined refresh; coalesced rebuild; no false up-to-date claim or per-check full scan |
| Server disabled/invalid key/rate limit | Clear status; Sync unavailable; local browsing unaffected |
| Leave LAN/connection fails after availability check | Sync fails safely or becomes unavailable; offline reading continues |
| Restart/reboot in airplane mode | All synchronized text still usable |
| Photo library unavailable/slow | No effect: v1 mobile operations perform no photo/NAS work |
| Instructions include remote resources | No implicit image/network requests; safe text formatting |

## 5. Confirmed decisions

| Topic | Decision |
| --- | --- |
| Stack/editor | Ionic Angular + Capacitor; SQLite; VS Code daily workflow |
| Layout | Repository-root `Kiosk.Mobile/`, native lowercase `android/` |
| Identity | Kitchen Kiosk / `com.baileysoft.kiosk.mobile` |
| Devices | Android 13+; EM101A on 13, SM-P613/SM-T733 on 14, S23+ SM-S916U on 16; S22+ OS pending |
| Primary tablet | Tab S7 FE SM-T733 |
| Inventory | [Device details and setup checks](kiosk-mobile.plan.md#device-inventory-for-phase-2) |
| Orientation | Both orientations; landscape-first tablet layout |
| Distribution | Signed sideloaded APK; gifting optional |
| Server | API-first development/test, approved compatible deployment, live LAN integration |
| API base | `https://baileyfs02.baileysoft.lan/kiosk/api` |
| CA | Baileysoft LAN CA preinstalled; app trust verified in debug and signed release |
| Sync | Complete lightweight manifest/categories, only new/changed bodies, authoritative deletion on success |
| Availability | Throttled authenticated cached collection-revision checks; prominent action only for updates/first download; quiet status/manual check otherwise; no automatic recipe sync |
| Photos | All display/download/cache deferred from v1; photo indexing is separate future work |
| Exclusions | Accounts/login UI, writes, direct MySQL, remote sync, background recipe sync |
| Failure | Preserve last-good complete collection and last-success metadata |
| Access controls | `X-Kiosk-Mobile-Key` shared key, `MobileSync__Enabled` switch, fail-closed, global rate/concurrency limits (D-017) |
| Author/recommended | Display author username and the web app's any-user thumbs-up; filter by author locally; no favorite editing (D-018) |
| Ingredient order | Case-insensitive alphabetical; no authored-order migration |
| Revision freshness | Invalidated by API writes; direct MySQL edits need a service restart; single API process |

## 6. Change control

Check off only verified tasks. Keep the execution guide, this specification, and
the constitution aligned; preserve explicit approval for scope changes and live
deployments. Record commands/results without credentials or private recipe data.
The 2026-10-22 manifest/text-only amendment supersedes earlier all-thumbnail and
full-body snapshot decisions; no implementation or photo reindexing is implied.
