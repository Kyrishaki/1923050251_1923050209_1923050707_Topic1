import { Assignment, Course, CourseProgressStats, OverallStats } from '../types';
import { isDueWithin48Hours, isOverdue } from './dateUtils';

/**
 * Computes progress stats for a specific course.
 * CRITICAL RULE: These stats are computed dynamically on the fly, NEVER stored in the database.
 */
export function computeCourseProgress(
  course: Course,
  assignments: Assignment[]
): CourseProgressStats {
  const courseAssignments = assignments.filter((a) => a.courseId === course.id);
  const total = courseAssignments.length;
  const completed = courseAssignments.filter((a) => a.status === 'completed').length;
  const outstanding = total - completed;
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

  return {
    courseId: course.id,
    courseCode: course.code,
    courseName: course.name,
    courseColour: course.colour,
    total,
    completed,
    outstanding,
    completionRate,
  };
}

/**
 * Computes progress stats for all active courses.
 */
export function computeAllCoursesProgress(
  courses: Course[],
  assignments: Assignment[]
): CourseProgressStats[] {
  return courses.map((course) => computeCourseProgress(course, assignments));
}

/**
 * Computes high-level aggregated statistics for the student dashboard.
 */
export function computeOverallStats(
  courses: Course[],
  assignments: Assignment[],
  now: Date = new Date()
): OverallStats {
  const totalCourses = courses.length;
  const totalAssignments = assignments.length;
  const completedAssignments = assignments.filter((a) => a.status === 'completed').length;
  const outstandingAssignments = totalAssignments - completedAssignments;

  const dueNext48HoursCount = assignments.filter(
    (a) => a.status !== 'completed' && isDueWithin48Hours(a.dueAt, now)
  ).length;

  const overdueCount = assignments.filter(
    (a) => a.status !== 'completed' && isOverdue(a.dueAt, now)
  ).length;

  const overallCompletionRate =
    totalAssignments === 0 ? 0 : Math.round((completedAssignments / totalAssignments) * 100);

  return {
    totalCourses,
    totalAssignments,
    completedAssignments,
    outstandingAssignments,
    dueNext48HoursCount,
    overdueCount,
    overallCompletionRate,
  };
}
