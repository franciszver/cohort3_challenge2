// =============================================================================
// JEST SETUP FOR REACT NATIVE + AWS AMPLIFY TESTING
// =============================================================================
// This file configures the test environment for comprehensive testing

// Extend Jest matchers for React Native Testing Library
import '@testing-library/jest-native/extend-expect';

// Mock React Native specific modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock Expo modules
jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));

// Global test utilities and setup
global.__DEV__ = true;

// Suppress console warnings during tests (can be enabled for debugging)
global.console = {
  ...console,
  // Uncomment these to reduce test output noise:
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Mock timers for consistent test execution
jest.useFakeTimers();

// Setup for async testing
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
  jest.useFakeTimers();
});

// AWS Amplify Auth mock setup - critical for AI agent safety
jest.mock('aws-amplify', () => ({
  Auth: {
    currentAuthenticatedUser: jest.fn(),
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    confirmSignUp: jest.fn(),
    forgotPassword: jest.fn(),
    forgotPasswordSubmit: jest.fn(),
  },
  API: {
    graphql: jest.fn(),
  },
  graphqlOperation: jest.fn(),
}));

// React Navigation mock setup
jest.mock('@react-navigation/native', () => {
  return {
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      dispatch: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
    useFocusEffect: jest.fn(),
  };
});

// AsyncStorage mock
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// NetInfo mock
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(),
  getCurrentConnectivity: jest.fn(() => Promise.resolve({ isConnected: true })),
  isConnectionExpensive: jest.fn(() => Promise.resolve(false)),
}));

console.log('🧪 Jest test environment configured for React Native + AWS Amplify');
