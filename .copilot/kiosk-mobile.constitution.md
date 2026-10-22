# Kitchen-Kiosk Mobile Constitution

**Status:** Project baseline for the first release  
**Product:** Kitchen-Kiosk Mobile  
**Parent project:** [Kitchen-Kiosk](https://github.com/nealbailey/kitchen-kiosk)  
**Primary deliverable:** An installable Android APK that provides a polished, offline, read-only recipe-book experience.

## 1. Executive Summary

Kitchen-Kiosk Mobile is a companion Android application for the existing Kitchen-Kiosk recipe system. It is intended to be installed on a tablet given to family members as a Christmas gift.

The mobile app downloads a complete snapshot of recipe data from the existing Kitchen-Kiosk API while the tablet is connected to the owner's home LAN. It stores the data in a local SQLite database and caches recipe thumbnails on the device. After a successful synchronization, recipe browsing must work without a network connection.

The first release is deliberately small in scope: it is a read-only recipe reader, not a second recipe-management application. It has no user accounts, login, create, edit, delete, or other recipe-writing workflows.

## 2. Product Goals

1. Deliver an attractive, simple, touch-friendly recipe experience on an Android tablet.
2. Make all synchronized recipe content available offline.
3. Provide one explicit **Synchronize** action to refresh the local recipe collection.
4. Reuse the existing Kitchen-Kiosk API and thumbnail endpoint wherever practical.
5. Keep the mobile application separate from the existing web frontend and minimize disruption to the current product.
6. Make synchronization resilient: a failed or interrupted refresh must not destroy the last known-good local recipe collection.
7. Keep the first release easy to build, test, install, and maintain.

## 3. Use Cases

### UC-01: Browse recipes offline
A family member opens the app and browses previously synchronized recipes while the tablet has no network connection. Recipe lists, details, ingredients, instructions, categories, and cached thumbnails are read from local storage.

### UC-02: Find a recipe
A family member searches recipes by title and/or filters by category using the local dataset. Searching and filtering must not require API calls.

### UC-03: Read a recipe
A family member opens a recipe and sees its available details, ingredients, instructions, category, and thumbnail in a legible tablet-oriented layout.

### UC-04: Synchronize at the owner's home
The owner connects the tablet to the home LAN, opens the app, and taps **Synchronize**. The app downloads the complete recipe snapshot and associated thumbnails, validates the new dataset, and activates it only when the refresh is complete.

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
- Explicit, user-initiated full synchronization over the home LAN.
- Local SQLite storage for recipe data.
- Local caching of recipe thumbnails downloaded from the existing thumbnail API.
- Last-successful-sync timestamp and basic progress/error feedback.
- Graceful offline operation after at least one successful sync.
- A documented build and release process.

### Explicitly excluded
- User accounts, login, profiles, or role management in the mobile app.
- Creating, editing, deleting, or writing recipe data.
- Favorites, ratings, comments, or other user-generated data.
- Automatic/background synchronization.
- Remote synchronization from outside the owner's home LAN.
- Direct connections from the mobile app to MySQL.
- Full-resolution/original recipe-photo downloads.
- Incremental/delta synchronization in the first release.
- Push notifications or cloud services introduced solely for the mobile app.

## 5. Technology Recommendations

### Mobile UI and packaging
**Ionic Angular + Capacitor** is the recommended approach. It allows the project to use Angular, TypeScript, HTML, and CSS while packaging the application as a native Android APK. Ionic components can provide mobile-friendly navigation and touch targets.

Create a **separate mobile project** rather than attempting to reuse the existing desktop web UI unchanged. Reuse compatible data contracts and domain concepts where sensible, but keep mobile navigation and presentation independent.

### Local database
Use **SQLite** through a maintained Capacitor-compatible SQLite plugin. The local database is the authoritative source for all browsing after synchronization. Do not depend on browser local storage as the primary recipe database.

### Local images
Download thumbnails from the existing Kitchen-Kiosk thumbnail endpoint and store them in application-private local storage. Store local relative paths or stable local identifiers in the database. Never require a live API request to display a cached thumbnail.

### Server/API
Continue using the existing Kitchen-Kiosk C#/.NET API and MySQL database. Add a dedicated, read-only mobile synchronization endpoint, tentatively:

`GET /api/mobile/sync`

The final route and DTO must be confirmed against the current repository conventions before implementation. The endpoint should return a versioned JSON snapshot containing all fields required by the mobile reader and sufficient metadata to locate each thumbnail. The app should download thumbnail bytes separately rather than embedding images as base64 in the JSON.

### Development environment
- VS Code for everyday source editing and Git workflows.
- Node.js/npm compatible with the selected Ionic/Angular and Capacitor versions.
- Android Studio for Android SDK, platform/build tools, emulator, device configuration, and native project troubleshooting.
- A JDK version supported by the selected Android Gradle Plugin.
- A real Android tablet for final acceptance testing.

The existing workstation has used Node.js 22 and npm 10.9.8; confirm compatibility with the chosen Ionic/Angular versions before pinning project dependencies.

## 6. Architecture and Data Flow

1. The tablet communicates with the existing API only during an explicitly initiated synchronization.
2. Synchronization is expected to take place while the tablet is connected to the owner's home LAN.
3. The app requests a complete recipe snapshot from the mobile sync endpoint.
4. The app downloads the referenced thumbnails using the existing thumbnail API, requesting thumbnail-sized JPEGs rather than original camera images.
5. The app validates the snapshot and downloads before activating the new dataset.
6. The recipe database and corresponding thumbnail set are stored locally.
7. All routine reading, searching, category filtering, and image display use local data and files.

The mobile app must never connect directly to MySQL. It must not expose write actions in the UI or call write endpoints as part of normal operation.

## 7. Synchronization and Data Integrity Principles

- **Full snapshot for v1:** Prefer a complete snapshot over incremental synchronization for simplicity and reliability.
- **Explicit action:** Synchronization occurs only after the user taps the button.
- **Validate before activation:** Verify the HTTP response, schema version, required fields, and thumbnail downloads before replacing the active dataset.
- **Preserve last-known-good data:** Failed or interrupted synchronization must not leave the app with a partially replaced recipe collection.
- **Atomic activation:** Use a transaction and/or staging database and staged image directory; activate the new data only after successful validation.
- **Image consistency:** Keep the active database and active thumbnail files in sync. Do not remove files used by the current dataset during a refresh.
- **Status clarity:** Distinguish the last successful sync from the last attempted sync.
- **Schema versioning:** Include a schema version in the sync response so incompatible future changes can be detected explicitly.
- **No unnecessary payload:** Fetch thumbnails through the existing thumbnail endpoint; never download full-resolution originals for the mobile app.
- **Stable identifiers:** Preserve existing server recipe/category/ingredient identifiers where available.

The initial thumbnail width should be configurable and begin at approximately **300 pixels** for evaluation on the target tablet. Confirm the actual endpoint route, accepted parameters, response content type, and behavior from the repository before implementation; do not assume a route or parameter name without verification.

## 8. User Experience Principles

- Design for tablet use first: readable typography, generous spacing, touch-friendly controls, and clear hierarchy.
- Keep the main experience focused on finding and reading recipes.
- Provide obvious category navigation and recipe search.
- Render recipe instructions and supported formatting safely and legibly.
- Show a visible Synchronize action and progress/status feedback.
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
- Treat the APK as a client, not as a security boundary. Server-side authorization and endpoint design remain important even though the UI is read-only.
- Do not disable TLS certificate validation to work around certificate problems.

## 10. Quality Attributes and Acceptance Principles

The first release is acceptable when:
- It can be installed on the target Android tablet as an APK.
- It can synchronize all required recipe data and thumbnails on the home LAN.
- After a successful sync, airplane mode does not prevent browsing, searching, or viewing cached thumbnails.
- It provides no recipe mutation UI or workflow.
- A failed sync preserves the previous complete dataset.
- It does not download original/full-resolution recipe photos.
- It reports last successful sync and useful errors.
- It remains usable after app restarts and device reboots.
- Its build and installation steps are documented and repeatable.

## 11. Project Governance

This constitution defines the stable product intent and architectural guardrails. Implementation details may evolve when repository inspection or testing reveals a better approach, but changes should preserve the first-release goals: offline-first, read-only, home-LAN synchronization, thumbnail-only images, and safe full refreshes.

The companion `kiosk-mobile.spec.md` is the working implementation plan and checklist. Update that file as phases are completed, decisions are confirmed, and tests establish actual behavior.

## 12. Repository and Verification Notes

Reference repository: https://github.com/nealbailey/kitchen-kiosk

Before implementing API or photo integration, inspect the current repository and verify:
- Actual recipe, category, ingredient, instruction, and photo models.
- Existing endpoint conventions and pagination behavior.
- Exact thumbnail endpoint route, parameters, and JPEG behavior.
- Whether recipes can have zero, one, or multiple photos.
- How instructions are stored and formatted.
- Current API HTTPS/base URL configuration and Android certificate trust requirements.

Examples in project planning documents are architectural guidance, not substitutes for verifying actual source code.
