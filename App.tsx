import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { View, Text, StyleSheet, LogBox, Button, Alert } from 'react-native';

// Add setImmediate polyfill for web environments
if (typeof setImmediate === 'undefined') {
  // @ts-ignore - This is a simple polyfill for web
  global.setImmediate = function(callback: Function) {
    return setTimeout(callback, 0);
  };
}

// Try to initialize Firebase first
import './src/services/firebase/config';

// Store
import { store, persistor } from './src/store';

// Navigation
import { AppNavigator } from './src/navigation/AppNavigator';

// Context
import { AuthProvider } from './src/contexts/AuthContext';

// Theme
import { theme } from './src/styles/theme';

// Ignore specific LogBox warnings
LogBox.ignoreLogs([
  'AsyncStorage has been extracted from react-native core', // Ignore AsyncStorage warning
  'Setting a timer for a long period of time', // Ignore timer warnings from Firebase
  'VirtualizedLists should never be nested inside', // Common RN warning
  'Non-serializable values were found in the navigation state', // Navigation state warning
  'This method is deprecated (as well as all React Native Firebase namespaced API)', // Firebase deprecation warning
]);

// Loading component for PersistGate
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <Text style={styles.loadingText}>Loading EduTube...</Text>
  </View>
);

// Firebase error screen
const FirebaseErrorScreen = ({ retry }: { retry: () => void }) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorTitle}>Firebase Connection Error</Text>
    <Text style={styles.errorText}>
      Could not connect to Firebase. Please check your internet connection and try again.
    </Text>
    <View style={styles.buttonContainer}>
      <Button title="Retry" onPress={retry} color={theme.colors.primary} />
    </View>
  </View>
);

export default function App() {
  const [firebaseInitialized, setFirebaseInitialized] = useState(true);
  
  const retryFirebaseConnection = () => {
    // Re-import the Firebase config module
    import('./src/services/firebase/config').then(() => {
      setFirebaseInitialized(true);
    }).catch(error => {
      console.error('Failed to load Firebase module:', error);
      setFirebaseInitialized(false);
    });
  };
  
  if (!firebaseInitialized) {
    return <FirebaseErrorScreen retry={retryFirebaseConnection} />;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <AuthProvider>
          <NavigationContainer>
            <AppNavigator />
            <StatusBar style="light" backgroundColor={theme.colors.background} />
          </NavigationContainer>
        </AuthProvider>
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text,
    fontWeight: '600' as const,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.error,
    fontWeight: '700' as const,
    marginBottom: 16,
  },
  errorText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    marginTop: 12,
    width: '70%',
  },
});
