import React, { createContext, useContext, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { useDispatch } from 'react-redux';
import { auth } from '../services/firebase/config';
import { authService } from '../services/firebase/auth';
import { setUser, loadUserData } from '../store/authSlice';
import { AppDispatch } from '../store';

interface AuthContextType {
  // Add any additional auth context methods here if needed
}

const AuthContext = createContext<AuthContextType>({});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
      dispatch(setUser(user));
      
      if (user) {
        // Load user data from Firestore
        dispatch(loadUserData(user.uid));
      }
    });

    return unsubscribe;
  }, [dispatch]);

  const value = {
    // Add any additional auth context values here
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
