# Kitchen Kiosk Mobile

- Status: Android SQLite-backed reader and foreground sync are implemented. Live
  sync against the production LAN server was verified on the API 37 emulator
  (debug build) on 2026-11-12. The maintainer reports the debug APK installed
  and working on a physical phone as of 2026-11-12. Functional user acceptance
  testing is in progress over the next few weeks; final acceptance, broader
  device coverage, and signed release validation remain pending.
- Product scope: [Mobile constitution](../.copilot/kiosk-mobile.constitution.md)
- Development phases and evidence: [Mobile development plan](../.copilot/kiosk-mobile.plan.md)

This is a separate Ionic Angular + Capacitor app. Browser development uses
synthetic fixtures; Android reads its committed SQLite snapshot and does not
replace missing data with fixtures. Mobile v1 is text-only and must not call
photo endpoints.

## Prerequisites

- Node.js 22 and npm 10.
- Android Studio and JDK 21, plus Android SDK Platform 36, Build-Tools 35.0.0,
  Platform-Tools, and Command-line Tools.
- An Android 13+ device for manual sideloading, or an ADB-authorized device or
  configured emulator for automated installation.

See the mobile development plan for the selected toolchain matrix, setup steps,
and device checks. The Android SDK path and signing material must remain local
and must not be committed. Android Studio Rabbit 2 currently bundles JBR 25;
use the separately installed JDK 21 for Gradle because this project uses Gradle
8.14.3.

For terminal builds on this workstation, select the local JDK and SDK before
running Gradle:

```bash
export JAVA_HOME="$HOME/opt/jdk-21.0.13+9"
export ANDROID_HOME="$HOME/Android/Sdk"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"
```

In Android Studio, set **Settings > Build, Execution, Deployment > Build Tools
> Gradle > Gradle JDK** to the same JDK 21 installation.

## Build and install a debug APK

From the repository root:

```bash
cd Kiosk.Mobile
npm ci
npm run build:preview
npx cap sync android
cd android
./gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

`npm run build:preview`, `npx cap sync android`, and `./gradlew assembleDebug`
have been verified. Browser development shows synthetic recipes; Android uses
SQLite even in a development build. The wrapper used Gradle
8.14.3 with Temurin JDK 21.0.13+9. The APK
passed `apksigner verify`, installed on the `Medium_Phone_API_37.0` emulator
(`emulator-5554`, API 37), and launched successfully. `adb devices -l` showed
only that emulator; installation on the Tab S7 FE and other target hardware is
still pending. Gradle reported an SDK XML version 4 compatibility warning but
completed successfully.

### Run from VS Code

Use **Terminal > Run Task** to select **Mobile: Start Android Emulator**. After
Android finishes booting, run **Mobile: Build and Launch Preview on Emulator**.
That task builds the development bundle, syncs Capacitor, assembles the debug APK,
waits up to 120 seconds for ADB, installs it, and opens Kitchen Kiosk. Repeat it
after changing app code. If the AVD is already open, run the combined task alone.
The build task limits esbuild concurrency and disables preview source maps to
work around an observed local esbuild crash; it selects the `android` Gradle
project explicitly.

### Install manually without ADB

The debug APK is at
`android/app/build/outputs/apk/debug/app-debug.apk` after building. Transfer it
to the device using a trusted file-transfer method, open it from the device's
file manager, allow that app to install unknown apps if Android prompts, and
confirm installation. This APK has `minSdk` 33 and is debuggable/debug-signed;
it is for testing, not release distribution. Release builds must use a stable
release signing key for in-place updates.

Phone checklist before the first install:

1. Rebuild the APK after any code or key change; the file is not refreshed
   automatically.
2. Install the Baileysoft LAN CA on the phone as a user CA (*Settings >
   Security and privacy > More security settings > Install from device storage
   > CA certificate* on Samsung). Without it, the first sync fails with a
   certificate-trust error in the bell.
3. Join the home Wi-Fi so `recipes.baileysoft.lan` resolves.
4. Copy the APK over USB or another private channel. It contains the mobile
   key, so do not post it to shared or cloud folders, and delete the copy from
   the phone's Downloads after installing.
5. Open the APK and accept any Play Protect warning (*More details > Install
   anyway*).

Updates install in place only when signed by the same key. The debug key is
`~/.android/debug.keystore` on the build machine, so APKs built on a different
computer must replace the app by uninstalling first, which deletes the saved
recipes until the next sync.

## Android sync configuration

The shared mobile sync key is embedded in the APK at build time. The app reads
`src/assets/mobile-connection.json` at runtime from its packaged assets. This file is Git-ignored and is absent by default. Copy
`mobile-connection.example.json` to exactly that path (not the `Kiosk.Mobile/`
root), set the exact API base `https://recipes.baileysoft.lan/api` and the
server's `MobileSync__ApiKey` value (at least 32 characters), then rebuild the
APK. A copy accidentally left at `Kiosk.Mobile/mobile-connection.json` is also
ignored but is **not** packaged, so the app shows the unconfigured state.
Never put the real key in source control or chat.
Ignoring the file does **not** make the key secret: it is embedded in the APK
and can be extracted, so use only a revocable read-only mobile key.

If an administrator changes or revokes the server key, installed apps report
an authorization failure and keep browsing their last synchronized recipes.
Restoring sync currently requires rebuilding the APK with the new key and
installing it as an update. An in-app prompt for a replacement key is deferred
to a later phase.

