// Main App Entry Point - Chat App MVP
// CRITICAL: Add polyfills FIRST (before any other imports)
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';

// Temporarily comment out Amplify to test basic app loading
// import { Amplify } from '@aws-amplify/core';
// import amplifyConfig from './src/config/amplifyConfig';
// import AppNavigator from './src/navigation/AppNavigator';

// Configure Amplify v6 with error handling
// try {
//   Amplify.configure(amplifyConfig);
//   console.log('Amplify configured successfully');
// } catch (error) {
//   console.error('Failed to configure Amplify:', error);
// }

export default function App() {
  console.log('App component is rendering');
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello World! App is working!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});