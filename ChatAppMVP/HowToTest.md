# How to Test ChatAppMVP - Complete Testing Guide

This guide covers testing the ChatAppMVP application in both **Expo Go** (QR code demo) and **local APK builds** (custom dev client with push notifications).

---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Option 1: Testing in Expo Go (Quick Demo)](#option-1-testing-in-expo-go-quick-demo)
- [Option 2: Testing with Local APK Build](#option-2-testing-with-local-apk-build)
- [Testing Features](#testing-features)
- [Testing Push Notifications](#testing-push-notifications)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Node.js** (v18 or later)
- **npm** or **yarn**
- **Expo CLI** (installed globally): `npm install -g expo-cli`
- **EAS CLI** (installed globally): `npm install -g eas-cli`

### For Expo Go Testing
- **Expo Go app** installed on your Android/iOS device
  - Android: [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
  - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)

### For Local APK Building
- **Android Studio** (for Android emulator or building APK)
- **Physical Android device** (recommended for testing push notifications)

### AWS Configuration

Environment variables must be configured:
1. Contact project administrator for AWS credentials
2. Configuration is managed via `app.config.js` and environment variables
3. **Never commit** `.env` files or AWS credentials to version control

---

## Option 1: Testing in Expo Go (Quick Demo)

**Best for:** Quick demos, stakeholder presentations, development without native modules

### Step 1: Install Dependencies

```bash
cd ChatAppMVP
npm install
```

### Step 2: Start Development Server

```bash
npm run start
```

Or specifically for your device:
```bash
# For Android
npm run android

# For iOS  
npm run ios
```

### Step 3: Scan QR Code

1. The Metro bundler will display a QR code in your terminal
2. Open **Expo Go** app on your device
3. Tap **"Scan QR Code"**
4. Scan the QR code from your terminal
5. App will load automatically

### Step 4: Test Core Features

✅ **What Works in Expo Go:**
- User authentication (sign up, sign in, sign out)
- Chat messaging (real-time)
- GraphQL subscriptions
- Offline caching
- User profiles
- Conversation lists
- Network status monitoring

⚠️ **Limitations in Expo Go:**
- **Push notifications are mocked** (see notifications in console logs)
- Cannot test actual push notification delivery
- Some native features may be limited

### Quick Test Checklist

- [ ] Sign up with email and password
- [ ] Verify email with confirmation code
- [ ] Sign in with credentials
- [ ] View chat list
- [ ] Create/join a conversation
- [ ] Send messages
- [ ] Receive real-time messages
- [ ] Test offline mode (airplane mode)
- [ ] Sign out

---

## Option 2: Testing with Local APK Build

**Best for:** Complete feature testing, push notifications, production-like environment

### Method A: Using Expo Prebuild (Recommended)

#### Step 1: Generate Native Directories

```bash
cd ChatAppMVP
npx expo prebuild --clean
```

This generates:
- `android/` directory with Gradle build files
- `ios/` directory with Xcode project files
- Proper Expo module autolinking

#### Step 2: Build APK with Gradle

**Option 1: Using npx (Recommended)**
```bash
cd ChatAppMVP
npx expo run:android
```

**Option 2: Using Gradle directly**
```bash
cd ChatAppMVP/android
./gradlew assembleDebug

# On Windows:
gradlew.bat assembleDebug
```

The APK will be generated at:
```
ChatAppMVP/android/app/build/outputs/apk/debug/app-debug.apk
```

#### Step 3: Install APK on Device

**Using ADB:**
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

**Manual Installation:**
1. Copy `app-debug.apk` to your device
2. Enable "Install from Unknown Sources" in device settings
3. Tap the APK file to install

#### Step 4: Test All Features

✅ **Everything Works:**
- All Expo Go features
- **Real push notifications** 
- Native module integrations
- Full offline/online sync
- Image uploads (when implemented)
- Complete production feature set

---

### Method B: Using EAS Build (Cloud Build)

#### Step 1: Configure EAS

```bash
cd ChatAppMVP
eas login
eas build:configure
```

#### Step 2: Build Development Client

```bash
# Build APK for Android
npm run build:dev:android

# Or use EAS directly
eas build --profile development --platform android
```

Build takes 15-20 minutes. You'll receive:
- Email notification when complete
- Download link for APK
- Build logs and artifacts

#### Step 3: Download and Install

1. Click the download link from EAS email/dashboard
2. Transfer APK to your device
3. Install the APK
4. The app is now a custom dev client with all native modules

#### Step 4: Start Development Server

```bash
cd ChatAppMVP
npm run dev:android
```

This starts Metro bundler in dev client mode. Scan the QR code with your custom dev client app.

---

### Method C: Using Android Studio

#### Step 1: Open Project in Android Studio

1. Launch **Android Studio**
2. Select **"Open an Existing Project"**
3. Navigate to `ChatAppMVP/android`
4. Wait for Gradle sync to complete

#### Step 2: Configure Build

1. Select **Build Variant**: `debug`
2. Select target device (emulator or physical device)
3. Click **Run** (green play button) or press `Shift+F10`

#### Step 3: Build APK

```
Build → Build Bundle(s) / APK(s) → Build APK(s)
```

APK location will be shown in a notification at bottom right.

---

## Testing Features

### Authentication Flow

**1. Sign Up**
```
Email: test@example.com
Password: Test123456!
Display Name: Test User
Username: testuser
```

**2. Email Verification**
- Check email for verification code
- Enter 6-digit code
- Account is activated

**3. Sign In**
- Use registered email and password
- JWT token is stored locally
- Auto-refresh on app restart

### Real-Time Messaging

**Test Scenario 1: Same Conversation, Two Devices**
1. Install app on two devices
2. Sign in with different accounts
3. Start a conversation
4. Send messages from Device A
5. Verify messages appear instantly on Device B
6. Verify GraphQL subscriptions are working

**Test Scenario 2: Offline Mode**
1. Send a message while online
2. Turn on airplane mode
3. Send another message (should be cached)
4. Turn off airplane mode
5. Verify cached message syncs to server

### Network Status

- Toggle airplane mode
- Watch status bar change (online/offline)
- Send messages while offline
- Verify they sync when back online

### Performance Testing

```bash
# Monitor app performance
adb logcat | grep ChatAppMVP

# Monitor network calls
adb logcat | grep GraphQL

# Monitor memory usage
adb shell dumpsys meminfo com.ciscodg.ChatAppMVP
```

---

## Testing Push Notifications

### Prerequisites

Push notifications require:
- ✅ Custom dev client or APK build (not Expo Go)
- ✅ Physical device (emulators have limitations)
- ✅ Expo push notification service configured

### Step 1: Get Push Token

When app starts on custom dev client/APK:
```typescript
import NotificationService from './src/services/notification';

// In your app startup
const token = await NotificationService.registerForPushNotifications();
console.log('Push Token:', token);
```

Check console logs for your Expo push token:
```
ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
```

### Step 2: Send Test Notification (Local)

```typescript
// From within the app
NotificationService.sendTestNotification();
```

This sends a local notification immediately.

### Step 3: Send Push Notification (Remote)

Use Expo's push notification tool: https://expo.dev/notifications

1. Go to https://expo.dev/notifications
2. Enter your Expo push token from Step 1
3. Enter message title and body
4. Click **"Send a Notification"**
5. Notification should appear on device

### Step 4: Test Notification Tapping

1. Receive a notification
2. Tap on it
3. App should open and navigate to relevant conversation
4. Check `NotificationService.addNotificationResponseListener()` handling

### Automated Testing Script

```typescript
// Example notification test
async function testNotifications() {
  // Register
  const token = await NotificationService.registerForPushNotifications();
  console.log('✅ Registered:', token);

  // Send local
  await NotificationService.sendLocalNotification({
    title: 'Test',
    body: 'Local notification test',
  });
  console.log('✅ Local notification sent');

  // Schedule for later
  const scheduledId = await NotificationService.scheduleNotification(
    {
      title: 'Scheduled Test',
      body: 'This was scheduled',
    },
    { seconds: 10 }
  );
  console.log('✅ Scheduled notification:', scheduledId);
}
```

---

## Troubleshooting

### Expo Go Issues

**App won't load / QR code doesn't work**
```bash
# Clear cache and restart
npx expo start --clear
```

**"Network response timed out"**
- Ensure device and computer are on same WiFi network
- Disable firewall temporarily
- Try tunnel mode: `npx expo start --tunnel`

**AWS authentication errors**
- Verify environment variables are set
- Check `amplifyConfig.ts` has correct endpoints
- Run `npx expo start --clear` to reset cache

### Local Build Issues

**Gradle build fails**
```bash
# Clear Gradle cache
cd ChatAppMVP/android
./gradlew clean

# Delete build directories
rm -rf android/app/build
rm -rf android/build

# Rebuild
npx expo prebuild --clean
```

**"Could not find package"**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install

# Re-run prebuild
npx expo prebuild --clean
```

**Autolinking errors**
```bash
# Ensure you're not using new architecture
# In app.config.js:
newArchEnabled: false

# Clear and rebuild
npx expo prebuild --clean
```

### Push Notification Issues

**No push token received**
- Ensure running on custom dev client (not Expo Go)
- Check device permissions: Settings → Apps → ChatAppMVP → Notifications
- Verify physical device (emulators may not work)

**Notifications not appearing**
- Check notification permissions
- Verify device is not in Do Not Disturb mode
- Test with local notification first
- Check console logs for errors

**Token registration fails**
- Verify `eas.json` has correct `projectId`
- Ensure AWS push configuration is set (SNS/Pinpoint) before testing
- Check `app.config.js` plugins section

### AWS/AppSync Issues

**"No current user" error**
- User token may have expired
- Sign out and sign back in
- Check Cognito user pool status in AWS Console

**GraphQL errors**
- Verify AppSync endpoint in environment config
- Check user is authenticated
- Verify IAM permissions for Cognito authenticated users
- Check AppSync schema matches client queries

**Subscription not receiving updates**
- Verify WebSocket connection in Network tab
- Check Cognito user has permission for subscriptions
- Ensure subscription filter is correct
- Try disconnecting/reconnecting

### Device-Specific Issues

**Android emulator networking**
```bash
# Use 10.0.2.2 instead of localhost
# Or use real device IP address
```

**iOS simulator issues**
- Clean build: Product → Clean Build Folder (Cmd+Shift+K)
- Reset simulator: Device → Erase All Content and Settings

---

## Advanced Testing

### Load Testing

Test with multiple concurrent users:
1. Create 5-10 test accounts
2. Start conversations between them
3. Send messages rapidly
4. Monitor AWS CloudWatch metrics
5. Check AppSync throttling limits

### Security Testing

- Test with expired JWT tokens
- Try accessing conversations you're not a member of
- Test SQL injection in GraphQL inputs
- Verify data encryption at rest and in transit

### Performance Benchmarks

```bash
# Measure app startup time
adb logcat -c && adb logcat | grep "Displayed com.ciscodg.ChatAppMVP"

# Measure message send latency
# Record timestamp when send button pressed
# Record timestamp when server confirmation received
# Target: < 500ms

# Measure subscription latency
# Send message from Device A
# Measure time until appears on Device B
# Target: < 1000ms
```

---

## Test Matrix

| Feature | Expo Go | Custom Dev Client | APK Build |
|---------|---------|------------------|-----------|
| Authentication | ✅ | ✅ | ✅ |
| Real-time Chat | ✅ | ✅ | ✅ |
| Offline Sync | ✅ | ✅ | ✅ |
| Push Notifications | ⚠️ Mock | ✅ | ✅ |
| Image Upload | ❌ | ✅ | ✅ |
| Deep Linking | ⚠️ Limited | ✅ | ✅ |
| Background Sync | ❌ | ✅ | ✅ |

---

## Success Criteria

### ✅ MVP Testing Checklist

- [ ] User can sign up with email
- [ ] User can verify email with code
- [ ] User can sign in
- [ ] User can see conversation list
- [ ] User can create new conversation
- [ ] User can send text messages
- [ ] Messages appear in real-time for other users
- [ ] Messages persist after app restart
- [ ] Offline messages sync when back online
- [ ] User can sign out
- [ ] (APK only) Push notifications work
- [ ] (APK only) App works on physical device

### 🚀 Production Readiness Checklist

- [ ] All MVP criteria met
- [ ] Tested on 3+ different devices
- [ ] Tested with 5+ concurrent users
- [ ] Load tested with 100+ messages per conversation
- [ ] Security audit completed
- [ ] Performance benchmarks met
- [ ] Error handling verified
- [ ] Logs properly configured
- [ ] AWS costs estimated
- [ ] Backup/disaster recovery plan in place

---

## Need Help?

- Check AWS CloudWatch logs for backend errors
- Check Metro bundler terminal for client errors  
- Check device logs: `adb logcat | grep ChatAppMVP`
- Review `MIGRATION_REPORT.md` for architecture details
- Review `Architecture_MVP.md` for system design

---

## Quick Reference Commands

```bash
# Expo Go Testing
npm install
npm run start

# Local Build (Quick)
npx expo prebuild --clean
npx expo run:android

# Local Build (Gradle)
cd android && ./gradlew assembleDebug

# EAS Build
eas build --profile development --platform android

# Clear Everything
npx expo start --clear
rm -rf node_modules && npm install
npx expo prebuild --clean

# Device Testing
adb devices
adb install app-debug.apk
adb logcat | grep ChatAppMVP
```

---

**Last Updated:** Generated during Amplify v6 migration
**App Version:** 1.0.0
**Expo SDK:** ~54.0
**Amplify Version:** 6.x

