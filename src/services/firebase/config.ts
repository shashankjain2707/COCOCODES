import { Platform } from 'react-native';

// Import Firebase SDK based on platform
let auth, firestore, firebaseApp;
let GoogleAuthProvider, Timestamp, serverTimestamp;

if (Platform.OS === 'web') {
  // Web Firebase
  const { initializeApp } = require('firebase/app');
  const { getAuth, GoogleAuthProvider: WebGoogleAuthProvider } = require('firebase/auth');
  const { getFirestore, Timestamp: WebTimestamp, serverTimestamp: WebServerTimestamp } = require('firebase/firestore');

  // Firebase configuration
  const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL || 
      `https://${process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`,
  };

  // Initialize Firebase for web
  const app = initializeApp(firebaseConfig);
  firebaseApp = app;
  
  // Initialize services
  auth = () => getAuth(app);
  firestore = () => getFirestore(app);
  
  // Set provider and timestamp for web
  GoogleAuthProvider = WebGoogleAuthProvider;
  Timestamp = WebTimestamp;
  serverTimestamp = WebServerTimestamp;
  
  console.log('Web Firebase initialized');
} else {
  // React Native Firebase
  const RNFirebaseApp = require('@react-native-firebase/app').default;
  const RNFirebaseAuth = require('@react-native-firebase/auth').default;
  const RNFirebaseFirestore = require('@react-native-firebase/firestore').default;
  
  // Firebase configuration
  const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL || 
      `https://${process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`,
  };

  // Initialize Firebase for React Native
  try {
    firebaseApp = RNFirebaseApp.app();
  } catch (e) {
    firebaseApp = RNFirebaseApp.initializeApp(firebaseConfig);
  }
  
  // Initialize services
  auth = RNFirebaseAuth;
  firestore = RNFirebaseFirestore;
  
  // Set provider and timestamp for React Native
  GoogleAuthProvider = RNFirebaseAuth.GoogleAuthProvider;
  Timestamp = RNFirebaseFirestore.Timestamp;
  serverTimestamp = RNFirebaseFirestore.FieldValue.serverTimestamp;
  
  console.log('React Native Firebase initialized');
}

// Export Firebase modules
export { auth, firestore, GoogleAuthProvider, Timestamp, serverTimestamp };
export default firebaseApp;