Debug builds use Capacitor's verbose logging, which writes HTTP request headers,
including `X-Kiosk-Mobile-Key`, to `adb logcat`. Treat debug logs as sensitive
and do not share them unredacted. Release-build logging has not been verified
yet.

The device must trust the Baileysoft LAN CA and resolve the server hostname.
The Android network security configuration permits user-installed CAs only for
that hostname; certificate and hostname verification remain enabled. Without
the CA, requests fail with `Trust anchor for certification path not found` and
the app keeps its local data (observed on the emulator).

### Install the LAN CA on the emulator

The emulator has no LAN CA by default. Install the public CA certificate (not a
secret) as a user CA:

```bash
adb push /usr/local/share/ca-certificates/baileysoft-lan-ca.crt /sdcard/Download/
```

Then on the emulator open **Settings > Security & privacy > More security &
privacy > Encryption & credentials > Install a certificate > CA certificate**,
choose **Install anyway**, and pick the file from **Downloads**. Confirm it under
**Trusted credentials > User** as *BaileySoft LAN CA*. Physical devices need the
same CA installed through their own Settings.

## Current implementation

- Application ID: `com.baileysoft.kiosk.mobile`
- Minimum Android SDK: 33; compile and target SDK: 36
- Portrait navigation uses Home, Search, Categories, and Authors in a fixed
  bottom bar; landscape tablet widths use a side rail.
- Home is sorted newest first. Search supports title/ingredient, category, author,
  date/title ordering, and the aggregate recommended flag. Categories and the
  category search filter are sorted alphabetically by name, not ID.
- Recipe cards open a detail view with author, category, date, recommendation,
  ingredients, and sanitized formatted instructions. Details open at the top;
  returning to the list restores its scroll position and filters.
- The launcher icon is an adaptive vector icon: a white fork and knife (the
  Ionicons `restaurant` glyph, MIT, which also appears in the in-app brand mark)
  on brand orange `#B94A1D`. A monochrome layer is included for Android 13+
  themed icons. The source is `res/drawable-v24/ic_launcher_foreground.xml`,
  `res/drawable/ic_launcher_monochrome.xml`, and the `ic_launcher_background`
  color. The `mipmap-*dpi` PNGs are matching legacy fallbacks; with `minSdk` 33
  they are not normally used.
- The launch splash matches the icon: brand orange with the white fork and
  knife. `AppTheme.NoActionBarLaunch` sets `windowSplashScreenBackground`,
  `windowSplashScreenAnimatedIcon`, and `postSplashScreenTheme` for the Android
  12+ system splash. The launch background is the `res/drawable/splash.xml`
  layer list. The stock Capacitor `splash.png` files and the `drawable-port-*`
  and `drawable-land-*` folders were removed.
- The app is locked to portrait (`android:screenOrientation="portrait"` on
  `MainActivity`) for the first release; rotating the device does not change
  the layout. Android 16+ may ignore this lock on large screens (600 dp+) for
  apps targeting SDK 36. The current tablets run Android 13–14, so it should
  apply there, but this has not been checked on a tablet yet.
- Android loads its SQLite snapshot first, then checks the configured server and
  automatically attempts a foreground sync when its revision differs. The API,
  sync validation, and snapshot store have unit tests.
- Status messages live in a notification bell at the right of the header,
  not on the Home page. Tapping the bell always shows the current status (for
  example *Recipes are up to date.*) and a *Recent activity* list. Completed
  syncs and errors (storage, configuration, key rejected, server disabled/busy,
  untrusted certificate, invalid response) add an activity entry and show a
  **!** indicator on the bell until it is opened. Going offline, an unreachable
  server, checking, and up-to-date results update the current status only and
  never set the indicator. A repeated identical error does not set the indicator again.
  Activity history is kept in memory (20 entries) and resets when the app restarts.
- The bell panel opens with a server line: a colored dot, the state, and the
  host name from the build's `apiBase`, for example
  "● **Online:** recipes.baileysoft.lan" (*Home server* if the build is not
  configured). States are *Online*,
  *Checking*, *Unavailable*, *Not configured*, or *Loading*. There is no
  separate status chip in the header. The bell's accessible label includes the
  server state.
- A **refresh** button just left of the bell runs a sync on demand. It appears
  only while the server is online and spins while
  a check runs. Manual refreshes are limited to 5 per rolling 30 minutes. The
  attempt times are stored in WebView `localStorage`, so restarting the app does
  not reset the limit. At the limit the button is dimmed. Tapping it then puts the
  next available time in the bell and shows the **!** indicator. A server
  `Retry-After` delay also blocks manual refreshes. Automatic checks (app open,
  return to foreground, network restored, max one per 30 s) do not count
  toward the limit.
- Verified on the API 37 emulator (debug build, 2026-11-12): the first sync downloaded 478 recipes in five 100-id
  batches and committed one SQLite snapshot, then rechecked status. A relaunch
  with an unchanged revision made only the status request. A relaunch in
  airplane mode showed all recipes from SQLite, with *Unavailable* status. Recipe
  details rendered ingredients and sanitized instructions. Without the LAN CA,
  TLS failed closed.
- Physical-device compatibility, signed release builds, reboot persistence, and
  the remaining failure-injection cases are unverified. No photo handling is
  implemented.
