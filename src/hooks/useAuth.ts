import { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { authService, UserData } from '../services/firebase/auth';
import { signUp, signIn, signInWithGoogle, signOut, loadUserData } from '../store/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, userData, isLoading, error, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  // Sign up with email and password
  const handleSignUp = async (email: string, password: string, displayName: string) => {
    try {
      await dispatch(signUp({ email, password, displayName })).unwrap();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Sign in with email and password
  const handleSignIn = async (email: string, password: string) => {
    try {
      await dispatch(signIn({ email, password })).unwrap();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Sign in with Google
  const handleGoogleSignIn = async () => {
    try {
      await dispatch(signInWithGoogle()).unwrap();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Sign out
  const handleSignOut = async () => {
    try {
      await dispatch(signOut()).unwrap();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Update user preferences
  const updatePreferences = async (preferences: Partial<UserData['studyPreferences']>) => {
    if (!user) return { success: false, error: 'No user logged in' };
    
    try {
      await authService.updatePreferences(user.uid, preferences);
      // Reload user data to get updated preferences
      await dispatch(loadUserData(user.uid));
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Update study stats
  const updateStudyStats = async (studyMinutes: number) => {
    if (!user) return { success: false, error: 'No user logged in' };
    
    try {
      await authService.updateStudyStats(user.uid, studyMinutes);
      // Reload user data to get updated stats
      await dispatch(loadUserData(user.uid));
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Create study session
  const createStudySession = async (sessionData: {
    videoId: string;
    title: string;
    duration: number;
    subject: string;
  }) => {
    if (!user) return { success: false, error: 'No user logged in' };
    
    try {
      await authService.createStudySession(user.uid, {
        ...sessionData,
        timestamp: new Date(),
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  return {
    // State
    user,
    userData,
    isLoading,
    error,
    isAuthenticated,
    
    // Actions
    signUp: handleSignUp,
    signIn: handleSignIn,
    signInWithGoogle: handleGoogleSignIn,
    signOut: handleSignOut,
    updatePreferences,
    updateStudyStats,
    createStudySession,
  };
};
