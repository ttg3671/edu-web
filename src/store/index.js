import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import settingsReducer from './settingsSlice';
import userReducer from '../redux/user/user.reducer';

const rootReducer = combineReducers({
  settings: settingsReducer,
  user: userReducer,
});

const persistConfig = {
  key: 'root',
  version: 1,
  storage: storage.default ? storage.default : storage,
  whitelist: ['settings', 'user']
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
