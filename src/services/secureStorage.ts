import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { User } from '../types';

const TOKEN_KEY = 'study_planner_auth_token_1923050209';
const USER_KEY = 'study_planner_user_1923050209';

// Web in-memory fallback for development/testing
let webMemoryStore: Record<string, string> = {};

export async function saveAuthToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      webMemoryStore[TOKEN_KEY] = token;
    }
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getAuthToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return webMemoryStore[TOKEN_KEY] || null;
    }
  }
  return await SecureStore.getItemAsync(TOKEN_KEY);
}

export async function deleteAuthToken(): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {}
    delete webMemoryStore[TOKEN_KEY];
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function saveStoredUser(user: User): Promise<void> {
  const json = JSON.stringify(user);
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(USER_KEY, json);
    } catch {
      webMemoryStore[USER_KEY] = json;
    }
    return;
  }
  await SecureStore.setItemAsync(USER_KEY, json);
}

export async function getStoredUser(): Promise<User | null> {
  let raw: string | null = null;
  if (Platform.OS === 'web') {
    try {
      raw = localStorage.getItem(USER_KEY);
    } catch {
      raw = webMemoryStore[USER_KEY] || null;
    }
  } else {
    raw = await SecureStore.getItemAsync(USER_KEY);
  }

  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export async function deleteStoredUser(): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      localStorage.removeItem(USER_KEY);
    } catch {}
    delete webMemoryStore[USER_KEY];
    return;
  }
  await SecureStore.deleteItemAsync(USER_KEY);
}

export async function clearAllSecureStorage(): Promise<void> {
  await deleteAuthToken();
  await deleteStoredUser();
}
