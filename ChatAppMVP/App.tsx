// Main App Entry Point - Chat App MVP
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