# Kitchen Kiosk Mobile

- Status: Development-only reader UI preview builds and runs on the API 37 emulator; physical-device acceptance remains pending.
- Product scope: [Mobile constitution](../.copilot/kiosk-mobile.constitution.md)
- Development phases and evidence: [Mobile development plan](../.copilot/kiosk-mobile.plan.md)

This is a separate Ionic Angular + Capacitor app. The current browse, search,
category, and author screens use clearly marked synthetic development fixtures.
Recipe storage, API integration, and synchronization are not implemented yet.
Mobile v1 is text-only and must not call photo endpoints.

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
have been verified. This development build includes synthetic recipes; the
normal `npm run build` production build excludes them. The wrapper used Gradle
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

## Current implementation

- Application ID: `com.baileysoft.kiosk.mobile`
- Minimum Android SDK: 33; compile and target SDK: 36
- Portrait navigation uses Home, Search, Categories, and Authors in a fixed
  bottom bar; landscape tablet widths use a side rail.
- Home is sorted newest first. Search supports title/ingredient, category, author,
  date/title ordering, and the aggregate recommended flag.
- Recipe cards open a detail view with author, category, date, recommendation,
  ingredients, and numbered instructions. Back navigation retains the list's
  filters. Detail content currently uses synthetic preview recipes only.
- Development builds show synthetic recipe/category/author fixtures; production
  builds remain empty until SQLite and API synchronization are implemented.
- No API calls, SQLite storage, synchronization, or photo handling are present.
- LAN certificate trust and the mobile API key must be addressed before API
  integration; do not disable TLS validation or embed credentials in the APK.
