import { ResourcesConfig } from '@aws-amplify/core';
import Constants from 'expo-constants';
console.log(Constants.systemVersion);
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

