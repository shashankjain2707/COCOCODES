import { Platform } from 'react-native';

// Import Firebase SDK based on platform
let auth, firestore, firebaseApp;
let GoogleAuthProvider, Timestamp, serverTimestamp, onAuthStateChanged;
let createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, signInWithCredential, signInWithPopup;
let collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, setDoc, writeBatch;

if (Platform.OS === 'web') {
  // Web Firebase - Modular SDK
  const { initializeApp } = require('firebase/app');
  const { 
    getAuth, 
    GoogleAuthProvider: WebGoogleAuthProvider, 
    onAuthStateChanged: webOnAuthStateChanged,
    createUserWithEmailAndPassword: webCreateUserWithEmailAndPassword,
    signInWithEmailAndPassword: webSignInWithEmailAndPassword,
    signOut: webSignOut,
    signInWithCredential: webSignInWithCredential,
    signInWithPopup: webSignInWithPopup
  } = require('firebase/auth');
  const { 
    getFirestore, 
    Timestamp: WebTimestamp, 
    serverTimestamp: WebServerTimestamp,
    collection: webCollection,
    doc: webDoc,
    addDoc: webAddDoc,
    getDoc: webGetDoc,
    getDocs: webGetDocs,
    updateDoc: webUpdateDoc,
    deleteDoc: webDeleteDoc,
    query: webQuery,
    where: webWhere,
    orderBy: webOrderBy,
    setDoc: webSetDoc,
    writeBatch: webWriteBatch
  } = require('firebase/firestore');

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
  const db = getFirestore(app);
  const authInstance = getAuth(app);
  auth = authInstance;
  firestore = db;
  
  // Set provider and timestamp for web
  GoogleAuthProvider = WebGoogleAuthProvider;
  Timestamp = WebTimestamp;
  serverTimestamp = WebServerTimestamp;
  onAuthStateChanged = (callback) => webOnAuthStateChanged(authInstance, callback);
  createUserWithEmailAndPassword = (email, password) => webCreateUserWithEmailAndPassword(authInstance, email, password);
  signInWithEmailAndPassword = (email, password) => webSignInWithEmailAndPassword(authInstance, email, password);
  signOut = () => webSignOut(authInstance);
  signInWithCredential = (credential) => webSignInWithCredential(authInstance, credential);
  signInWithPopup = (provider) => webSignInWithPopup(authInstance, provider);
  
  // Export modular functions for web
  collection = (db, collectionPath) => webCollection(db, collectionPath);
  doc = (dbOrCollectionRef, collectionPathOrDocId, docId) => {
    // Handle both patterns:
    // 1. doc(firestore, 'collectionPath', 'docId') - web style
    // 2. doc(collectionRef, 'docId') - React Native style compatibility
    if (typeof collectionPathOrDocId === 'string' && docId) {
      // Pattern 1: doc(firestore, 'collectionPath', 'docId')
      return webDoc(dbOrCollectionRef, collectionPathOrDocId, docId);
    } else if (typeof collectionPathOrDocId === 'string' && !docId) {
      // Pattern 2: doc(collectionRef, 'docId')
      return webDoc(dbOrCollectionRef, collectionPathOrDocId);
    } else {
      // Fallback for auto-generated ID
      return webDoc(dbOrCollectionRef);
    }
  };
  addDoc = webAddDoc;
  getDoc = webGetDoc;
  getDocs = webGetDocs;
  updateDoc = webUpdateDoc;
  deleteDoc = webDeleteDoc;
  query = webQuery;
  where = webWhere;
  orderBy = webOrderBy;
  setDoc = webSetDoc;
  writeBatch = () => webWriteBatch(db);
  
  console.log('Web Firebase initialized with modular SDK');
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
  auth = RNFirebaseAuth();
  const db = RNFirebaseFirestore();
  firestore = db;
  
  // Set provider and timestamp for React Native
  GoogleAuthProvider = RNFirebaseAuth.GoogleAuthProvider;
  Timestamp = RNFirebaseFirestore.Timestamp;
  serverTimestamp = RNFirebaseFirestore.FieldValue.serverTimestamp;
  onAuthStateChanged = (callback) => auth.onAuthStateChanged(callback);
  createUserWithEmailAndPassword = (email, password) => auth.createUserWithEmailAndPassword(email, password);
  signInWithEmailAndPassword = (email, password) => auth.signInWithEmailAndPassword(email, password);
  signOut = () => auth.signOut();
  signInWithCredential = (credential) => auth.signInWithCredential(credential);
  signInWithPopup = null; // Not available on React Native
  
  // Export functions compatible with modular style for React Native
  collection = (db, collectionPath) => db.collection(collectionPath);
  doc = (dbOrCollectionRef, collectionPathOrDocId, docId) => {
    // Handle both patterns:
    // 1. doc(firestore, 'collectionPath', 'docId') - web style
    // 2. doc(collectionRef, 'docId') - React Native style
    if (typeof collectionPathOrDocId === 'string' && docId) {
      // Pattern 1: doc(firestore, 'collectionPath', 'docId')
      return dbOrCollectionRef.collection(collectionPathOrDocId).doc(docId);
    } else if (typeof collectionPathOrDocId === 'string' && !docId) {
      // Pattern 2: doc(collectionRef, 'docId')
      return dbOrCollectionRef.doc(collectionPathOrDocId);
    } else {
      // Fallback for auto-generated ID
      return dbOrCollectionRef.doc();
    }
  };
  addDoc = (collectionRef, data) => collectionRef.add(data);
  getDoc = (docRef) => docRef.get();
  getDocs = (queryRef) => queryRef.get();
  updateDoc = (docRef, data) => docRef.update(data);
  deleteDoc = (docRef) => docRef.delete();
  query = (collectionRef, ...constraints) => {
    let q = collectionRef;
    constraints.forEach(constraint => {
      if (constraint.type === 'where') {
        q = q.where(constraint.field, constraint.op, constraint.value);
      } else if (constraint.type === 'orderBy') {
        q = q.orderBy(constraint.field, constraint.direction);
      }
    });
    return q;
  };
  where = (field, op, value) => ({ type: 'where', field, op, value });
  orderBy = (field, direction = 'asc') => ({ type: 'orderBy', field, direction });
  setDoc = (docRef, data) => docRef.set(data);
  
  console.log('React Native Firebase initialized');
}

// Export Firebase modules and modular functions
export { 
  auth, 
  firestore, 
  GoogleAuthProvider, 
  Timestamp, 
  serverTimestamp,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithCredential,
  signInWithPopup,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  setDoc,
  writeBatch
};
export default firebaseApp;
