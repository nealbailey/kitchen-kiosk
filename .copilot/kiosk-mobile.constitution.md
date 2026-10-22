# Kitchen-Kiosk Mobile Constitution

**Status:** Project baseline for the first release  
**Version:** 1.2; amended with maintainer approval on 2026-10-22
**Product:** Kitchen-Kiosk Mobile  
**Parent project:** [Kitchen-Kiosk](https://github.com/nealbailey/kitchen-kiosk)  
**Primary deliverable:** An installable Android APK that provides a polished, offline, read-only recipe-book experience.

## 1. Executive Summary

Kitchen-Kiosk Mobile is a companion Android application for the existing Kitchen-Kiosk recipe system, used on family tablets and phones. A Christmas gift installation is optional.

While connected to the owner's home LAN, the app obtains an authoritative lightweight recipe ID/revision manifest and category catalog. It downloads only new or changed recipe bodies, removes server-deleted recipes after a successful sync, and stores the complete resulting collection in SQLite. The first sync downloads all recipe bodies. Browsing works offline afterward. Photos are deferred entirely from v1.

The first release is deliberately small in scope: it is a read-only recipe reader, not a second recipe-management application. It has no user accounts, login, create, edit, delete, or other recipe-writing workflows.

## 2. Product Goals

1. Deliver an attractive, simple, touch-friendly recipe experience on an Android tablet.
2. Make all synchronized recipe content available offline.
3. Provide one explicit **Synchronize** action to refresh the local recipe collection.
4. Extend the existing Kitchen-Kiosk API with bounded, read-only mobile sync operations without NAS photo enumeration.
5. Keep the mobile application separate from the existing web frontend and minimize disruption to the current product.
6. Make synchronization resilient: a failed or interrupted refresh must not destroy the last known-good local recipe collection.
7. Keep the first release easy to build, test, install, and maintain.

## 3. Use Cases

### UC-01: Browse recipes offline
A family member opens the app and browses previously synchronized recipes without a network connection. Lists, details, ingredients, instructions, and categories are read from local storage.

### UC-02: Find a recipe
A family member searches recipes by title and/or filters by category using the local dataset. Searching and filtering must not require API calls.

### UC-03: Read a recipe
A family member opens a recipe and sees its available text details, ingredients, instructions, and categories in a legible tablet/phone layout.

### UC-04: Synchronize at the owner's home
The user connects to the home LAN and opens the app. A lightweight authenticated check returns sync availability and a cached collection revision. Show the prominent **Synchronize** action only if the server allows sync and its revision differs from the device's last successfully committed revision. On first use, show **Download recipes** when available, even for an empty collection. When revisions match, hide the prominent action and provide a quiet status/manual-check entry. After the user taps it, fetch the manifest/categories and changed bodies, validate, and atomically commit. Losing connectivity preserves the previous collection.

### UC-05: Recover from synchronization failure
If the server is unavailable, a request fails, a download is incomplete, or the response is invalid, the app reports a clear failure and continues to show the previously synchronized dataset.

### UC-06: Inspect synchronization status
The user can see the last successful synchronization time and a useful summary of the most recent synchronization, including recipe count and any failure message.

## 4. First-Release Scope

### Included
- Android APK installation on a target tablet.
- Read-only recipe browsing.
- Recipe search and category filtering, implemented locally.
- Recipe detail view, ingredients, and instructions.
- Explicit, user-initiated manifest-based synchronization over the home LAN.
- Initial full recipe-body download; subsequent downloads include only new/changed bodies.
- Removal of server-deleted recipes on successful sync and refresh of the category catalog.
- Lightweight authenticated availability checks on open/resume and connectivity changes; visible unavailable/error status when sync cannot run.
- Collection-revision comparison suppresses the prominent Sync action when up to date; quiet status/manual checking and explicit failure/retry feedback remain available.
- Local SQLite storage for recipe data.
- Last-successful-sync timestamp and basic progress/error feedback.
- Graceful offline operation after at least one successful sync.
- A documented build and release process.

### Explicitly excluded
- User accounts, login, profiles, or role management in the mobile app.
- Creating, editing, deleting, or writing recipe data.
- Favorites, ratings, comments, or other user-generated data.
- Automatic/background recipe synchronization (lightweight availability checks are allowed).
- Remote synchronization from outside the owner's home LAN.
- Direct connections from the mobile app to MySQL.
- All photo display, photo metadata synchronization, thumbnail downloads/caching, and original-photo downloads.
- NAS indexing and photo subsystem changes; these are separate future proposals.
- Persistent server change-log/cursor infrastructure unless separately approved.
- Push notifications or cloud services introduced solely for the mobile app.

## 5. Technology Recommendations

### Mobile UI and packaging
**Ionic Angular + Capacitor** is the recommended approach. It allows the project to use Angular, TypeScript, HTML, and CSS while packaging the application as a native Android APK. Ionic components can provide mobile-friendly navigation and touch targets.

Create a **separate mobile project** rather than attempting to reuse the existing desktop web UI unchanged. Reuse compatible data contracts and domain concepts where sensible, but keep mobile navigation and presentation independent.

### Local database
Use **SQLite** through a maintained Capacitor-compatible SQLite plugin. The local database is the authoritative source for all browsing after synchronization. Do not depend on browser local storage as the primary recipe database.

### Local images
No image subsystem in v1. Do not call photo endpoints, enumerate NAS directories,
or render remote embedded images from instructions. A future indexed photo design
requires its own contract, migration/reconciliation process, and approval.

### Server/API
Continue using the existing C#/.NET API and MySQL database. Define read-only mobile
operations for lightweight availability, an authoritative full ID/revision
manifest with categories, and bounded changed-recipe body retrieval.

`/api/mobile/sync` remains a tentative route family, not a finalized one-response snapshot contract.

Finalize routes/DTOs in Phase 1. The manifest must represent all recipes, with
revisions covering all mobile-visible text and relationships. Recipe `Date` alone
is not a reliable cursor: deletion, supplied creation dates, tied timestamps, and
category/ingredient changes must be handled. Define consistent manifest/body
validation under concurrent edits before implementation.

Availability returns an opaque cached `collectionRevision` alongside sync-enabled
and compatibility status. It covers recipe additions/edits/deletions, ingredients,
relationships, and the category catalog. Status requests must not rebuild content
hashes or scan the collection on every check. Invalidate cached state after
relevant successful API writes, serialize/coalesce rebuilding, and define bounded
refresh for direct database changes and restart/multiple-instance behavior in
Phase 1. Pending/stale revision state must be explicit, not "up to date".

### Development environment
- VS Code for everyday source editing and Git workflows.
- Node.js/npm compatible with the selected Ionic/Angular and Capacitor versions.
- Android Studio for Android SDK, platform/build tools, emulator, device configuration, and native project troubleshooting.
- A JDK version supported by the selected Android Gradle Plugin.
- A real Android tablet for final acceptance testing.

The existing workstation has used Node.js 22 and npm 10.9.8; confirm compatibility with the chosen Ionic/Angular versions before pinning project dependencies.

## 6. Architecture and Data Flow

1. On open/resume and connectivity changes, a throttled authenticated check returns availability and cached collection revision; it never downloads the collection. Optional foreground-only periodic checks require a defined modest interval; no background polling or notifications.
2. Only tapping Synchronize starts manifest and recipe-body transfers.
3. Compare the complete manifest against locally committed revisions; fetch all bodies initially and only new/changed ones subsequently.
4. Refresh categories and determine deletions from the complete authoritative manifest, never an incomplete page or failed response.
5. Validate schema, completeness, references, and body revisions. Conflicting concurrent changes require safe retry/failure, not mixed-version activation.
6. Commit the complete local change set, corresponding manifest collection revision, and last-success metadata atomically in SQLite. Never save a newer status-check revision as though its data were synchronized.
7. All routine reading, searching, and category filtering use local data. LAN unavailability disables Sync without preventing browsing.

The mobile app must never connect directly to MySQL. It must not expose write actions in the UI or call write endpoints as part of normal operation.

## 7. Synchronization and Data Integrity Principles

- **Manifest-based refresh:** Transfer a complete lightweight inventory, but only changed recipe bodies; no date-only high-water mark.
- **Explicit action:** Synchronization occurs only after the user taps the button.
- **Validate before activation:** Verify responses, schema, complete manifest, categories, required fields, body revisions, and relationship integrity before applying changes.
- **Preserve last-known-good data:** Failed or interrupted synchronization must not leave the app with a partially replaced recipe collection.
- **Atomic activation:** Stage/validate changes, then transactionally apply upserts, deletions, categories, revisions, and last-success metadata. Partial refreshes must not become visible.
- **Deletion safety:** Remove missing recipes only from a verified complete authoritative manifest; retain all current data if the operation fails.
- **Status clarity:** Distinguish the last successful sync from the last attempted sync.
- **Collection revision:** Persist only the revision corresponding to successfully validated/committed data. Failed sync retains the prior revision. Recheck status afterward so a concurrent newer collection can still show updates.
- **Schema versioning:** Include a schema version in the sync response so incompatible future changes can be detected explicitly.
- **No image work:** V1 availability/manifest/body paths must perform no photo calls or NAS enumeration.
- **Stable identifiers:** Preserve existing server recipe/category/ingredient identifiers where available.

Revision semantics and concurrency handling must be proven by tests, not inferred
from recipe dates. A content-derived revision over deterministic mobile DTOs is
a candidate; its precise encoding and validation protocol are Phase 1 decisions.

## 8. User Experience Principles

- Design for tablet use first: readable typography, generous spacing, touch-friendly controls, and clear hierarchy.
- Keep the main experience focused on finding and reading recipes.
- Provide obvious category navigation and recipe search.
- Render recipe instructions and supported formatting safely and legibly.
- Show prominent **Recipe updates available - Sync** only for a reachable, compatible, sync-enabled server with a different collection revision; first use shows **Download recipes**. Equal revisions hide the prominent action.
- Keep a quiet status/manual **Check for updates** entry for up-to-date and unavailable states. Report unavailable, disabled, unauthorized, rate-limited, and revision-pending states there without repeated alerts; retain explicit error/retry feedback after a user-initiated failure.
- Revalidate on tap because connectivity and revisions can change; do not equate reachability alone with updates or sync permission.
- Display the last successful synchronization time and number of locally stored recipes.
- Never make ordinary browsing depend on connectivity.
- Provide clear empty, loading, no-results, and error states.
- Avoid clutter and avoid introducing settings or features that are not needed for the gift-ready first release.

## 9. Security and Network Constraints

- Synchronization is intended to work only on the owner's home LAN for the first release.
- Do not expose MySQL or introduce remote access merely to support mobile synchronization.
- Use HTTPS if supported by the existing LAN deployment and ensure the Android app trusts the server certificate correctly. Test this on the actual tablet; certificate trust on Android must not be assumed.
- Do not embed administrator credentials, database credentials, or permanent privileged secrets in the APK.
- The sync endpoint must be read-only and return only data intended for the mobile recipe reader.
- Server reachability is not proof of LAN membership. Preserve LAN access controls, TLS validation, and bounded availability/request behavior.
- A limited-scope sync key, server enable/disable switch, and rate/concurrency limits are recommendations still to finalize in Phase 1. An APK key is extractable, not trusted app identity; do not claim ordinary existing public endpoints become private.
- Treat the APK as a client, not as a security boundary. Server-side authorization and endpoint design remain important even though the UI is read-only.
- Do not disable TLS certificate validation to work around certificate problems.

## 10. Quality Attributes and Acceptance Principles

The first release is acceptable when:
- It can be installed on the target Android tablet as an APK.
- It can synchronize the complete text collection through a manifest and changed-body downloads on the home LAN, including category refresh and deletion handling.
- After a successful sync, airplane mode does not prevent browsing, searching, or reading.
- It provides no recipe mutation UI or workflow.
- A failed sync preserves the previous complete dataset.
- It makes no photo requests or NAS enumeration calls as part of mobile v1 operations.
- It reports last successful sync and useful errors.
- It remains usable after app restarts and device reboots.
- Its build and installation steps are documented and repeatable.

## 11. Project Governance

This constitution defines the stable product intent and architectural guardrails:
offline-first, read-only, home-LAN availability, explicit manifest-based text
synchronization, and safe transactional refreshes. Photo support is deferred.

The [specification](kiosk-mobile.spec.md) retains feature/acceptance checklists;
the [plan](kiosk-mobile.plan.md) owns phase execution. Update both as decisions
and verified behavior change.

### Amendment record

| Version | Date | Approval and change |
| --- | --- | --- |
| 1.1 | 2026-10-22 | Maintainer explicitly approved text-only v1, full ID/revision manifest with changed-body transfers, deletion reconciliation, and lightweight authenticated availability checks. Supersedes full-body/photo snapshot scope and the prohibition on incremental recipe transfers. No implementation claimed. |
| 1.2 | 2026-10-22 | Maintainer approved cached collection-revision checks: prominent Sync only for available updates/first download, quiet status/manual checks otherwise; persist revision only with successful data commit. Phase 1 must define invalidation/rebuild and external-write refresh behavior. |

## 12. Repository and Verification Notes

Reference repository: https://github.com/nealbailey/kitchen-kiosk

Before implementing API integration, inspect the current repository and verify:
- Actual recipe, category, ingredient, instruction models, and revision coverage.
- Existing endpoint conventions and pagination behavior.
- No mobile v1 path depends on photo endpoints or directory enumeration.
- How instructions are stored and formatted.
- Current API HTTPS/base URL configuration and Android certificate trust requirements.

Examples in project planning documents are architectural guidance, not substitutes for verifying actual source code.
