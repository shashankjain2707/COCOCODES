import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { View, Text, StyleSheet } from 'react-native';

// Store
import { store, persistor } from './src/store';

// Navigation
import { AppNavigator } from './src/navigation/AppNavigator';

// Context
import { AuthProvider } from './src/contexts/AuthContext';

// Theme
import { theme } from './src/styles/theme';

// Loading component for PersistGate
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <Text style={styles.loadingText}>Loading EduTube...</Text>
  </View>
);

export default function App() {
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
});
