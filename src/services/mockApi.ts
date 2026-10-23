import { SEED_ASSIGNMENTS, SEED_COURSES } from '../data/seedData';
import { Assignment, Course, OfflineQueueItem } from '../types';
import {
  addToOfflineQueue,
  getCachedAssignments,
  getCachedCourses,
  getLastSyncTime,
  getOfflineQueue,
  setCachedAssignments,
  setCachedCourses,
  setLastSyncTime,
} from './asyncStorage';

// Remote mock database in memory
let remoteCourses: Course[] = [...SEED_COURSES];
let remoteAssignments: Assignment[] = [...SEED_ASSIGNMENTS];

// Flags for simulating real-world network conditions
let isSimulatedOffline = false;
let isSimulatedApiError = false;

export function setSimulatedOffline(offline: boolean) {
  isSimulatedOffline = offline;
}

export function getSimulatedOffline() {
  return isSimulatedOffline;
}

export function setSimulatedApiError(hasError: boolean) {
  isSimulatedApiError = hasError;
}

export function getSimulatedApiError() {
  return isSimulatedApiError;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class NetworkError extends Error {
  constructor(message: string = 'Mất kết nối mạng đến máy chủ') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ApiServerError extends Error {
  constructor(message: string = 'Máy chủ phản hồi lỗi 500 Internal Server Error') {
    super(message);
    this.name = 'ApiServerError';
  }
}

// ----------------------------------------------------
// COURSES API
// ----------------------------------------------------

export async function fetchCoursesApi(): Promise<{ data: Course[]; fromCache: boolean; lastSync: string | null }> {
  await delay(200);

  if (isSimulatedOffline) {
    const cached = await getCachedCourses();
    const lastSync = await getLastSyncTime();
    if (cached) {
      return { data: cached, fromCache: true, lastSync };
    }
    throw new NetworkError('Không thể tải danh sách môn học khi offline (chưa có bản lưu cache)');
  }

  if (isSimulatedApiError) {
    throw new ApiServerError('Lỗi tải dữ liệu môn học từ server');
  }

  // Update local cache and timestamp
  await setCachedCourses(remoteCourses);
  const now = new Date().toISOString();
  await setLastSyncTime(now);

  return { data: remoteCourses, fromCache: false, lastSync: now };
}

export async function createCourseApi(courseData: Omit<Course, 'id'>): Promise<Course> {
  await delay(300);

  const newCourse: Course = {
    ...courseData,
    id: `course-${Date.now()}`,
  };

  if (isSimulatedOffline) {
    // Save to offline queue and update local cache
    await addToOfflineQueue({
      type: 'CREATE_COURSE',
      payload: newCourse,
    });
    const cached = (await getCachedCourses()) || [...remoteCourses];
    cached.push(newCourse);
    await setCachedCourses(cached);
    return newCourse;
  }

  if (isSimulatedApiError) {
    throw new ApiServerError('Không thể tạo môn học do lỗi hệ thống');
  }

  remoteCourses.push(newCourse);
  await setCachedCourses(remoteCourses);
  return newCourse;
}

// ----------------------------------------------------
// ASSIGNMENTS API
// ----------------------------------------------------

export async function fetchAssignmentsApi(): Promise<{ data: Assignment[]; fromCache: boolean; lastSync: string | null }> {
  await delay(250);

  if (isSimulatedOffline) {
    const cached = await getCachedAssignments();
    const lastSync = await getLastSyncTime();
    if (cached) {
      return { data: cached, fromCache: true, lastSync };
    }
    throw new NetworkError('Không thể tải bài tập khi offline (chưa có bản lưu cache)');
  }

  if (isSimulatedApiError) {
    throw new ApiServerError('Lỗi tải danh sách bài tập từ máy chủ');
  }

  await setCachedAssignments(remoteAssignments);
  const now = new Date().toISOString();
  await setLastSyncTime(now);

  return { data: remoteAssignments, fromCache: false, lastSync: now };
}

export async function fetchAssignmentByIdApi(id: string): Promise<Assignment> {
  await delay(150);

  if (isSimulatedOffline) {
    const cached = await getCachedAssignments();
    const found = cached?.find((a) => a.id === id);
    if (found) return found;
    throw new NetworkError('Không tìm thấy bài tập trong bộ nhớ tạm offline');
  }

  const found = remoteAssignments.find((a) => a.id === id);
  if (!found) {
    throw new Error(`Không tìm thấy bài tập với mã: ${id}`);
  }
  return found;
}

export async function createAssignmentApi(
  assignmentData: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Assignment> {
  await delay(350);

  const now = new Date().toISOString();
  const newAssignment: Assignment = {
    ...assignmentData,
    id: `assign-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
    isOfflineCreated: isSimulatedOffline,
  };

  if (isSimulatedOffline) {
    await addToOfflineQueue({
      type: 'CREATE_ASSIGNMENT',
      payload: newAssignment,
    });
    const cached = (await getCachedAssignments()) || [...remoteAssignments];
    cached.unshift(newAssignment);
    await setCachedAssignments(cached);
    return newAssignment;
  }

  if (isSimulatedApiError) {
    throw new ApiServerError('Lỗi tạo bài tập từ server');
  }

  remoteAssignments.unshift(newAssignment);
  await setCachedAssignments(remoteAssignments);
  return newAssignment;
}

export async function updateAssignmentApi(
  id: string,
  updates: Partial<Assignment>
): Promise<Assignment> {
  await delay(250);

  if (isSimulatedOffline) {
    await addToOfflineQueue({
      type: 'UPDATE_ASSIGNMENT',
      payload: { id, updates },
    });
    const cached = (await getCachedAssignments()) || [...remoteAssignments];
    const index = cached.findIndex((a) => a.id === id);
    if (index !== -1) {
      cached[index] = { ...cached[index], ...updates, updatedAt: new Date().toISOString() };
      await setCachedAssignments(cached);
      return cached[index];
    }
    throw new Error('Không tìm thấy bài tập trong cache offline');
  }

  if (isSimulatedApiError) {
    throw new ApiServerError('Không thể cập nhật bài tập. Rollback về trạng thái cũ.');
  }

  const index = remoteAssignments.findIndex((a) => a.id === id);
  if (index === -1) {
    throw new Error(`Không tìm thấy bài tập: ${id}`);
  }

  remoteAssignments[index] = {
    ...remoteAssignments[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await setCachedAssignments(remoteAssignments);
  return remoteAssignments[index];
}

export async function deleteAssignmentApi(id: string): Promise<{ success: boolean; id: string }> {
  await delay(250);

  if (isSimulatedOffline) {
    await addToOfflineQueue({
      type: 'DELETE_ASSIGNMENT',
      payload: { id },
    });
    const cached = (await getCachedAssignments()) || [...remoteAssignments];
    const filtered = cached.filter((a) => a.id !== id);
    await setCachedAssignments(filtered);
    return { success: true, id };
  }

  if (isSimulatedApiError) {
    throw new ApiServerError('Lỗi xóa bài tập từ máy chủ');
  }

  remoteAssignments = remoteAssignments.filter((a) => a.id !== id);
  await setCachedAssignments(remoteAssignments);
  return { success: true, id };
}

// ----------------------------------------------------
// SYNC OFFLINE QUEUE
// ----------------------------------------------------

export async function syncOfflineQueueApi(): Promise<{ syncedCount: number }> {
  const queue = await getOfflineQueue();
  if (queue.length === 0) return { syncedCount: 0 };

  let count = 0;
  for (const item of queue) {
    if (item.type === 'CREATE_ASSIGNMENT') {
      const exists = remoteAssignments.some((a) => a.id === item.payload.id);
      if (!exists) {
        remoteAssignments.unshift({ ...item.payload, isOfflineCreated: false });
      }
      count++;
    } else if (item.type === 'UPDATE_ASSIGNMENT') {
      const { id, updates } = item.payload;
      const idx = remoteAssignments.findIndex((a) => a.id === id);
      if (idx !== -1) {
        remoteAssignments[idx] = { ...remoteAssignments[idx], ...updates };
      }
      count++;
    } else if (item.type === 'DELETE_ASSIGNMENT') {
      remoteAssignments = remoteAssignments.filter((a) => a.id !== item.payload.id);
      count++;
    } else if (item.type === 'CREATE_COURSE') {
      const exists = remoteCourses.some((c) => c.id === item.payload.id);
      if (!exists) {
        remoteCourses.push(item.payload);
      }
      count++;
    }
  }

  await setCachedAssignments(remoteAssignments);
  await setCachedCourses(remoteCourses);
  const now = new Date().toISOString();
  await setLastSyncTime(now);

  return { syncedCount: count };
}
