import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import slices
import homeSlice from './slices/homeSlice';
// import videoSlice from './video/videoSlice';
// import librarySlice from './library/librarySlice';
// import userSlice from './user/userSlice';
// import quizSlice from './quiz/quizSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['user', 'library'], // Only persist user and library data
};

const rootReducer = combineReducers({
  home: homeSlice,
  // video: videoSlice,
  // library: librarySlice,
  // user: userSlice,
  // quiz: quizSlice,
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
