import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import React from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Due48HoursWidget } from '../../../src/components/assignments/Due48HoursWidget';
import { AppHeader } from '../../../src/components/common/AppHeader';
import { Button } from '../../../src/components/common/Button';
import { OfflineBanner } from '../../../src/components/common/OfflineBanner';
import { StateView } from '../../../src/components/common/StateView';
import { CourseProgressCard } from '../../../src/components/courses/CourseProgressCard';
import { useAppTheme } from '../../../src/constants/theme';
import { fetchAssignmentsApi, fetchCoursesApi } from '../../../src/services/mockApi';
import { QUERY_KEYS } from '../../../src/services/queryClient';
import { computeAllCoursesProgress, computeOverallStats } from '../../../src/utils/statsUtils';

export default function DashboardScreen() {
  const { colors, tokens } = useAppTheme();

  // Queries for courses and assignments
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
  const lastSyncTime = assignmentsQuery.data?.lastSync || coursesQuery.data?.lastSync;

  const isEmpty = !isLoading && !isError && courses.length === 0 && assignments.length === 0;

  // Dynamically compute progress stats (computed, NEVER stored)
  const courseProgressList = computeAllCoursesProgress(courses, assignments);
  const overallStats = computeOverallStats(courses, assignments);

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
        isEmpty={isEmpty}
        onRetry={handleRetry}
        emptyTitle="Chào mừng bạn đến với Study Planner!"
        emptyMessage="Hiện tại bạn chưa có môn học hoặc bài tập nào. Hãy bắt đầu tạo ngay."
        emptyActionLabel="Thêm môn học đầu tiên"
        onEmptyAction={() => router.push('/(app)/modal/new-course')}
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
          {/* Quick Action Top Bar */}
          <View style={[styles.actionRow, { marginBottom: tokens.spacing.base }]}>
            <Button
              label="Tạo bài tập"
              onPress={() => router.push('/(app)/modal/new-assignment')}
              variant="primary"
              size="sm"
              icon={<Ionicons name="add-circle-outline" size={18} color={colors.textInverse} />}
              style={{ flex: 1, marginRight: tokens.spacing.sm }}
            />
            <Button
              label="Thêm môn"
              onPress={() => router.push('/(app)/modal/new-course')}
              variant="secondary"
              size="sm"
              icon={<Ionicons name="folder-outline" size={18} color={colors.textPrimary} />}
              style={{ flex: 1 }}
            />
          </View>

          {/* Metric Overview Grid */}
          <View style={[styles.statsGrid, { marginBottom: tokens.spacing.base }]}>
            <View
              style={[
                styles.statBox,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: tokens.radii.lg,
                  padding: tokens.spacing.md,
                },
              ]}
            >
              <Text style={[styles.statValue, { color: colors.primary, fontSize: tokens.fontSize.xl }]}>
                {overallStats.totalAssignments}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted, fontSize: tokens.fontSize.xs }]}>
                Tổng bài tập
              </Text>
            </View>

            <View
              style={[
                styles.statBox,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: tokens.radii.lg,
                  padding: tokens.spacing.md,
                },
              ]}
            >
              <Text style={[styles.statValue, { color: colors.success, fontSize: tokens.fontSize.xl }]}>
                {overallStats.completedAssignments}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted, fontSize: tokens.fontSize.xs }]}>
                Đã hoàn thành
              </Text>
            </View>

            <View
              style={[
                styles.statBox,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: tokens.radii.lg,
                  padding: tokens.spacing.md,
                },
              ]}
            >
              <Text style={[styles.statValue, { color: colors.warning, fontSize: tokens.fontSize.xl }]}>
                {overallStats.outstandingAssignments}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted, fontSize: tokens.fontSize.xs }]}>
                Cần làm
              </Text>
            </View>

            <View
              style={[
                styles.statBox,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: tokens.radii.lg,
                  padding: tokens.spacing.md,
                },
              ]}
            >
              <Text
                style={[
                  styles.statValue,
                  {
                    color: overallStats.overdueCount > 0 ? colors.danger : colors.textMuted,
                    fontSize: tokens.fontSize.xl,
                  },
                ]}
              >
                {overallStats.overdueCount}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted, fontSize: tokens.fontSize.xs }]}>
                Quá hạn
              </Text>
            </View>
          </View>

          {/* 48-Hour Deadline Urgent Widget */}
          <Due48HoursWidget assignments={assignments} courses={courses} />

          {/* Course Progress Section */}
          <View style={styles.sectionHeader}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: colors.textPrimary,
                  fontSize: tokens.fontSize.lg,
                  fontWeight: tokens.fontWeight.bold,
                },
              ]}
            >
              Tiến độ theo môn học
            </Text>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Xem tất cả môn học"
              onPress={() => router.push('/(app)/(tabs)/courses')}
            >
              <Text style={[styles.seeAllText, { color: colors.primary, fontSize: tokens.fontSize.xs }]}>
                Xem tất cả
              </Text>
            </TouchableOpacity>
          </View>

          <Text
            style={[
              styles.sectionHint,
              {
                color: colors.textMuted,
                fontSize: tokens.fontSize.xs,
                marginBottom: tokens.spacing.md,
              },
            ]}
          >
            Tỷ lệ hoàn thành được tính toán tự động trong thời gian thực (computed dynamically)
          </Text>

          {courseProgressList.slice(0, 4).map((stats) => (
            <CourseProgressCard key={stats.courseId} stats={stats} />
          ))}
        </ScrollView>
      </StateView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 40,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  statValue: {
    fontWeight: '700',
  },
  statLabel: {
    marginTop: 2,
    fontWeight: '500',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  sectionTitle: {},
  seeAllText: {
    fontWeight: '600',
  },
  sectionHint: {
    marginTop: 2,
  },
});
