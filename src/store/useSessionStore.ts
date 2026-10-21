import { create } from 'zustand';
import { clearAppCache } from '../services/asyncStorage';
import { appQueryClient } from '../services/queryClient';
import {
  clearAllSecureStorage,
  getAuthToken,
  getStoredUser,
  saveAuthToken,
  saveStoredUser,
} from '../services/secureStorage';
import { User } from '../types';

interface SessionState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isRestoring: boolean;
  restoreSession: () => Promise<void>;
  signIn: (user: User, token: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isRestoring: true,

  restoreSession: async () => {
    try {
      const [token, user] = await Promise.all([getAuthToken(), getStoredUser()]);
      if (token && user) {
        set({
          token,
          user,
          isAuthenticated: true,
          isRestoring: false,
        });
        return;
      }
    } catch (err) {
      console.warn('Lỗi khi khôi phục session:', err);
    }
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      isRestoring: false,
    });
  },

  signIn: async (user: User, token: string) => {
    await Promise.all([saveAuthToken(token), saveStoredUser(user)]);
    set({
      user,
      token,
      isAuthenticated: true,
      isRestoring: false,
    });
  },

  signOut: async () => {
    // 1. Clear hardware-encrypted credentials from SecureStore
    await clearAllSecureStorage();

    // 2. Clear query client cache
    appQueryClient.cancelQueries();
    appQueryClient.clear();

    // 3. Clear non-session persistent cache from AsyncStorage
    await clearAppCache();

    // 4. Clear RAM session state
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isRestoring: false,
    });
  },
}));
