import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { auth, onAuthStateChanged } from '../services/firebase/config';
import { authService, FirebaseUser } from '../services/firebase/auth';
import { setUser, loadUserData } from '../store/authSlice';
import { AppDispatch } from '../store';

interface AuthContextType {
  // Add any additional auth context methods here if needed
  firebaseInitialized: boolean;
  firebaseError: Error | null;
}

const AuthContext = createContext<AuthContextType>({
  firebaseInitialized: false,
  firebaseError: null
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);
  const [firebaseError, setFirebaseError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      // Check if auth is available - it will throw if Firebase isn't initialized
      const unsubscribe = onAuthStateChanged(async (user: FirebaseUser | null) => {
        console.log('Auth state changed:', user ? `User ${user.uid}` : 'No user');
        dispatch(setUser(user));
        
        if (user) {
          // Load user data from Firestore
          dispatch(loadUserData(user.uid));
        }
      });
      
      setFirebaseInitialized(true);
      return unsubscribe;
    } catch (error) {
      console.error('Firebase auth error:', error);
      setFirebaseError(error instanceof Error ? error : new Error('Firebase initialization failed'));
      return () => {};
    }
  }, [dispatch]);

  const value = {
    firebaseInitialized,
    firebaseError
    // Add any additional auth context values here
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
