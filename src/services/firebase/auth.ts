import { auth, firestore, GoogleAuthProvider, Timestamp } from './config';
import { Platform } from 'react-native';

// Define the type for FirebaseUser based on platform
export type FirebaseUser = any; // This is a simplification to avoid type errors

export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: any; // Use Firestore Timestamp
  lastLoginAt: any; // Use Firestore Timestamp
  studyPreferences: {
    dailyGoalMinutes: number;
    preferredSubjects: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  };
  stats: {
    totalStudyMinutes: number;
    coursesCompleted: number;
    currentStreak: number;
    longestStreak: number;
  };
}

export const authService = {
  // Initialize auth state listener
  onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
    return auth().onAuthStateChanged(callback);
  },

  // Get current user
  getCurrentUser(): FirebaseUser | null {
    return auth().currentUser;
  },

  // Wait for auth to be ready
  waitForAuth(): Promise<FirebaseUser | null> {
    return new Promise((resolve) => {
      const unsubscribe = auth().onAuthStateChanged((user) => {
        unsubscribe();
        resolve(user);
      });
    });
  },

  // Sign in with Google
  async signInWithGoogle(): Promise<FirebaseUser> {
    try {
      // Setup Google Sign-In for React Native
      const { GoogleSignin } = require('@react-native-google-signin/google-signin');
      
      // Configure Google Sign-In
      GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      });
      
      // Get the user ID token
      await GoogleSignin.hasPlayServices();
      const { idToken } = await GoogleSignin.signIn();
      
      // Create a Google credential with the token
      const googleCredential = GoogleAuthProvider.credential(idToken);
      
      // Sign-in with credential
      const userCredential = await auth().signInWithCredential(googleCredential);
      const user = userCredential.user;
      
      // Create or update user document in Firestore
      const userDoc = await firestore().collection('users').doc(user.uid).get();
      
      if (!userDoc.exists()) {
        const userData: UserData = {
          uid: user.uid,
          email: user.email!,
          displayName: user.displayName || 'User',
          photoURL: user.photoURL || undefined,
          createdAt: Timestamp.now(),
          lastLoginAt: Timestamp.now(),
          studyPreferences: {
            dailyGoalMinutes: 60,
            preferredSubjects: [],
            difficulty: 'beginner',
          },
          stats: {
            totalStudyMinutes: 0,
            coursesCompleted: 0,
            currentStreak: 0,
            longestStreak: 0,
          },
        };
        
        await firestore().collection('users').doc(user.uid).set(userData);
      } else {
        // Update last login time
        await firestore().collection('users').doc(user.uid).update({
          lastLoginAt: Timestamp.now(),
        });
      }
      
      return user;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  },

  // Sign up with email and password
  async signUp(email: string, password: string, displayName: string): Promise<FirebaseUser> {
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // Update user profile
    await user.updateProfile({ displayName });
    
    // Create user document in Firestore
    const userData: UserData = {
      uid: user.uid,
      email: user.email!,
      displayName,
      createdAt: Timestamp.now(),
      lastLoginAt: Timestamp.now(),
      studyPreferences: {
        dailyGoalMinutes: 60,
        preferredSubjects: [],
        difficulty: 'beginner',
      },
      stats: {
        totalStudyMinutes: 0,
        coursesCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
      },
    };
    
    await firestore().collection('users').doc(user.uid).set(userData);
    return user;
  },

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<FirebaseUser> {
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    
    // Update last login time
    await firestore().collection('users').doc(userCredential.user.uid).update({
      lastLoginAt: Timestamp.now(),
    });
    
    return userCredential.user;
  },

  // Sign out
  async signOut(): Promise<void> {
    await auth().signOut();
  },

  // Get user data from Firestore
  async getUserData(uid: string): Promise<UserData | null> {
    const userDoc = await firestore().collection('users').doc(uid).get();
    if (userDoc.exists()) {
      return userDoc.data() as UserData;
    }
    return null;
  },

  // Update user data in Firestore
  async updateUserData(uid: string, data: Partial<UserData>): Promise<void> {
    await firestore().collection('users').doc(uid).update(data);
  },

  // Update user study stats
  async updateStudyStats(uid: string, studyMinutes: number): Promise<void> {
    const userDoc = await firestore().collection('users').doc(uid).get();
    if (userDoc.exists()) {
      const userData = userDoc.data() as UserData;
      const newTotalMinutes = (userData.stats?.totalStudyMinutes || 0) + studyMinutes;
      
      await firestore().collection('users').doc(uid).update({
        'stats.totalStudyMinutes': newTotalMinutes,
        lastLoginAt: Timestamp.now(),
      });
    }
  },

  // Update user preferences
  async updatePreferences(uid: string, preferences: Partial<UserData['studyPreferences']>): Promise<void> {
    await firestore().collection('users').doc(uid).update({
      studyPreferences: preferences,
    });
  },

  // Create study session record
  async createStudySession(uid: string, sessionData: {
    videoId: string;
    title: string;
    duration: number;
    subject: string;
    timestamp: any;
  }): Promise<void> {
    const sessionRef = firestore()
      .collection('users')
      .doc(uid)
      .collection('studySessions')
      .doc(`${Date.now()}`);
      
    await sessionRef.set({
      ...sessionData,
      timestamp: Timestamp.now(),
    });
  },
};
