import {
  clearAllSecureStorage,
  getAuthToken,
  getStoredUser,
  saveAuthToken,
  saveStoredUser,
} from '../services/secureStorage';
import {
  addToOfflineQueue,
  clearOfflineQueue,
  getOfflineQueue,
} from '../services/asyncStorage';
import {
  fetchAssignmentsApi,
  setSimulatedApiError,
  setSimulatedOffline,
  updateAssignmentApi,
} from '../services/mockApi';
import { User } from '../types';

// Mock expo-secure-store
jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>();
  return {
    setItemAsync: jest.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    getItemAsync: jest.fn(async (key: string) => {
      return store.get(key) ?? null;
    }),
    deleteItemAsync: jest.fn(async (key: string) => {
      store.delete(key);
    }),
  };
});

// Mock @react-native-async-storage/async-storage
jest.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map<string, string>();
  return {
    getItem: jest.fn(async (key: string) => store.get(key) ?? null),
    setItem: jest.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: jest.fn(async (key: string) => {
      store.delete(key);
    }),
    multiRemove: jest.fn(async (keys: string[]) => {
      keys.forEach((k) => store.delete(k));
    }),
    clear: jest.fn(async () => store.clear()),
  };
});

describe('Critical Path Tests (Auth Session, Optimistic Updates, Offline Resilience)', () => {
  beforeEach(async () => {
    setSimulatedOffline(false);
    setSimulatedApiError(false);
    await clearOfflineQueue();
    await clearAllSecureStorage();
  });

  describe('Session Lifecycle (Surviving Restart & Clean Sign-Out)', () => {
    const studentUser: User = {
      id: 'usr-tuan-1923050209',
      name: 'Mai Hoàng Tuấn',
      email: 'tuan.mai@student.dntu.edu.vn',
      studentId: '1923050209',
    };

    it('should save auth token and user to SecureStore and survive restart check', async () => {
      const mockToken = 'sec_jwt_test_token_12345';
      await saveAuthToken(mockToken);
      await saveStoredUser(studentUser);

      // Simulate next launch / app restart:
      const restoredToken = await getAuthToken();
      const restoredUser = await getStoredUser();

      expect(restoredToken).toBe(mockToken);
      expect(restoredUser).toEqual(studentUser);
    });

    it('should completely wipe SecureStore credentials on sign out', async () => {
      await saveAuthToken('sample_token');
      await saveStoredUser(studentUser);

      // Perform sign out cleanup
      await clearAllSecureStorage();

      const tokenAfterSignOut = await getAuthToken();
      const userAfterSignOut = await getStoredUser();

      expect(tokenAfterSignOut).toBeNull();
      expect(userAfterSignOut).toBeNull();
    });
  });

  describe('Optimistic Updates & Server Rollback on Failure', () => {
    it('should update assignment status successfully under normal network conditions', async () => {
      const { data } = await fetchAssignmentsApi();
      const target = data[0];

      const nextStatus = target.status === 'completed' ? 'pending' : 'completed';
      const updated = await updateAssignmentApi(target.id, { status: nextStatus });

      expect(updated.status).toBe(nextStatus);
    });

    it('should throw error when server fails, enabling UI optimistic rollback', async () => {
      const { data } = await fetchAssignmentsApi();
      const target = data[0];

      // Simulate server failure
      setSimulatedApiError(true);

      await expect(
        updateAssignmentApi(target.id, { status: 'completed' })
      ).rejects.toThrow('Rollback về trạng thái cũ');
    });
  });

  describe('Offline Tolerance & Queue Integrity', () => {
    it('should queue edits into local queue when offline and not silently lose them', async () => {
      setSimulatedOffline(true);

      const queueItem = await addToOfflineQueue({
        type: 'UPDATE_ASSIGNMENT',
        payload: { id: 'assign-01', updates: { status: 'completed' } },
      });

      const queue = await getOfflineQueue();
      expect(queue.length).toBeGreaterThanOrEqual(1);
      expect(queue.some((q) => q.id === queueItem.id)).toBe(true);
    });
  });
});
