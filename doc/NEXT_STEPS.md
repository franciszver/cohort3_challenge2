# Next Steps - Amplify v6 Migration

## ✅ What's Complete

All code has been migrated from Amplify v5 → v6! Here's what was done:

- ✅ **Dependencies:** Installed all Amplify v6 modular packages + native modules
- ✅ **Configuration:** Created `amplifyConfig.ts` with v6 structure
- ✅ **App.tsx:** Added polyfills and Amplify.configure()
- ✅ **Auth Service:** Migrated to v6 methods (`signIn`, `signUp`, etc.)
- ✅ **API Services:** Migrated user, message, conversation services to `generateClient()`
- ✅ **Navigation:** Updated AppNavigator to use v6 imports
- ✅ **EAS Setup:** Created `eas.json` and updated `app.json`
- ✅ **Placeholders:** Created placeholder GraphQL files

## 🔄 What's Next

### Step 1: Get AWS Backend Configuration

You need to extract your Amplify backend values. **Choose ONE option:**

**Option A: From AWS Console** (Recommended if backend is deployed)
1. Go to AWS Console → Cognito → User Pools
2. Find: `chatappmvp484767be_userpool_484767be`
3. Copy:
   - User Pool ID (us-east-1_XXXXXXXXX)
   - Client ID (from App Integration tab)
4. Go to Cognito → Identity Pools
5. Find: `chatappmvp484767be_identitypool_484767be`
6. Copy Identity Pool ID
7. Go to AppSync
8. Find: `chatappmvp` API
9. Copy API endpoint URL

**Option B: Use Amplify CLI** (if backend is pulled)
```powershell
cd ChatAppMVP
$env:AWS_PROFILE='ciscodg@gmail'
amplify pull
# This will create aws-exports.js with all values
```

### Step 2: Create .env File

Create `ChatAppMVP/.env` and fill in your values:

```bash
# AWS Cognito
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
COGNITO_IDENTITY_POOL_ID=us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# AWS AppSync
APPSYNC_ENDPOINT=https://xxxxxxxxxxxxxxxxxxxxxxxxxx.appsync-api.us-east-1.amazonaws.com/graphql

# AWS Region
AWS_REGION=us-east-1
```

See `ChatAppMVP/src/config/README.md` for detailed instructions.

### Step 3: Generate GraphQL Operations

This generates the actual queries/mutations from your GraphQL schema:

```powershell
cd ChatAppMVP
$env:AWS_PROFILE='ciscodg@gmail'

# First time setup
amplify codegen add
# Choose:
# - TypeScript
# - Path: src/graphql
# - Max depth: 2

# Generate operations
amplify codegen
```

This will replace the placeholder files in `src/graphql/` with actual GraphQL operations.

### Step 4: Build Custom Dev Client

**IMPORTANT:** This build takes 15-20 minutes and happens on EAS servers.

```powershell
cd ChatAppMVP

# Login to Expo (first time only)
eas login

# Configure EAS (first time only)
eas build:configure

# Build dev client for Android
npm run build:dev:android
# Or: eas build --profile development --platform android
```

When complete, you'll get a download link. Install the APK on your Android device.

### Step 5: Start Development Server

```powershell
cd ChatAppMVP
npm run dev:android
```

This will show a QR code. Open your custom dev client app (from Step 4) and scan the QR code.

### Step 6: Test MVP

**Goal:** Login + Send one message

1. Open the custom dev client app
2. Scan QR code from dev server
3. App loads
4. Try to sign in with test credentials
5. If login works → try sending a message
6. Success! 🎉

## 🐛 Troubleshooting

### Build Errors

If you see TypeScript errors during build:
- Make sure you ran `amplify codegen` (Step 3)
- Check that `src/graphql/*.ts` files have actual GraphQL content (not just placeholders)

### Auth Errors

If login fails:
- Verify `.env` file has correct values
- Restart dev server after creating `.env`
- Check `Constants.expoConfig?.extra` in console logs

### "Cannot find module" Errors

If you see import errors:
- Run `npm install` again
- Delete `node_modules` and reinstall
- Restart Metro bundler

### Network/API Errors

If GraphQL calls fail:
- Check AppSync endpoint in `.env`
- Verify user is authenticated
- Check AWS Console for API errors

## 📝 Notes

- The custom dev client only needs to be rebuilt if you add/remove native dependencies
- JavaScript changes (services, screens, etc.) update instantly with Fast Refresh
- The `.env` file is gitignored - never commit it!
- For your boss's testing: just share the dev server QR code (he needs the custom dev client installed too)

## 🎯 MVP Success Criteria

- [ ] Custom dev client builds successfully
- [ ] App loads from QR code
- [ ] User can sign in with email/password
- [ ] User can see the chat interface
- [ ] User can send a message
- [ ] Message appears in the UI

Once these work, the Amplify v6 migration is successful! 🚀

---

**Questions or Issues?**

- Check `doc/Amplify-6-expo-upgrade.plan.md` for detailed migration steps
- See `ChatAppMVP/src/config/README.md` for configuration help
- Review `ChatAppMVP/README.md` for project documentation

