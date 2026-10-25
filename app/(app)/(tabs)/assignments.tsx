import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AssignmentCard } from '../../../src/components/assignments/AssignmentCard';
import { AppHeader } from '../../../src/components/common/AppHeader';
import { Button } from '../../../src/components/common/Button';
import { OfflineBanner } from '../../../src/components/common/OfflineBanner';
import { StateView } from '../../../src/components/common/StateView';
import { useAppTheme } from '../../../src/constants/theme';
import {
  fetchAssignmentsApi,
  fetchCoursesApi,
  updateAssignmentApi,
} from '../../../src/services/mockApi';
import { appQueryClient, QUERY_KEYS } from '../../../src/services/queryClient';
import {
  selectSearchQuery,
  selectSelectedCourseId,
  selectSelectedStatus,
} from '../../../src/store/selectors';
import { FilterStatus, useAppStore } from '../../../src/store/useAppStore';
import { Assignment } from '../../../src/types';

export default function AssignmentsScreen() {
  const { colors, tokens } = useAppTheme();

  // Zustand atomic selectors
  const selectedCourseId = useAppStore(selectSelectedCourseId);
  const selectedStatus = useAppStore(selectSelectedStatus);
  const searchQuery = useAppStore(selectSearchQuery);

  const setSelectedCourseId = useAppStore((s) => s.setSelectedCourseId);
  const setSelectedStatus = useAppStore((s) => s.setSelectedStatus);
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);
  const resetFilters = useAppStore((s) => s.resetFilters);

  // Queries
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

  // Optimistic toggle mutation with rollback on failure
  const toggleMutation = useMutation({
    mutationFn: ({ id, nextStatus }: { id: string; nextStatus: Assignment['status'] }) =>
      updateAssignmentApi(id, { status: nextStatus }),
    onMutate: async ({ id, nextStatus }) => {
      // Cancel queries
      await appQueryClient.cancelQueries({ queryKey: QUERY_KEYS.ASSIGNMENTS });

      // Snapshot previous value for rollback
      const previous = appQueryClient.getQueryData(QUERY_KEYS.ASSIGNMENTS);

      // Optimistically update query cache
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
    onError: (err: any, variables, context: any) => {
      // Rollback to previous state
      if (context?.previous) {
        appQueryClient.setQueryData(QUERY_KEYS.ASSIGNMENTS, context.previous);
      }
      Alert.alert(
        'Thao tác thất bại',
        err?.message || 'Không thể cập nhật trạng thái. Dữ liệu đã được hoàn tác về ban đầu.'
      );
    },
    onSettled: () => {
      appQueryClient.invalidateQueries({ queryKey: QUERY_KEYS.ASSIGNMENTS });
    },
  });

  const handleToggle = (item: Assignment) => {
    const nextStatus = item.status === 'completed' ? 'pending' : 'completed';
    toggleMutation.mutate({ id: item.id, nextStatus });
  };

  // Filtered & searched data (computed during render, NEVER stored as derived state)
  const filteredAssignments = useMemo(() => {
    return assignments.filter((item) => {
      const matchCourse = selectedCourseId === 'all' || item.courseId === selectedCourseId;
      const matchStatus = selectedStatus === 'all' || item.status === selectedStatus;
      const q = searchQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        (item.notes && item.notes.toLowerCase().includes(q));

      return matchCourse && matchStatus && matchQuery;
    });
  }, [assignments, selectedCourseId, selectedStatus, searchQuery]);

  const isEmpty = !isLoading && !isError && assignments.length === 0;

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
        emptyTitle="Chưa có bài tập nào"
        emptyMessage="Hãy tạo bài tập đầu tiên để bắt đầu theo dõi tiến độ."
        emptyActionLabel="Tạo bài tập mới"
        onEmptyAction={() => router.push('/(app)/modal/new-assignment')}
      >
        <FlatList
          data={filteredAssignments}
          keyExtractor={(item) => item.id}
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
              {/* Header Title & Add Button */}
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
                    Danh sách bài tập ({filteredAssignments.length})
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: tokens.fontSize.xs, marginTop: 2 }}>
                    Tích ô vuông bên phải để cập nhật hoàn thành ngay lập tức
                  </Text>
                </View>

                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Tạo bài tập mới"
                  onPress={() => router.push('/(app)/modal/new-assignment')}
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

              {/* Search Bar */}
              <View
                style={[
                  styles.searchContainer,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderRadius: tokens.radii.lg,
                    paddingHorizontal: tokens.spacing.md,
                    marginTop: tokens.spacing.md,
                    minHeight: 46,
                  },
                ]}
              >
                <Ionicons name="search-outline" size={20} color={colors.textMuted} />
                <TextInput
                  accessibilityLabel="Tìm kiếm bài tập"
                  placeholder="Tìm theo tiêu đề, ghi chú bài làm..."
                  placeholderTextColor={colors.textMuted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={[
                    styles.searchInput,
                    {
                      color: colors.textPrimary,
                      fontSize: tokens.fontSize.sm,
                      marginLeft: tokens.spacing.sm,
                    },
                  ]}
                />
                {searchQuery ? (
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Xóa tìm kiếm"
                    onPress={() => setSearchQuery('')}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* Status Filter Chips */}
              <View style={[styles.filterGroup, { marginTop: tokens.spacing.md }]}>
                {(
                  [
                    { key: 'all', label: 'Tất cả' },
                    { key: 'pending', label: 'Chưa làm' },
                    { key: 'in_progress', label: 'Đang làm' },
                    { key: 'completed', label: 'Đã hoàn thành' },
                  ] as Array<{ key: FilterStatus; label: string }>
                ).map((statusItem) => {
                  const active = selectedStatus === statusItem.key;
                  return (
                    <TouchableOpacity
                      key={statusItem.key}
                      accessibilityRole="button"
                      accessibilityLabel={`Lọc trạng thái ${statusItem.label}`}
                      onPress={() => setSelectedStatus(statusItem.key)}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: active ? colors.primary : colors.surfaceSubtle,
                          borderColor: active ? colors.primary : colors.border,
                          borderRadius: tokens.radii.full,
                          paddingHorizontal: tokens.spacing.md,
                          paddingVertical: 6,
                          marginRight: tokens.spacing.xs,
                          marginBottom: tokens.spacing.xs,
                          minHeight: 36,
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
                        {statusItem.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Course Filter Chips */}
              <View style={[styles.filterGroup, { marginTop: tokens.spacing.xs }]}>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Lọc tất cả môn"
                  onPress={() => setSelectedCourseId('all')}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selectedCourseId === 'all' ? colors.primaryDark : colors.surfaceSubtle,
                      borderColor: selectedCourseId === 'all' ? colors.primaryDark : colors.border,
                      borderRadius: tokens.radii.full,
                      paddingHorizontal: tokens.spacing.md,
                      paddingVertical: 6,
                      marginRight: tokens.spacing.xs,
                      marginBottom: tokens.spacing.xs,
                      minHeight: 36,
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

                {courses.map((c) => {
                  const active = selectedCourseId === c.id;
                  return (
                    <TouchableOpacity
                      key={c.id}
                      accessibilityRole="button"
                      accessibilityLabel={`Lọc môn ${c.code}`}
                      onPress={() => setSelectedCourseId(c.id)}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: active ? colors.primaryDark : colors.surfaceSubtle,
                          borderColor: active ? colors.primaryDark : colors.border,
                          borderRadius: tokens.radii.full,
                          paddingHorizontal: tokens.spacing.md,
                          paddingVertical: 6,
                          marginRight: tokens.spacing.xs,
                          marginBottom: tokens.spacing.xs,
                          minHeight: 36,
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
                        {c.code}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          }
          renderItem={({ item }) => {
            const course = courses.find((c) => c.id === item.courseId);
            return (
              <AssignmentCard
                assignment={item}
                course={course}
                onToggleComplete={handleToggle}
              />
            );
          }}
          ListEmptyComponent={
            <View
              style={[
                styles.emptyFilterBox,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderRadius: tokens.radii.lg,
                  padding: tokens.spacing.xl,
                },
              ]}
            >
              <Ionicons name="search" size={36} color={colors.textMuted} />
              <Text
                style={[
                  styles.emptyFilterText,
                  {
                    color: colors.textPrimary,
                    fontSize: tokens.fontSize.base,
                    fontWeight: tokens.fontWeight.bold,
                    marginTop: tokens.spacing.sm,
                  },
                ]}
              >
                Không tìm thấy bài tập phù hợp
              </Text>
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: tokens.fontSize.xs,
                  textAlign: 'center',
                  marginTop: 4,
                  marginBottom: tokens.spacing.base,
                }}
              >
                Hãy thử điều chỉnh lại bộ lọc trạng thái hoặc từ khóa tìm kiếm.
              </Text>
              <Button label="Đặt lại bộ lọc" onPress={resetFilters} variant="outline" size="sm" />
            </View>
          }
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
  },
  filterGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  emptyFilterBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  emptyFilterText: {},
});
