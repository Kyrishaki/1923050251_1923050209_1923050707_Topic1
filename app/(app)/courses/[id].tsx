import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AssignmentCard } from '../../../src/components/assignments/AssignmentCard';
import { CourseBadge } from '../../../src/components/common/Badge';
import { Button } from '../../../src/components/common/Button';
import { OfflineBanner } from '../../../src/components/common/OfflineBanner';
import { StateView } from '../../../src/components/common/StateView';
import { getCourseColorTokens, useAppTheme } from '../../../src/constants/theme';
import { fetchAssignmentsApi, fetchCoursesApi } from '../../../src/services/mockApi';
import { QUERY_KEYS } from '../../../src/services/queryClient';
import { computeCourseProgress } from '../../../src/utils/statsUtils';

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, tokens } = useAppTheme();

  const coursesQuery = useQuery({
    queryKey: QUERY_KEYS.COURSES,
    queryFn: fetchCoursesApi,
  });

  const assignmentsQuery = useQuery({
    queryKey: QUERY_KEYS.ASSIGNMENTS,
    queryFn: fetchAssignmentsApi,
  });

  const courses = coursesQuery.data?.data || [];
  const assignments = assignmentsQuery.data?.data || [];

  const course = courses.find((c) => c.id === id);
  const courseTokens = getCourseColorTokens(colors, course?.colour);

  const courseAssignments = assignments.filter((a) => a.courseId === id);
  const stats = course ? computeCourseProgress(course, assignments) : null;

  const isLoading = coursesQuery.isLoading || assignmentsQuery.isLoading;
  const isError = coursesQuery.isError || assignmentsQuery.isError;
  const error = coursesQuery.error || assignmentsQuery.error;
  const isRefetching = coursesQuery.isRefetching || assignmentsQuery.isRefetching;

  const handleRetry = () => {
    coursesQuery.refetch();
    assignmentsQuery.refetch();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <OfflineBanner />

      <StateView
        isLoading={isLoading}
        error={isError ? error : null}
        isEmpty={!isLoading && !course}
        onRetry={handleRetry}
        emptyTitle="Không tìm thấy môn học"
        emptyMessage="Môn học không tồn tại hoặc đã bị xóa."
      >
        {course && stats ? (
          <FlatList
            data={courseAssignments}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.content, { padding: tokens.spacing.base }]}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={handleRetry}
                tintColor={colors.primary}
              />
            }
            ListHeaderComponent={
              <View style={{ marginBottom: tokens.spacing.md }}>
                {/* Course Info Header Card */}
                <View
                  style={[
                    styles.headerCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      borderRadius: tokens.radii.lg,
                      padding: tokens.spacing.base,
                      borderLeftColor: courseTokens.main,
                      borderLeftWidth: 6,
                    },
                  ]}
                >
                  <View style={styles.topRow}>
                    <CourseBadge courseCode={course.code} colourKey={course.colour} />
                    <Text
                      style={[
                        styles.rateText,
                        {
                          color: stats.completionRate === 100 ? colors.successText : courseTokens.main,
                          fontSize: tokens.fontSize.sm,
                          fontWeight: '700',
                        },
                      ]}
                    >
                      {stats.completionRate}% Hoàn thành
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.courseTitle,
                      {
                        color: colors.textPrimary,
                        fontSize: tokens.fontSize.lg,
                        fontWeight: tokens.fontWeight.bold,
                        marginTop: tokens.spacing.sm,
                      },
                    ]}
                  >
                    {course.name}
                  </Text>

                  {/* Progress bar */}
                  <View
                    style={[
                      styles.progressTrack,
                      {
                        backgroundColor: colors.surfaceSubtle,
                        borderRadius: tokens.radii.full,
                        marginTop: tokens.spacing.md,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.progressBar,
                        {
                          backgroundColor:
                            stats.completionRate === 100 ? colors.success : courseTokens.main,
                          borderRadius: tokens.radii.full,
                          width: `${Math.max(stats.completionRate, 4)}%`,
                        },
                      ]}
                    />
                  </View>

                  {/* Dynamic stats row */}
                  <View style={[styles.statsRow, { marginTop: tokens.spacing.sm }]}>
                    <Text style={{ color: colors.successText, fontSize: tokens.fontSize.xs, fontWeight: '600' }}>
                      ✓ Đã xong: {stats.completed}
                    </Text>
                    <Text style={{ color: colors.warningText, fontSize: tokens.fontSize.xs, fontWeight: '600' }}>
                      ⏳ Cần làm: {stats.outstanding}
                    </Text>
                    <Text style={{ color: colors.textMuted, fontSize: tokens.fontSize.xs }}>
                      Tổng: {stats.total} bài
                    </Text>
                  </View>

                  {/* Meta details */}
                  <View style={[styles.metaDivider, { borderColor: colors.border }]} />

                  {course.instructor ? (
                    <View style={styles.metaRow}>
                      <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
                      <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                        Giảng viên: {course.instructor}
                      </Text>
                    </View>
                  ) : null}

                  {course.room ? (
                    <View style={[styles.metaRow, { marginTop: 4 }]}>
                      <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                      <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                        Phòng học: {course.room} ({course.credits} tín chỉ)
                      </Text>
                    </View>
                  ) : null}
                </View>

                {/* Section title & Add assignment shortcut */}
                <View style={[styles.sectionRow, { marginTop: tokens.spacing.lg }]}>
                  <Text
                    style={[
                      styles.sectionHeading,
                      {
                        color: colors.textPrimary,
                        fontSize: tokens.fontSize.base,
                        fontWeight: tokens.fontWeight.bold,
                      },
                    ]}
                  >
                    Bài tập của môn ({courseAssignments.length})
                  </Text>

                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Tạo bài tập cho môn này"
                    onPress={() =>
                      router.push({
                        pathname: '/(app)/modal/new-assignment',
                        params: { defaultCourseId: course.id },
                      })
                    }
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                  >
                    <Ionicons name="add-circle" size={18} color={colors.primary} />
                    <Text style={{ color: colors.primary, fontSize: tokens.fontSize.xs, marginLeft: 4, fontWeight: '600' }}>
                      Thêm bài tập
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            }
            renderItem={({ item }) => <AssignmentCard assignment={item} course={course} />}
            ListEmptyComponent={
              <View
                style={[
                  styles.emptyCard,
                  {
                    backgroundColor: colors.surfaceSubtle,
                    borderRadius: tokens.radii.lg,
                    padding: tokens.spacing.xl,
                  },
                ]}
              >
                <Ionicons name="document-text-outline" size={36} color={colors.textMuted} />
                <Text style={{ color: colors.textSecondary, fontWeight: '600', marginTop: 8 }}>
                  Môn này chưa có bài tập nào
                </Text>
                <Button
                  label="Thêm bài tập ngay"
                  onPress={() =>
                    router.push({
                      pathname: '/(app)/modal/new-assignment',
                      params: { defaultCourseId: course.id },
                    })
                  }
                  variant="primary"
                  size="sm"
                  style={{ marginTop: tokens.spacing.md }}
                />
              </View>
            }
          />
        ) : null}
      </StateView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 40,
  },
  headerCard: {
    borderWidth: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rateText: {},
  courseTitle: {},
  progressTrack: {
    height: 8,
    width: '100%',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaDivider: {
    borderTopWidth: 1,
    marginVertical: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 13,
    marginLeft: 6,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeading: {},
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
