import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import React from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppHeader } from '../../../src/components/common/AppHeader';
import { OfflineBanner } from '../../../src/components/common/OfflineBanner';
import { StateView } from '../../../src/components/common/StateView';
import { CourseProgressCard } from '../../../src/components/courses/CourseProgressCard';
import { useAppTheme } from '../../../src/constants/theme';
import { fetchAssignmentsApi, fetchCoursesApi } from '../../../src/services/mockApi';
import { QUERY_KEYS } from '../../../src/services/queryClient';
import { computeAllCoursesProgress } from '../../../src/utils/statsUtils';

export default function CoursesScreen() {
  const { colors, tokens } = useAppTheme();

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
  const lastSyncTime = coursesQuery.data?.lastSync;

  const isEmpty = !isLoading && !isError && courses.length === 0;

  // Dynamically compute progress stats for all courses
  const progressList = computeAllCoursesProgress(courses, assignments);

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
        emptyTitle="Chưa có môn học nào"
        emptyMessage="Hãy thêm môn học đầu tiên để theo dõi lịch học và bài tập."
        emptyActionLabel="Thêm môn học mới"
        onEmptyAction={() => router.push('/(app)/modal/new-course')}
      >
        <FlatList
          data={progressList}
          keyExtractor={(item) => item.courseId}
          contentContainerStyle={[styles.listContent, { padding: tokens.spacing.base }]}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={handleRetry}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={
            <View style={{ marginBottom: tokens.spacing.md }}>
              <View style={styles.headerRow}>
                <View>
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
                    Môn học ({courses.length})
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: tokens.fontSize.xs, marginTop: 2 }}>
                    Chạm vào môn học để xem danh sách bài tập chi tiết
                  </Text>
                </View>

                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Thêm môn học mới"
                  onPress={() => router.push('/(app)/modal/new-course')}
                  style={[
                    styles.addBtn,
                    {
                      backgroundColor: colors.primary,
                      borderRadius: tokens.radii.full,
                      paddingHorizontal: tokens.spacing.md,
                      paddingVertical: 8,
                      minHeight: 44,
                    },
                  ]}
                >
                  <Ionicons name="add" size={20} color={colors.textInverse} />
                  <Text
                    style={{
                      color: colors.textInverse,
                      fontSize: tokens.fontSize.xs,
                      fontWeight: '700',
                      marginLeft: 4,
                    }}
                  >
                    Thêm
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          }
          renderItem={({ item }) => <CourseProgressCard stats={item} />}
        />
      </StateView>
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {},
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
