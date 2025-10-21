<!-- 29f91d88-6c88-4c61-99be-67ad175d4c23 4f49e6ec-4c23-4dbe-bff2-c37d045dbaaf -->
# Amplify 6 MVP Migration - One Build Strategy

## Goal

**Primary:** Migrate existing chat app to Amplify v6 modular architecture and get MVP running

**Secondary:** Build custom dev client with ALL native modules needed for future features (no rebuilds)

---

## Phase 1: Comprehensive Dependencies (One Build Strategy)

### 1.1 Install All Native Dependencies ✅ COMPLETE

**Install everything upfront - supports MVP + future features:**

```bash
# Core Amplify v6 (MVP requirement)
npm install @aws-amplify/auth@^6.0.0
npm install @aws-amplify/api@^6.0.0
npm install @aws-amplify/api-graphql@^4.0.0
npm install @aws-amplify/core@^6.0.0

# Amplify polyfills (MVP requirement)
npm install react-native-get-random-values@^1.11.0
npm install react-native-url-polyfill@^2.0.0

# Expo essentials (MVP requirement)
npm install expo-dev-client@~4.0.0
npm install expo-constants@~17.0.0

# Future: Push notifications (native module, JS implementation deferred)
npm install expo-notifications@~0.30.0
npm install expo-device@~7.0.0

# Future: Better network monitoring (native module, JS implementation deferred)
npm install @react-native-community/netinfo@^11.0.0

# Future: Image messages and profile pictures (native module, JS implementation deferred)
npm install expo-image-picker@~15.0.0

# Optional: Haptic feedback for UX polish
npm install expo-haptics@~13.0.0

# Global CLI
npm install -g eas-cli
```

**Why this approach:**

- ✅ Build once with all native modules
- ✅ MVP works immediately after migration
- ✅ Future features only need JavaScript changes (Fast Refresh)
- ✅ No rebuilds for: notifications, image upload, better network detection

### 1.2 Update package.json Scripts ✅ COMPLETE

```json
"scripts": {
  "start": "expo start",
  "dev:android": "expo start --dev-client --android",
  "dev:ios": "expo start --dev-client --ios",
  "build:dev:android": "eas build --profile development --platform android",
  "build:preview:android": "eas build --profile preview --platform android"
}
```

### 1.3 Create EAS Configuration ✅ COMPLETE

