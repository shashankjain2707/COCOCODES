import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  User as FirebaseUser,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';

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
    return onAuthStateChanged(auth, callback);
  },

  // Get current user
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  },

  // Wait for auth to be ready
  waitForAuth(): Promise<FirebaseUser | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
  },

  // Sign in with Google (Web-compatible)
  async signInWithGoogle(): Promise<FirebaseUser> {
    try {
      const provider = new GoogleAuthProvider();
      
      // Add additional scopes if needed
      provider.addScope('email');
      provider.addScope('profile');
      
      // Sign in with popup for web
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Create or update user document in Firestore
      const existingUser = await this.getUserData(user.uid);
      
      if (!existingUser) {
        const userData: UserData = {
          uid: user.uid,
          email: user.email!,
          displayName: user.displayName || 'User',
          photoURL: user.photoURL || undefined,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
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
        
        await setDoc(doc(db, 'users', user.uid), userData);
      } else {
        // Update last login time
        await setDoc(doc(db, 'users', user.uid), {
          lastLoginAt: serverTimestamp(),
        }, { merge: true });
      }
      
      return user;
    } catch (error) {
      console.error('Google Sign-In error:', error);
      throw error;
    }
  },

  // Sign up with email and password
  async signUp(email: string, password: string, displayName: string): Promise<FirebaseUser> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update user profile
    await updateProfile(user, { displayName });
    
    // Create user document in Firestore
    const userData: UserData = {
      uid: user.uid,
      email: user.email!,
      displayName,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
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
    
    await setDoc(doc(db, 'users', user.uid), userData);
    return user;
  },

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<FirebaseUser> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Update last login time
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      lastLoginAt: serverTimestamp(),
    }, { merge: true });
    
    return userCredential.user;
  },

  // Sign out
  async signOut(): Promise<void> {
    await signOut(auth);
  },

  // Get user data from Firestore
  async getUserData(uid: string): Promise<UserData | null> {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserData;
    }
    return null;
  },

  // Update user data in Firestore
  async updateUserData(uid: string, data: Partial<UserData>): Promise<void> {
    await setDoc(doc(db, 'users', uid), data, { merge: true });
  },

  // Update user study stats
  async updateStudyStats(uid: string, studyMinutes: number): Promise<void> {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const userData = userDoc.data() as UserData;
      const newTotalMinutes = (userData.stats?.totalStudyMinutes || 0) + studyMinutes;
      
      await setDoc(doc(db, 'users', uid), {
        stats: {
          ...userData.stats,
          totalStudyMinutes: newTotalMinutes,
        },
        lastLoginAt: serverTimestamp(),
      }, { merge: true });
    }
  },

  // Update user preferences
  async updatePreferences(uid: string, preferences: Partial<UserData['studyPreferences']>): Promise<void> {
    await setDoc(doc(db, 'users', uid), {
      studyPreferences: preferences,
    }, { merge: true });
  },

  // Create study session record
  async createStudySession(uid: string, sessionData: {
    videoId: string;
    title: string;
    duration: number;
    subject: string;
    timestamp: any;
  }): Promise<void> {
    const sessionRef = doc(db, 'users', uid, 'studySessions', `${Date.now()}`);
    await setDoc(sessionRef, {
      ...sessionData,
      timestamp: serverTimestamp(),
    });
  },
};
