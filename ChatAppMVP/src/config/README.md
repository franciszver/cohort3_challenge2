# Amplify Configuration

This directory contains the Amplify v6 configuration for the Chat App MVP.

## Configuration Files

### `amplifyConfig.ts`

This file configures Amplify v6 using the new modular architecture. It reads environment variables from `app.json`'s `extra` field via `expo-constants`.

## Environment Variables

Create a `.env` file in the `ChatAppMVP` root directory with these values:

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

## How to Get These Values

### Option 1: From AWS Console

1. **Cognito User Pool ID**:
   - Go to AWS Console → Cognito → User Pools
   - Find pool: `chatappmvp484767be_userpool_484767be`
   - Copy the Pool ID (format: `us-east-1_XXXXXXXXX`)

2. **Cognito Client ID**:
   - In the same User Pool, go to "App integration" tab
   - Find "App clients and analytics"
   - Copy the Client ID

3. **Cognito Identity Pool ID**:
   - Go to AWS Console → Cognito → Identity Pools (Federated Identities)
   - Find pool: `chatappmvp484767be_identitypool_484767be`
   - Copy the Identity Pool ID (format: `us-east-1:xxx-xxx-xxx-xxx`)

4. **AppSync Endpoint**:
   - Go to AWS Console → AppSync
   - Find API: `chatappmvp`
   - Copy the API URL/Endpoint

### Option 2: Using Amplify CLI

If you have the Amplify backend connected locally:

```powershell
cd ChatAppMVP
$env:AWS_PROFILE='ciscodg@gmail.com'
amplify status
```

This will show your deployed resources. Then check the generated `aws-exports.js` file (if it exists) or pull the backend:

```powershell
amplify pull
```

### Option 3: From team-provider-info.json

If the backend is pulled, check `amplify/team-provider-info.json` for resource IDs and ARNs.

## Loading Environment Variables

The environment variables are injected into the app via `app.json`:

```json
{
  "extra": {
    "COGNITO_USER_POOL_ID": "${COGNITO_USER_POOL_ID}",
    ...
  }
}
```

At runtime, `amplifyConfig.ts` reads them via `expo-constants`:

```typescript
Constants.expoConfig?.extra?.COGNITO_USER_POOL_ID
```

## Security Notes

- **NEVER** commit `.env` files to git (already in `.gitignore`)
- For EAS builds, use EAS Secrets: `eas secret:create`
- For local dev, manually create `.env` file
- For production builds, inject via CI/CD secrets

## Testing Configuration

To verify your config is loaded correctly:

```typescript
import Constants from 'expo-constants';

console.log('User Pool ID:', Constants.expoConfig?.extra?.COGNITO_USER_POOL_ID);
console.log('AppSync Endpoint:', Constants.expoConfig?.extra?.APPSYNC_ENDPOINT);
```

Run the app and check the console. If values are undefined, check your `.env` file and restart the dev server.

