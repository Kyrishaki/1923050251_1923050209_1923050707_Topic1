import AsyncStorage from '@react-native-async-storage/async-storage';
import { Assignment, Course, OfflineQueueItem } from '../types';

const COURSES_CACHE_KEY = 'studyplanner_courses_cache_1923050209';
const ASSIGNMENTS_CACHE_KEY = 'studyplanner_assignments_cache_1923050209';
const LAST_SYNC_KEY = 'studyplanner_last_sync_1923050209';
const OFFLINE_QUEUE_KEY = 'studyplanner_offline_queue_1923050209';

// Courses Cache
export async function getCachedCourses(): Promise<Course[] | null> {
  try {
    const raw = await AsyncStorage.getItem(COURSES_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function setCachedCourses(courses: Course[]): Promise<void> {
  try {
    await AsyncStorage.setItem(COURSES_CACHE_KEY, JSON.stringify(courses));
  } catch {}
}

// Assignments Cache
export async function getCachedAssignments(): Promise<Assignment[] | null> {
  try {
    const raw = await AsyncStorage.getItem(ASSIGNMENTS_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function setCachedAssignments(assignments: Assignment[]): Promise<void> {
  try {
    await AsyncStorage.setItem(ASSIGNMENTS_CACHE_KEY, JSON.stringify(assignments));
  } catch {}
}

// Last Successful Sync Timestamp
export async function getLastSyncTime(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(LAST_SYNC_KEY);
  } catch {
    return null;
  }
}

export async function setLastSyncTime(timestamp: string = new Date().toISOString()): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_SYNC_KEY, timestamp);
  } catch {}
}

// Offline Edits Queue
export async function getOfflineQueue(): Promise<OfflineQueueItem[]> {
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function addToOfflineQueue(item: Omit<OfflineQueueItem, 'id' | 'timestamp' | 'retryCount'>): Promise<OfflineQueueItem> {
  const queue = await getOfflineQueue();
  const newItem: OfflineQueueItem = {
    ...item,
    id: `queue-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
    retryCount: 0,
  };
  queue.push(newItem);
  await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  return newItem;
}

export async function clearOfflineQueue(): Promise<void> {
  try {
    await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
  } catch {}
}

// Clear all non-session cache on sign-out
export async function clearAppCache(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      COURSES_CACHE_KEY,
      ASSIGNMENTS_CACHE_KEY,
      LAST_SYNC_KEY,
      OFFLINE_QUEUE_KEY,
    ]);
  } catch {}
}
