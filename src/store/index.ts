import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import slices
import homeSlice from './slices/homeSlice';
import authSlice from './authSlice';
import videoSlice from './videoSlice';
import quizSlice from './quizSlice';
import userContentSlice from './userContentSlice';
// import librarySlice from './library/librarySlice';
// import userSlice from './user/userSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'user', 'library', 'video', 'quiz', 'userContent'], // Include userContent state persistence
};

const rootReducer = combineReducers({
  home: homeSlice,
  auth: authSlice,
  video: videoSlice,
  quiz: quizSlice,
  userContent: userContentSlice,
  // library: librarySlice,
  // user: userSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
