import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User as FirebaseUser } from 'firebase/auth';
import { authService, UserData } from '../services/firebase/auth';

interface AuthState {
  user: FirebaseUser | null;
  userData: UserData | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  userData: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
};

// Async thunks
export const signUp = createAsyncThunk(
  'auth/signUp',
  async ({ email, password, displayName }: { email: string; password: string; displayName: string }) => {
    const user = await authService.signUp(email, password, displayName);
    const userData = await authService.getUserData(user.uid);
    return { user: user.toJSON(), userData };
  }
);

export const signInWithGoogle = createAsyncThunk(
  'auth/signInWithGoogle',
  async () => {
    const user = await authService.signInWithGoogle();
    const userData = await authService.getUserData(user.uid);
    return { user: user.toJSON(), userData };
  }
);

export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }: { email: string; password: string }) => {
    const user = await authService.signIn(email, password);
    const userData = await authService.getUserData(user.uid);
    return { user: user.toJSON(), userData };
  }
);

export const signOut = createAsyncThunk('auth/signOut', async () => {
  await authService.signOut();
});

export const loadUserData = createAsyncThunk(
  'auth/loadUserData',
  async (uid: string) => {
    const userData = await authService.getUserData(uid);
    return userData;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<FirebaseUser | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Sign up
      .addCase(signUp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user as FirebaseUser;
        state.userData = action.payload.userData;
        state.isAuthenticated = true;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Sign up failed';
      })
      // Sign in
      .addCase(signIn.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user as FirebaseUser;
        state.userData = action.payload.userData;
        state.isAuthenticated = true;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Sign in failed';
      })
      // Google Sign in
      .addCase(signInWithGoogle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signInWithGoogle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user as FirebaseUser;
        state.userData = action.payload.userData;
        state.isAuthenticated = true;
      })
      .addCase(signInWithGoogle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Google sign in failed';
      })
      // Sign out
      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
        state.userData = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      // Load user data
      .addCase(loadUserData.fulfilled, (state, action) => {
        state.userData = action.payload;
      });
  },
});

export const { setUser, clearError } = authSlice.actions;
export default authSlice.reducer;
