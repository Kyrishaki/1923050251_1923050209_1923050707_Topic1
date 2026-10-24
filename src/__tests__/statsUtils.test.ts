import { Assignment, Course } from '../types';
import {
  computeAllCoursesProgress,
  computeCourseProgress,
  computeOverallStats,
} from '../utils/statsUtils';

describe('Progress Statistics ("Computed, never stored")', () => {
  const mockCourse: Course = {
    id: 'course-mobile',
    code: 'TH7011101',
    name: 'Lập trình Mobile',
    colour: 'emerald',
    credits: 3,
  };

  const mockAssignments: Assignment[] = [
    {
      id: 'a1',
      courseId: 'course-mobile',
      title: 'Lab 01',
      dueAt: '2026-10-20T23:59:00.000Z',
      status: 'completed',
      createdAt: '2026-10-15T00:00:00.000Z',
      updatedAt: '2026-10-15T00:00:00.000Z',
    },
    {
      id: 'a2',
      courseId: 'course-mobile',
      title: 'Lab 02',
      dueAt: '2026-10-22T23:59:00.000Z',
      status: 'completed',
      createdAt: '2026-10-15T00:00:00.000Z',
      updatedAt: '2026-10-15T00:00:00.000Z',
    },
    {
      id: 'a3',
      courseId: 'course-mobile',
      title: 'Final Project',
      dueAt: '2026-10-28T23:59:00.000Z',
      status: 'in_progress',
      createdAt: '2026-10-15T00:00:00.000Z',
      updatedAt: '2026-10-15T00:00:00.000Z',
    },
    {
      id: 'a4',
      courseId: 'course-mobile',
      title: 'Quiz 01',
      dueAt: '2026-10-30T23:59:00.000Z',
      status: 'pending',
      createdAt: '2026-10-15T00:00:00.000Z',
      updatedAt: '2026-10-15T00:00:00.000Z',
    },
  ];

  it('should dynamically compute completed versus outstanding correctly', () => {
    const stats = computeCourseProgress(mockCourse, mockAssignments);

    expect(stats.total).toBe(4);
    expect(stats.completed).toBe(2);
    expect(stats.outstanding).toBe(2); // 1 in_progress + 1 pending
    expect(stats.completionRate).toBe(50); // (2 / 4) * 100
  });

  it('should return 0% completion when a course has zero assignments', () => {
    const stats = computeCourseProgress(mockCourse, []);

    expect(stats.total).toBe(0);
    expect(stats.completed).toBe(0);
    expect(stats.outstanding).toBe(0);
    expect(stats.completionRate).toBe(0);
  });

  it('should return 100% completion when all assignments are completed', () => {
    const allCompleted: Assignment[] = mockAssignments
      .slice(0, 2)
      .map((a) => ({ ...a, status: 'completed' }));
    const stats = computeCourseProgress(mockCourse, allCompleted);

    expect(stats.total).toBe(2);
    expect(stats.completed).toBe(2);
    expect(stats.outstanding).toBe(0);
    expect(stats.completionRate).toBe(100);
  });

  it('should calculate stats for multiple courses independently', () => {
    const course2: Course = {
      id: 'course-web',
      code: 'TH7011102',
      name: 'Web Dev',
      colour: 'blue',
      credits: 3,
    };

    const multiAssignments: Assignment[] = [
      ...mockAssignments,
      {
        id: 'web-1',
        courseId: 'course-web',
        title: 'Project 1',
        dueAt: '2026-10-29T23:59:00.000Z',
        status: 'completed',
        createdAt: '2026-10-15T00:00:00.000Z',
        updatedAt: '2026-10-15T00:00:00.000Z',
      },
    ];

    const results = computeAllCoursesProgress([mockCourse, course2], multiAssignments);

    expect(results).toHaveLength(2);
    expect(results[0].courseId).toBe('course-mobile');
    expect(results[0].total).toBe(4);
    expect(results[1].courseId).toBe('course-web');
    expect(results[1].total).toBe(1);
    expect(results[1].completionRate).toBe(100);
  });

  it('should compute high-level overall stats correctly', () => {
    const now = new Date('2026-10-25T12:00:00.000Z');
    const overall = computeOverallStats([mockCourse], mockAssignments, now);

    expect(overall.totalCourses).toBe(1);
    expect(overall.totalAssignments).toBe(4);
    expect(overall.completedAssignments).toBe(2);
    expect(overall.outstandingAssignments).toBe(2);
    expect(overall.overallCompletionRate).toBe(50);
  });
});
