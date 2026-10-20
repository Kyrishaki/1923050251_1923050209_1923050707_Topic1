export type AssignmentStatus = 'pending' | 'in_progress' | 'completed';

export type Priority = 'high' | 'medium' | 'low';

export interface Course {
  id: string; // e.g. "course-01"
  code: string; // e.g. "TH7011101"
  name: string; // e.g. "Lập trình Mobile"
  colour: 'emerald' | 'blue' | 'amber' | 'purple' | 'rose' | 'indigo' | 'cyan';
  credits: number;
  instructor?: string;
  room?: string;
  dayOfWeek?: number; // 1 (Mon) - 7 (Sun)
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  dueAt: string; // ISO 8601 string, e.g. "2026-10-28T23:59:00.000Z"
  status: AssignmentStatus;
  notes?: string;
  photoUri?: string;
  priority?: Priority;
  estimatedMinutes?: number;
  createdAt: string;
  updatedAt: string;
  isOfflineCreated?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  studentId: string;
  avatar?: string;
}

// Progress statistics computed dynamically, never stored
export interface CourseProgressStats {
  courseId: string;
  courseCode: string;
  courseName: string;
  courseColour: Course['colour'];
  total: number;
  completed: number;
  outstanding: number; // pending + in_progress
  completionRate: number; // 0 - 100 percentage
}

export interface OverallStats {
  totalCourses: number;
  totalAssignments: number;
  completedAssignments: number;
  outstandingAssignments: number;
  dueNext48HoursCount: number;
  overdueCount: number;
  overallCompletionRate: number;
}

export interface OfflineQueueItem {
  id: string;
  type: 'CREATE_ASSIGNMENT' | 'UPDATE_ASSIGNMENT' | 'DELETE_ASSIGNMENT' | 'CREATE_COURSE';
  payload: any;
  timestamp: number;
  retryCount: number;
}
