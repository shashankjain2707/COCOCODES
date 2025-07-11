import { 
  auth, 
  firestore, 
  GoogleAuthProvider, 
  Timestamp, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInWithCredential,
  signInWithPopup,
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from './config';
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
    return onAuthStateChanged(callback);
  },

  // Get current user
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  },

  // Wait for auth to be ready
  waitForAuth(): Promise<FirebaseUser | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged((user) => {
        unsubscribe();
        resolve(user);
      });
    });
  },

  // Sign in with Google
  async signInWithGoogle(): Promise<FirebaseUser> {
    try {
      if (Platform.OS === 'web') {
        // Web platform - use Firebase Auth web SDK
        const { signInWithPopup } = require('firebase/auth');
        const provider = new GoogleAuthProvider();
        
        // Add any additional scopes if needed
        provider.addScope('profile');
        provider.addScope('email');
        
        const result = await signInWithPopup(provider);
        const user = result.user;
        
        // Create or update user document in Firestore
        await this.createOrUpdateUserDoc(user);
        
        return user;
      } else {
        // React Native platform - use Google Sign-In library
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
        const userCredential = await signInWithCredential(googleCredential);
        const user = userCredential.user;
        
        // Create or update user document in Firestore
        await this.createOrUpdateUserDoc(user);
        
        return user;
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  },

  // Helper method to create or update user document
  async createOrUpdateUserDoc(user: any): Promise<void> {
    const userDocRef = doc(firestore, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
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
      
      await setDoc(userDocRef, userData);
    } else {
      // Update last login time
      await updateDoc(userDocRef, {
        lastLoginAt: Timestamp.now(),
      });
    }
  },

  // Sign up with email and password
  async signUp(email: string, password: string, displayName: string): Promise<FirebaseUser> {
    const userCredential = await createUserWithEmailAndPassword(email, password);
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
    
    const userDocRef = doc(firestore, 'users', user.uid);
    await setDoc(userDocRef, userData);
    return user;
  },

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<FirebaseUser> {
    const userCredential = await signInWithEmailAndPassword(email, password);
    
    // Update last login time
    const userDocRef = doc(firestore, 'users', userCredential.user.uid);
    await updateDoc(userDocRef, {
      lastLoginAt: Timestamp.now(),
    });
    
    return userCredential.user;
  },

  // Sign out
  async signOut(): Promise<void> {
    await firebaseSignOut();
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
