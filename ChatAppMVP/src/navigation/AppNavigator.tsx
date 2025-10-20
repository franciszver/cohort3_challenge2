// Main App Navigator - handles authentication flow and main app navigation
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStatus, RootStackParamList } from './types';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { Amplify, Auth, Hub } from 'aws-amplify';
import awsconfig from '../aws-exports';
import LoadingScreen from '../components/common/LoadingScreen';
import NetworkService from '../services/network';
import AuthService from '../services/auth';

// Configure Amplify
Amplify.configure(awsconfig);

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    // Check initial authentication state
    checkAuthState();

    // Listen for authentication state changes
    const hubListener = Hub.listen('auth', ({ payload: { event, data } }) => {
      switch (event) {
        case 'signIn':
        case 'cognitoHostedUI':
          setAuthStatus('authenticated');
          initializeNetworkMonitoring(); // Start network monitoring after sign in
          break;
        case 'signOut':
        case 'signIn_failure':
        case 'cognitoHostedUI_failure':
          setAuthStatus('unauthenticated');
          NetworkService.cleanup(); // Clean up network monitoring on sign out
          break;
      }
    });

    return () => hubListener();
  }, []);

  const checkAuthState = async () => {
    try {
      await Auth.currentAuthenticatedUser();
      setAuthStatus('authenticated');
      initializeNetworkMonitoring(); // Start network monitoring if already authenticated
    } catch (error) {
      setAuthStatus('unauthenticated');
    }
  };

  const initializeNetworkMonitoring = async () => {
    try {
      // Get current user for network monitoring
      const user = await AuthService.getCurrentUser();
      if (user) {
        NetworkService.initialize(user.id);
        console.log('🌐 Network monitoring initialized for user:', user.id);
      }
    } catch (error) {
      console.error('Error initializing network monitoring:', error);
    }
  };

  if (authStatus === 'loading') {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {authStatus === 'authenticated' ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