**Create `ChatAppMVP/eas.json`:**

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleDebug"
      },
      "env": {
        "APP_ENV": "development"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

### 1.4 Update app.json for All Native Modules ✅ COMPLETE

**Update `ChatAppMVP/app.json`:**

```json
{
  "expo": {
    "plugins": [
      "expo-dev-client",
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#007AFF"
        }
      ],
      "expo-image-picker"
    ],
    "extra": {
      "COGNITO_USER_POOL_ID": "${COGNITO_USER_POOL_ID}",
      "COGNITO_CLIENT_ID": "${COGNITO_CLIENT_ID}",
      "COGNITO_IDENTITY_POOL_ID": "${COGNITO_IDENTITY_POOL_ID}",
      "APPSYNC_ENDPOINT": "${APPSYNC_ENDPOINT}",
      "AWS_REGION": "${AWS_REGION}"
    },
    "android": {
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "RECEIVE_BOOT_COMPLETED",
        "VIBRATE"
      ]
    }
  }
}
```

---

## Phase 2: Amplify Backend Configuration (MVP Focus)

### 2.1 Extract Backend Config ⏸️ DEFERRED

**USER ACTION REQUIRED:** Extract values from AWS Console or Amplify CLI before testing.

```bash
cd ChatAppMVP
$env:AWS_PROFILE='ciscodg@gmail'
amplify status
```

Note outputs for `amplifyConfig.ts`. See `src/config/README.md` for detailed instructions.

### 2.2 Create Amplify v6 Configuration ✅ COMPLETE

**Create `ChatAppMVP/src/config/amplifyConfig.ts`:**

```typescript
import { ResourcesConfig } from '@aws-amplify/core';
import Constants from 'expo-constants';

const amplifyConfig: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: Constants.expoConfig?.extra?.COGNITO_USER_POOL_ID || '',
      userPoolClientId: Constants.expoConfig?.extra?.COGNITO_CLIENT_ID || '',
      identityPoolId: Constants.expoConfig?.extra?.COGNITO_IDENTITY_POOL_ID || '',
      signUpVerificationMethod: 'code',
      loginWith: {
        email: true,
        username: false
      }
    }
  },
  API: {
    GraphQL: {
      endpoint: Constants.expoConfig?.extra?.APPSYNC_ENDPOINT || '',
      region: Constants.expoConfig?.extra?.AWS_REGION || 'us-east-1',
      defaultAuthMode: 'userPool'
    }
  }
};

export default amplifyConfig;
```

**Created `ChatAppMVP/src/config/README.md` with instructions** ✅

### 2.3 Generate GraphQL Operations ⏸️ DEFERRED

**USER ACTION REQUIRED:** Will run after code migration is complete.

```bash
cd ChatAppMVP
$env:AWS_PROFILE='ciscodg@gmail'
amplify codegen add
# Choose: TypeScript, Path: src/graphql, Max depth: 2
amplify codegen
```

Generates:

- `src/graphql/queries.ts`
- `src/graphql/mutations.ts`
- `src/graphql/subscriptions.ts`
- `src/API.ts` (TypeScript types)

---

## Phase 3: Migrate to Amplify v6 (MVP Implementation)

### 3.1 Update App Entry Point ✅ COMPLETE

**Update `ChatAppMVP/App.tsx`:**

```typescript
// CRITICAL: Add polyfills FIRST (before any other imports)
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Amplify } from '@aws-amplify/core';
import amplifyConfig from './src/config/amplifyConfig';
import AppNavigator from './src/navigation/AppNavigator';

// Configure Amplify v6
Amplify.configure(amplifyConfig);

export default function App() {
  return (
    <>
      <AppNavigator />
      <StatusBar style="auto" />
    </>
  );
}
```

### 3.2 Migrate Auth Service ✅ COMPLETE

**Update `ChatAppMVP/src/services/auth.ts`:**

Replace imports:

```typescript
// OLD v5:
// import { Auth } from 'aws-amplify';

// NEW v6:
import { 
  signIn, 
  signUp, 
  signOut,
  confirmSignUp,
  resendSignUpCode,
  resetPassword,
  confirmResetPassword,
  getCurrentUser,
  fetchUserAttributes,
  updateUserAttributes,
  fetchAuthSession
} from '@aws-amplify/auth';
```

Update method implementations:

- `Auth.signIn(username, password)` → `signIn({ username, password })`
- `Auth.signUp({...})` → `signUp({ username, password, options: { userAttributes } })`
- `Auth.confirmSignUp(username, code)` → `confirmSignUp({ username, confirmationCode: code })`
- `Auth.currentAuthenticatedUser()` → `getCurrentUser()`
- `Auth.currentUserInfo()` → `fetchUserAttributes()`
- `Auth.updateUserAttributes(user, attrs)` → `updateUserAttributes({ userAttributes: attrs })`
- `Auth.currentSession()` → `fetchAuthSession()`
- `Auth.resendSignUp(username)` → `resendSignUpCode({ username })`
- `Auth.forgotPassword(username)` → `resetPassword({ username })`
- `Auth.forgotPasswordSubmit(username, code, password)` → `confirmResetPassword({ username, confirmationCode: code, newPassword: password })`

### 3.3 Migrate API Services ✅ COMPLETE

**Update these files to use generateClient pattern:**

- `ChatAppMVP/src/services/api.ts`
- `ChatAppMVP/src/services/user.ts`
- `ChatAppMVP/src/services/conversation.ts`
- `ChatAppMVP/src/services/message.ts`
- `ChatAppMVP/src/services/sync.ts`
- `ChatAppMVP/src/services/sender.ts`

**Replace pattern:**

```typescript
// OLD v5:
import { API, graphqlOperation } from 'aws-amplify';
const result = await API.graphql(graphqlOperation(getUser, { id }));
const user = result.data.getUser;

// NEW v6:
import { generateClient } from 'aws-amplify/api';
import * as queries from '../graphql/queries';
import * as mutations from '../graphql/mutations';

const client = generateClient();
const result = await client.graphql({
  query: queries.getUser,
  variables: { id }
});
const user = result.data.getUser;
```

### 3.4 Migrate Subscription Service ✅ COMPLETE

**Updated `ChatAppMVP/src/services/subscription.ts`:**

All subscription methods migrated to Amplify v6:

```typescript
// OLD v5:
import { API, graphqlOperation } from 'aws-amplify';
const subscription = API.graphql(graphqlOperation(onCreateMessage, { filter }));

// NEW v6:
import { generateClient } from 'aws-amplify/api';
import * as subscriptions from '../graphql/subscriptions';

const client = generateClient();
const observer = client.graphql({
  query: subscriptions.onCreateMessage,
  variables: { filter }
}).subscribe({
  next: ({ data }) => {
    const message = data.onCreateMessage;
    callback(message);
  },
  error: (error) => console.error(error)
});

// Cleanup:
observer.unsubscribe();
```

**Migrated methods:**
- subscribeToNewMessages
- subscribeToMessageUpdates
- subscribeToMessageDeletions
- subscribeToConversationUpdates
- subscribeToNewConversations

### 3.5 Migrate App Navigator ✅ COMPLETE

**Update `ChatAppMVP/src/navigation/AppNavigator.tsx`:**

```typescript
// Remove OLD imports:
// import { Amplify, Auth, Hub } from 'aws-amplify';
// import awsconfig from '../aws-exports';

// Add NEW imports:
import { Hub } from '@aws-amplify/core';
import { getCurrentUser } from '@aws-amplify/auth';

// Remove Amplify.configure() - now in App.tsx

// Update checkAuthState method:
const checkAuthState = async () => {
  try {
    await getCurrentUser();
    setAuthStatus('authenticated');
    initializeNetworkMonitoring();
  } catch (error) {
    setAuthStatus('unauthenticated');
  }
};
```

---

---

## ✅ CODE MIGRATION COMPLETE

All Amplify v5 → v6 code has been migrated! 

**What's Done:**
- ✅ Polyfills added to App.tsx
- ✅ Amplify v6 configuration created
- ✅ Auth service fully migrated
- ✅ API services (user, message, conversation) migrated
- ✅ AppNavigator updated
- ✅ EAS configuration created
- ✅ app.json updated with plugins
- ✅ Placeholder GraphQL files created

**What Remains:**
1. Extract AWS backend config values (or use AWS Console)
2. Run `amplify codegen` to generate GraphQL operations
3. Build custom dev client
4. Test: Login + Send Message

---

## Phase 4: Build Custom Dev Client

### 4.1 Configure EAS Project 🔄 NEXT STEP

**USER ACTION REQUIRED:**

```bash
cd ChatAppMVP
eas login
# Use your Expo account credentials

eas build:configure
# Select: All platforms (or just Android)
```

### 4.2 Build Android Development Client

**USER ACTION REQUIRED:**

```bash
$env:AWS_PROFILE='ciscodg@gmail'
npm run build:dev:android
# Or: eas build --profile development --platform android

# Build takes 10-20 minutes
# Download link provided when complete
# Install APK on Android device/emulator
```

### 4.3 Testing Workflow (MVP)

```bash
# Start development server
npm run dev:android

# Open your custom dev client app (installed from EAS)
# Scan QR code
# App loads with Fast Refresh enabled

# Make code changes → auto-refresh (no rebuild)
```

**When to rebuild:**

- Only if you add/remove native dependencies
- Only if you change app.json or eas.json
- NOT for: JavaScript changes, service updates, UI changes

---

## Phase 5: Documentation

### 5.1 Create Setup for Testing Guide

**Create `doc/SetupForTesting.md`:**

**Section 1: Developer Setup (Full Environment)**

- Prerequisites: Node 18+, Git, AWS CLI, EAS CLI, Expo account, Android device/emulator
- Clone repo and install dependencies
- Configure AWS profile
- Pull Amplify backend
- Build custom dev client (one-time, 15-20 min)
- Install APK from EAS link
- Start development server
- Connect device via QR code

**Section 2: Stakeholder/Tester Setup (Simplified)**

- Install custom dev client APK (link provided by dev)
- Get QR code from developer
- Scan QR to load app
- Use provided test credentials

**Section 3: Environment Verification**

- Dev client installed and opens
- QR code scans successfully
- App loads without errors
- Can sign in with test credentials
- Messages load and send

**Section 4: Troubleshooting Setup Issues**

- QR code won't scan (ensure using custom dev client, not Expo Go)
- App won't load (verify dev server running)
- Build errors (verify dependencies installed)
- Authentication fails (check AWS profile)
- Network issues (firewall, WiFi settings)

### 5.2 Update Main README

**Update `ChatAppMVP/README.md`:**

Replace "Getting Started" section:

- Explain why custom dev client (Amplify v6 requirements)
- Remove all Expo Go references
- Add custom dev client workflow
- Link to `SetupForTesting.md`
- Add "Quick Demo" section for stakeholders
- Document AWS profile setup

Add new sections:

- **Tech Stack Update** (Amplify v6, custom dev client)
- **One Build Strategy** (native modules included upfront)
- **Demo Instructions** (QR-based workflow)

### 5.3 Create Configuration Documentation

**Create `ChatAppMVP/src/config/README.md`:**

- Explain `amplifyConfig.ts` structure
- Document all environment variables
- How to extract values from `amplify status`
- Environment variable injection via app.json extra
- EAS Secrets for CI/CD (future)

**Update `ChatAppMVP/amplify/README.md`:**

- Backend setup process
- Running `amplify codegen` after schema changes
- Team collaboration with `amplify pull`
- Deploying changes: `amplify push`

---

## Phase 6: Future Enhancements (Documented, Not Implemented)

**Native modules are already in the build. Document how to implement later:**

### 6.1 Push Notifications (Future)

**Already supported by build. To implement:**

1. **Create notification service:**
```bash
# Create src/services/notifications.ts
# Implement: request permissions, get push token, handle notifications
# Use expo-notifications API (already installed)
```

2. **Backend integration options:**

   - **Option A:** Expo Push Notification Service (free, simple)
   - **Option B:** AWS Pinpoint (analytics, campaigns, costs money)

3. **No rebuild needed** - just JavaScript implementation

**Document in:** `doc/FutureFeatures.md` > Push Notifications section

### 6.2 Image Messages & Profile Pictures (Future)

**Already supported by build. To implement:**

1. **Use expo-image-picker** (already installed)
2. **Upload to S3** (may need `amplify add storage`)
3. **Update GraphQL schema** to support image URLs in messages
4. **Create ImagePicker components**

**No rebuild needed** - just JavaScript implementation

**Document in:** `doc/FutureFeatures.md` > Media Messages section

### 6.3 Improved Network Monitoring (Future)

**Already supported by build. To implement:**

1. **Replace fetch-based polling** in `src/services/network.ts`
2. **Use @react-native-community/netinfo** (already installed):
```typescript
import NetInfo from '@react-native-community/netinfo';

NetInfo.addEventListener(state => {
  updateConnectionState(state.isConnected, state.type);
});
```

3. **Benefits:**

   - Instant detection (no 10-second delay)
   - Battery efficient (OS-level events)
   - More accurate for poor networks

**No rebuild needed** - just update JavaScript service

**Document in:** `doc/FutureFeatures.md` > Network Monitoring section

### 6.4 Create Future Features Documentation

**Create `doc/FutureFeatures.md`:**

Document all features the build now supports:

- Push notifications (foreground, background, killed state)
- Image messages and profile pictures
- Better network monitoring with instant detection
- Haptic feedback for UX polish

Include:

- What native modules are installed
- Step-by-step implementation guides
- Code examples
- When NOT to implement (if not needed)

---

## Validation Checklist (MVP Focus)

### Code Migration

- [x] All v5 imports replaced with v6
- [x] No `aws-exports.js` references
- [x] No `graphqlOperation` usage
- [x] Auth service uses v6 methods
- [x] API services use `generateClient()`
- [x] Subscriptions use v6 syntax
- [x] Polyfills added to App.tsx
- [x] Placeholder assets created (icon.png, splash-icon.png, adaptive-icon.png, favicon.png)

### Build & EAS

- [ ] All native dependencies installed
- [ ] eas.json configured
- [ ] app.json updated with plugins and permissions
- [ ] Custom dev client builds successfully
- [ ] APK installs on Android device
- [ ] QR code workflow functional

### MVP Functionality

- [ ] Authentication works (sign up, verify, sign in, sign out)
- [ ] Real-time messaging delivers instantly
- [ ] Messages persist across restarts
- [ ] Optimistic UI shows messages immediately
- [ ] Subscriptions reconnect after network loss
- [ ] Offline messages queue correctly
- [ ] Group chat functional
- [ ] Multi-device sync works

### Documentation

- [ ] `SetupForTesting.md` complete (setup instructions only)
- [ ] README.md updated (custom dev client workflow)
- [ ] `src/config/README.md` created
- [ ] `.env.example` created
- [ ] `doc/FutureFeatures.md` documents installed native modules
- [ ] No sensitive data in committed files

---

## Key Files

### New Files

- `eas.json` - EAS Build configuration
- `src/config/amplifyConfig.ts` - Amplify v6 config
- `src/config/README.md` - Configuration docs
- `.env.example` - Environment template
- `doc/SetupForTesting.md` - Setup guide for developers and testers
- `doc/FutureFeatures.md` - Native modules documentation

### Modified Files

- `package.json` - Dependencies and scripts
- `app.json` - Plugins, permissions, extra config
- `App.tsx` - Polyfills and Amplify.configure
- `README.md` - Custom dev client workflow
- `src/navigation/AppNavigator.tsx` - v6 imports
- `src/services/auth.ts` - v6 auth methods
- `src/services/api.ts` - generateClient (v6 imports only)
- `src/services/user.ts` - v6 GraphQL
- `src/services/conversation.ts` - v6 GraphQL
- `src/services/message.ts` - v6 GraphQL
- `src/services/subscription.ts` - v6 subscriptions (fully migrated)
- `src/services/sync.ts` - v6 GraphQL
- `src/services/sender.ts` - v6 GraphQL

### Created Files

- `assets/icon.png` - App icon (1024x1024)
- `assets/splash-icon.png` - Splash screen (2048x2048)
- `assets/adaptive-icon.png` - Android adaptive icon (1024x1024)
- `assets/favicon.png` - Web favicon (512x512)

### Removed/Deprecated

- `aws-exports.js` references (replaced by amplifyConfig.ts)
- All v5 import patterns

---

## User Action Points

**Phase 2.1:** Run `amplify status`

**Phase 2.3:** Run `amplify codegen add` then `amplify codegen`

**Phase 4.1:** Run `eas login` and `eas build:configure`

**Phase 4.2:** Run `npm run build:dev:android` (15-20 minutes)

I'll prompt you at each step!

---

## Success Criteria

✅ **MVP Functional:**

- Amplify v6 modular imports throughout codebase
- Custom dev client runs on Android
- All existing features work (auth, messaging, subscriptions, groups)
- Real-time messaging delivers instantly
- Offline queue functional
- QR-based demo workflow

✅ **Future-Ready Build:**

- expo-notifications included (push ready)
- expo-image-picker included (media ready)
- @react-native-community/netinfo included (better network ready)
- No rebuilds needed for JavaScript-only features

✅ **Documentation Complete:**

- Setup guide for developers and testers
- Future features documented
- Configuration explained

### To-dos

- [ ] Create src/config/amplifyConfig.ts with environment-driven configuration
- [ ] Generate GraphQL operations using amplify codegen (queries, mutations, subscriptions)
- [ ] Migrate src/services/auth.ts to Amplify v6 auth imports
- [ ] Migrate API services (api.ts, user.ts, conversation.ts, message.ts) to v6 GraphQL client
- [ ] Migrate src/services/subscription.ts to v6 subscription syntax
- [ ] Update src/navigation/AppNavigator.tsx to use v6 imports and new config
- [ ] Add expo-notifications and create src/services/notifications.ts
- [ ] Audit package.json for Expo Go compatibility and update app.json
- [ ] Create comprehensive doc/HowToTest.md with step-by-step instructions
- [ ] Update README.md with new setup, QR instructions, and environment configuration
- [ ] Create src/config/README.md and update amplify/README.md
- [ ] Update doc/Architecture_MVP.md and doc/PRD_MVP.md with new patterns