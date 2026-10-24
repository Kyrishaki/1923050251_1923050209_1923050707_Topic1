import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AssignmentCard } from '../../../src/components/assignments/AssignmentCard';
import { AppHeader } from '../../../src/components/common/AppHeader';
import { OfflineBanner } from '../../../src/components/common/OfflineBanner';
import { StateView } from '../../../src/components/common/StateView';
import { useAppTheme } from '../../../src/constants/theme';
import {
  fetchAssignmentsApi,
  fetchCoursesApi,
  updateAssignmentApi,
} from '../../../src/services/mockApi';
import { appQueryClient, QUERY_KEYS } from '../../../src/services/queryClient';
import { Assignment } from '../../../src/types';
import {
  formatDate,
  getCalendarDayDiff,
  getCurrentWeekDays,
} from '../../../src/utils/dateUtils';

export default function WeeklyViewScreen() {
  const { colors, tokens } = useAppTheme();
  const weekDays = getCurrentWeekDays();

  // Selected date index (default to today if found, else Monday = 0)
  const todayIdx = weekDays.findIndex((d) => d.isToday);
  const [selectedDayIndex, setSelectedDayIndex] = useState(todayIdx >= 0 ? todayIdx : 0);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');

  const coursesQuery = useQuery({
    queryKey: QUERY_KEYS.COURSES,
    queryFn: fetchCoursesApi,
  });

  const assignmentsQuery = useQuery({
    queryKey: QUERY_KEYS.ASSIGNMENTS,
    queryFn: fetchAssignmentsApi,
  });

  const isLoading = coursesQuery.isLoading || assignmentsQuery.isLoading;
  const isError = coursesQuery.isError || assignmentsQuery.isError;
  const error = coursesQuery.error || assignmentsQuery.error;
  const isRefetching = coursesQuery.isRefetching || assignmentsQuery.isRefetching;

  const courses = coursesQuery.data?.data || [];
  const assignments = assignmentsQuery.data?.data || [];
  const lastSyncTime = assignmentsQuery.data?.lastSync;

  // Optimistic update mutation
  const toggleMutation = useMutation({
    mutationFn: ({ id, nextStatus }: { id: string; nextStatus: Assignment['status'] }) =>
      updateAssignmentApi(id, { status: nextStatus }),
    onMutate: async ({ id, nextStatus }) => {
      await appQueryClient.cancelQueries({ queryKey: QUERY_KEYS.ASSIGNMENTS });
      const previous = appQueryClient.getQueryData(QUERY_KEYS.ASSIGNMENTS);

      appQueryClient.setQueryData(QUERY_KEYS.ASSIGNMENTS, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((item: Assignment) =>
            item.id === id ? { ...item, status: nextStatus } : item
          ),
        };
      });

      return { previous };
    },
    onError: (err, variables, context: any) => {
      if (context?.previous) {
        appQueryClient.setQueryData(QUERY_KEYS.ASSIGNMENTS, context.previous);
      }
    },
    onSettled: () => {
      appQueryClient.invalidateQueries({ queryKey: QUERY_KEYS.ASSIGNMENTS });
    },
  });

  const handleToggle = (item: Assignment) => {
    const nextStatus = item.status === 'completed' ? 'pending' : 'completed';
    toggleMutation.mutate({ id: item.id, nextStatus });
  };

  const selectedDate = weekDays[selectedDayIndex].date;

  // Filter assignments matching selected calendar day and course
  const dayAssignments = assignments.filter((a) => {
    const matchesDay = getCalendarDayDiff(a.dueAt, selectedDate) === 0;
    const matchesCourse = selectedCourseId === 'all' || a.courseId === selectedCourseId;
    return matchesDay && matchesCourse;
  });

  // Calculate assignment count per day of week for badge indicator
  const getDayCount = (date: Date) => {
    return assignments.filter((a) => getCalendarDayDiff(a.dueAt, date) === 0).length;
  };

  const handleRetry = () => {
    coursesQuery.refetch();
    assignmentsQuery.refetch();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader />
      <OfflineBanner lastSyncTime={lastSyncTime} />

      <StateView
        isLoading={isLoading}
        error={isError ? error : null}
        isEmpty={false}
        onRetry={handleRetry}
      >
        <ScrollView
          contentContainerStyle={[styles.content, { padding: tokens.spacing.base }]}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={handleRetry}
              tintColor={colors.primary}
            />
          }
        >
          {/* Header Title */}
          <View style={{ marginBottom: tokens.spacing.md }}>
            <Text
              style={[
                styles.title,
                {
                  color: colors.textPrimary,
                  fontSize: tokens.fontSize.xl,
                  fontWeight: tokens.fontWeight.bold,
                },
              ]}
            >
              Lịch hạn tuần này
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: tokens.fontSize.xs, marginTop: 2 }}>
              Khung nhìn theo lịch giúp sinh viên phân bổ thời gian học tập hợp lý
            </Text>
          </View>

          {/* Horizontal Day Selector (7 Days) */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.daySelectorRow}
          >
            {weekDays.map((d, index) => {
              const isSelected = index === selectedDayIndex;
              const count = getDayCount(d.date);

              return (
                <TouchableOpacity
                  key={d.dateStr}
                  accessibilityRole="button"
                  accessibilityLabel={`${d.label}, ngày ${d.dateStr}, có ${count} bài tập`}
                  onPress={() => setSelectedDayIndex(index)}
                  style={[
                    styles.dayPill,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.card,
                      borderColor: d.isToday ? colors.primary : colors.border,
                      borderWidth: d.isToday ? 2 : 1,
                      borderRadius: tokens.radii.lg,
                      padding: tokens.spacing.sm,
                      marginRight: tokens.spacing.sm,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.dayLabel,
                      {
                        color: isSelected ? colors.textInverse : colors.textSecondary,
                        fontSize: tokens.fontSize.xs,
                        fontWeight: tokens.fontWeight.bold,
                      },
                    ]}
                  >
                    {d.label.replace('Thứ ', 'T')}
                  </Text>
                  <Text
                    style={[
                      styles.dayNumber,
                      {
                        color: isSelected ? colors.textInverse : colors.textPrimary,
                        fontSize: tokens.fontSize.base,
                        fontWeight: tokens.fontWeight.bold,
                        marginTop: 2,
                      },
                    ]}
                  >
                    {d.date.getDate()}
                  </Text>

                  {/* Indicator count dot / badge */}
                  {count > 0 ? (
                    <View
                      style={[
                        styles.countDot,
                        {
                          backgroundColor: isSelected ? colors.textInverse : colors.warning,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.countDotText,
                          {
                            color: isSelected ? colors.primary : colors.textInverse,
                            fontSize: 10,
                            fontWeight: '700',
                          },
                        ]}
                      >
                        {count}
                      </Text>
                    </View>
                  ) : (
                    <View style={{ height: 16 }} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Course Filter Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.courseFilterRow, { marginVertical: tokens.spacing.md }]}
          >
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Xem tất cả môn học"
              onPress={() => setSelectedCourseId('all')}
              style={[
                styles.chip,
                {
                  backgroundColor: selectedCourseId === 'all' ? colors.primary : colors.surfaceSubtle,
                  borderRadius: tokens.radii.full,
                  paddingHorizontal: tokens.spacing.md,
                  paddingVertical: 6,
                  marginRight: tokens.spacing.xs,
                },
              ]}
            >
              <Text
                style={{
                  color: selectedCourseId === 'all' ? colors.textInverse : colors.textSecondary,
                  fontSize: tokens.fontSize.xs,
                  fontWeight: '600',
                }}
              >
                Tất cả môn
              </Text>
            </TouchableOpacity>

            {courses.map((course) => {
              const active = selectedCourseId === course.id;
              return (
                <TouchableOpacity
                  key={course.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Lọc môn ${course.code}`}
                  onPress={() => setSelectedCourseId(course.id)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active ? colors.primary : colors.surfaceSubtle,
                      borderRadius: tokens.radii.full,
                      paddingHorizontal: tokens.spacing.md,
                      paddingVertical: 6,
                      marginRight: tokens.spacing.xs,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: active ? colors.textInverse : colors.textSecondary,
                      fontSize: tokens.fontSize.xs,
                      fontWeight: '600',
                    }}
                  >
                    {course.code}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Selected Date Summary Label */}
          <View style={[styles.daySummaryHeader, { marginBottom: tokens.spacing.md }]}>
            <Text
              style={[
                styles.selectedDayTitle,
                {
                  color: colors.textPrimary,
                  fontSize: tokens.fontSize.base,
                  fontWeight: tokens.fontWeight.bold,
                },
              ]}
            >
              Hạn nộp {weekDays[selectedDayIndex].label} ({formatDate(selectedDate)})
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: tokens.fontSize.xs }}>
              {dayAssignments.length} bài tập
            </Text>
          </View>

          {/* Assignments for this Day */}
          {dayAssignments.length === 0 ? (
            <View
              style={[
                styles.emptyDayBox,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderRadius: tokens.radii.lg,
                  padding: tokens.spacing.xl,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons name="sunny-outline" size={40} color={colors.warning} />
              <Text
                style={[
                  styles.emptyDayText,
                  {
                    color: colors.textSecondary,
                    fontSize: tokens.fontSize.base,
                    fontWeight: tokens.fontWeight.semibold,
                    marginTop: tokens.spacing.sm,
                  },
                ]}
              >
                Không có bài tập nào đến hạn vào ngày này!
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: tokens.fontSize.xs, marginTop: 4 }}>
                Tận dụng thời gian để ôn tập hoặc hoàn thành trước các bài tập khác.
              </Text>
            </View>
          ) : (
            dayAssignments.map((assignment) => {
              const course = courses.find((c) => c.id === assignment.courseId);
              return (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  course={course}
                  onToggleComplete={handleToggle}
                />
              );
            })
          )}
        </ScrollView>
      </StateView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 40,
  },
  title: {},
  daySelectorRow: {
    paddingVertical: 4,
  },
  dayPill: {
    width: 62,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dayLabel: {},
  dayNumber: {},
  countDot: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    paddingHorizontal: 4,
  },
  countDotText: {},
  courseFilterRow: {
    flexDirection: 'row',
  },
  chip: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  daySummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedDayTitle: {},
  emptyDayBox: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    marginVertical: 12,
  },
  emptyDayText: {
    textAlign: 'center',
  },
});
