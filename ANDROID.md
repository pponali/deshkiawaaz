# DeshKiAwaaz Android App

This document covers building and deploying the Android version of DeshKiAwaaz.

## Prerequisites

- Node.js 18+
- pnpm
- Android Studio (for development) or Android SDK (for CI/CD)
- Java 17+

## Quick Start

### Development Build

```bash
# Install dependencies
pnpm install

# Build web app and sync to Android
pnpm android:build

# Open in Android Studio
pnpm cap:open:android
```

### Running on Device/Emulator

```bash
# Build and run
pnpm android:run
```

## Production Build

### 1. Set Up Signing Key

Create a release keystore (one-time setup):

```bash
keytool -genkey -v -keystore android/release-key.keystore \
  -alias deshkiawaaz \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

### 2. Configure Signing

Copy and edit keystore properties:

```bash
cp android/keystore.properties.example android/keystore.properties
```

Edit `android/keystore.properties`:
```properties
storeFile=release-key.keystore
storePassword=your_keystore_password
keyAlias=deshkiawaaz
keyPassword=your_key_password
```

### 3. Add Firebase Config

Download `google-services.json` from Firebase Console and place it in:
```
android/app/google-services.json
```

### 4. Build Release APK

```bash
pnpm android:release
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

### 5. Build Release Bundle (for Play Store)

```bash
pnpm android:bundle
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

## Version Management

Update version in `android/app/build.gradle`:

```gradle
versionCode 1        // Increment for each release
versionName "1.0.0"  // Semantic version
```

## Push Notifications Setup

1. Enable Cloud Messaging in Firebase Console
2. Download updated `google-services.json`
3. The app will automatically register for push notifications on launch

## Deep Linking

The app supports deep links:
- `https://deshkiawaaz.com/*`
- `deshkiawaaz://*`

Configure App Links in Play Console for `https://` scheme verification.

## Troubleshooting

### Build Fails with Gradle Error

```bash
cd android
./gradlew clean
cd ..
pnpm android:build
```

### Plugin Not Found

```bash
npx cap sync android
```

### Java Version Issues

Ensure JAVA_HOME points to Java 17+:
```bash
export JAVA_HOME=/path/to/java17
```

## CI/CD (GitHub Actions)

The project includes GitHub Actions workflow for automated Android builds.

Required secrets:
- `KEYSTORE_BASE64` - Base64-encoded keystore file
- `KEYSTORE_PASSWORD` - Keystore password
- `KEY_ALIAS` - Key alias
- `KEY_PASSWORD` - Key password
- `FIREBASE_SERVICE_ACCOUNT` - Firebase service account JSON

## App Store Checklist

Before submitting to Play Store:

- [ ] Update `versionCode` and `versionName`
- [ ] Test on multiple screen sizes
- [ ] Test on Android 7.0+ (API 24+)
- [ ] Verify push notifications work
- [ ] Test deep links
- [ ] Prepare store listing (screenshots, description)
- [ ] Create privacy policy
- [ ] Set up app signing by Google Play

## Architecture

```
android/
├── app/
│   ├── src/main/
│   │   ├── AndroidManifest.xml    # App manifest
│   │   ├── assets/public/         # Web app files (auto-generated)
│   │   ├── java/.../MainActivity  # Main activity
│   │   └── res/                   # Android resources
│   ├── build.gradle               # App-level build config
│   └── proguard-rules.pro         # Code obfuscation rules
├── build.gradle                   # Project-level build config
├── variables.gradle               # SDK versions
└── keystore.properties.example    # Signing config template
```

## Resources

- [Capacitor Android Docs](https://capacitorjs.com/docs/android)
- [Play Console](https://play.google.com/console)
- [Firebase Console](https://console.firebase.google.com)
