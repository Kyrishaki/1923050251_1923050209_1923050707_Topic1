import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CourseBadge, PriorityBadge, StatusBadge } from '../../../src/components/common/Badge';
import { Button } from '../../../src/components/common/Button';
import { OfflineBanner } from '../../../src/components/common/OfflineBanner';
import { StateView } from '../../../src/components/common/StateView';
import { getCourseColorTokens, useAppTheme } from '../../../src/constants/theme';
import {
  deleteAssignmentApi,
  fetchAssignmentByIdApi,
  fetchCoursesApi,
  updateAssignmentApi,
} from '../../../src/services/mockApi';
import { triggerTestNotification } from '../../../src/services/notificationService';
import { appQueryClient, QUERY_KEYS } from '../../../src/services/queryClient';
import { Assignment } from '../../../src/types';
import { formatDateTime, getDueRelativeLabel, isOverdue } from '../../../src/utils/dateUtils';
import { pickImageFromGallery } from '../../../src/utils/photoUtils';

export default function AssignmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, tokens } = useAppTheme();
  const [photoError, setPhotoError] = useState<string | null>(null);

  // Assignment detail query
  const assignmentQuery = useQuery({
    queryKey: QUERY_KEYS.ASSIGNMENT_DETAIL(id!),
    queryFn: () => fetchAssignmentByIdApi(id!),
    enabled: !!id,
  });

  // Courses query to get course metadata
  const coursesQuery = useQuery({
    queryKey: QUERY_KEYS.COURSES,
    queryFn: fetchCoursesApi,
  });

  const assignment = assignmentQuery.data;
  const courses = coursesQuery.data?.data || [];
  const course = courses.find((c) => c.id === assignment?.courseId);
  const courseTokens = getCourseColorTokens(colors, course?.colour);

  // Optimistic update status mutation
  const toggleMutation = useMutation({
    mutationFn: ({ nextStatus }: { nextStatus: Assignment['status'] }) =>
      updateAssignmentApi(id!, { status: nextStatus }),
    onMutate: async ({ nextStatus }) => {
      await appQueryClient.cancelQueries({ queryKey: QUERY_KEYS.ASSIGNMENT_DETAIL(id!) });
      const previous = appQueryClient.getQueryData(QUERY_KEYS.ASSIGNMENT_DETAIL(id!));

      appQueryClient.setQueryData(QUERY_KEYS.ASSIGNMENT_DETAIL(id!), (old: any) => {
        if (!old) return old;
        return { ...old, status: nextStatus };
      });

      return { previous };
    },
    onError: (err: any, variables, context: any) => {
      if (context?.previous) {
        appQueryClient.setQueryData(QUERY_KEYS.ASSIGNMENT_DETAIL(id!), context.previous);
      }
      Alert.alert('Lỗi cập nhật', err?.message || 'Không thể cập nhật trạng thái');
    },
    onSettled: () => {
      appQueryClient.invalidateQueries({ queryKey: QUERY_KEYS.ASSIGNMENT_DETAIL(id!) });
      appQueryClient.invalidateQueries({ queryKey: QUERY_KEYS.ASSIGNMENTS });
    },
  });

  // Update photo mutation
  const updatePhotoMutation = useMutation({
    mutationFn: (newPhotoUri: string) => updateAssignmentApi(id!, { photoUri: newPhotoUri }),
    onSuccess: () => {
      appQueryClient.invalidateQueries({ queryKey: QUERY_KEYS.ASSIGNMENT_DETAIL(id!) });
      appQueryClient.invalidateQueries({ queryKey: QUERY_KEYS.ASSIGNMENTS });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteAssignmentApi(id!),
    onSuccess: () => {
      appQueryClient.invalidateQueries({ queryKey: QUERY_KEYS.ASSIGNMENTS });
      Alert.alert('Thành công', 'Đã xóa bài tập thành công.');
      router.back();
    },
    onError: (err: any) => {
      Alert.alert('Lỗi xóa bài tập', err?.message || 'Không thể xóa bài tập');
    },
  });

  const handleToggleStatus = () => {
    if (!assignment) return;
    const nextStatus: Assignment['status'] =
      assignment.status === 'completed'
        ? 'in_progress'
        : assignment.status === 'in_progress'
        ? 'completed'
        : 'in_progress';
    toggleMutation.mutate({ nextStatus });
  };

  const handleAttachPhoto = async () => {
    setPhotoError(null);
    const res = await pickImageFromGallery();
    if (res.error) {
      setPhotoError(res.error);
      return;
    }
    if (res.uri) {
      updatePhotoMutation.mutate(res.uri);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Xóa bài tập',
      'Bạn có chắc chắn muốn xóa bài tập này? Thao tác không thể hoàn tác.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa vĩnh viễn',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(),
        },
      ]
    );
  };

  const handleTestNotification = () => {
    if (assignment) {
      triggerTestNotification(assignment);
    }
  };

  const isCompleted = assignment?.status === 'completed';
  const overdue = assignment && !isCompleted && isOverdue(assignment.dueAt);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <OfflineBanner />

      <StateView
        isLoading={assignmentQuery.isLoading}
        error={assignmentQuery.isError ? assignmentQuery.error : null}
        isEmpty={!assignmentQuery.isLoading && !assignment}
        onRetry={() => assignmentQuery.refetch()}
        emptyTitle="Không tìm thấy bài tập"
        emptyMessage="Bài tập này có thể đã bị xóa hoặc liên kết không chính xác."
      >
        {assignment ? (
          <ScrollView contentContainerStyle={[styles.content, { padding: tokens.spacing.base }]}>
            {/* Top Course Card Header */}
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
                <CourseBadge courseCode={course?.code || 'MÔN HỌC'} colourKey={course?.colour} />
                <StatusBadge status={assignment.status} />
              </View>

              <Text
                style={[
                  styles.title,
                  {
                    color: colors.textPrimary,
                    fontSize: tokens.fontSize.lg,
                    fontWeight: tokens.fontWeight.bold,
                    marginTop: tokens.spacing.sm,
                  },
                ]}
              >
                {assignment.title}
              </Text>

              <Text
                style={[
                  styles.courseName,
                  {
                    color: colors.textSecondary,
                    fontSize: tokens.fontSize.sm,
                    marginTop: 2,
                  },
                ]}
              >
                {course?.name || 'Chưa rõ tên môn học'}
              </Text>
            </View>

            {/* Deadline & Status Details Card */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: tokens.radii.lg,
                  padding: tokens.spacing.base,
                  marginTop: tokens.spacing.md,
                },
              ]}
            >
              <Text
                style={[
                  styles.sectionHeading,
                  {
                    color: colors.textPrimary,
                    fontSize: tokens.fontSize.base,
                    fontWeight: tokens.fontWeight.bold,
                    marginBottom: tokens.spacing.md,
                  },
                ]}
              >
                Thông tin thời hạn & Nhắc nhở
              </Text>

              <View style={styles.infoRow}>
                <Ionicons
                  name={overdue ? 'alert-circle' : 'time-outline'}
                  size={20}
                  color={overdue ? colors.danger : colors.primary}
                />
                <View style={{ marginLeft: tokens.spacing.sm }}>
                  <Text style={{ color: colors.textMuted, fontSize: tokens.fontSize.xs }}>
                    Hạn nộp tương đối
                  </Text>
                  <Text
                    style={{
                      color: overdue ? colors.dangerText : colors.textPrimary,
                      fontSize: tokens.fontSize.base,
                      fontWeight: tokens.fontWeight.bold,
                    }}
                  >
                    {getDueRelativeLabel(assignment.dueAt)}
                  </Text>
                </View>
              </View>

              <View style={[styles.infoRow, { marginTop: tokens.spacing.md }]}>
                <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
                <View style={{ marginLeft: tokens.spacing.sm }}>
                  <Text style={{ color: colors.textMuted, fontSize: tokens.fontSize.xs }}>
                    Hạn nộp chính xác
                  </Text>
                  <Text style={{ color: colors.textPrimary, fontSize: tokens.fontSize.sm, fontWeight: '600' }}>
                    {formatDateTime(assignment.dueAt)}
                  </Text>
                </View>
              </View>

              {assignment.priority ? (
                <View style={[styles.infoRow, { marginTop: tokens.spacing.md }]}>
                  <Ionicons name="flag-outline" size={20} color={colors.textSecondary} />
                  <View style={{ marginLeft: tokens.spacing.sm }}>
                    <Text style={{ color: colors.textMuted, fontSize: tokens.fontSize.xs }}>
                      Mức độ ưu tiên
                    </Text>
                    <PriorityBadge priority={assignment.priority} style={{ marginTop: 2 }} />
                  </View>
                </View>
              ) : null}

              {/* Deadline reminder test button */}
              <Button
                label="🔔 Thử gửi thông báo nhắc hạn (Local Notification)"
                onPress={handleTestNotification}
                variant="outline"
                size="sm"
                style={{ marginTop: tokens.spacing.base }}
              />
            </View>

            {/* Notes Section */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: tokens.radii.lg,
                  padding: tokens.spacing.base,
                  marginTop: tokens.spacing.md,
                },
              ]}
            >
              <Text
                style={[
                  styles.sectionHeading,
                  {
                    color: colors.textPrimary,
                    fontSize: tokens.fontSize.base,
                    fontWeight: tokens.fontWeight.bold,
                    marginBottom: tokens.spacing.xs,
                  },
                ]}
              >
                Ghi chú bài học
              </Text>
              <Text
                style={{
                  color: assignment.notes ? colors.textPrimary : colors.textMuted,
                  fontSize: tokens.fontSize.sm,
                  lineHeight: 22,
                }}
              >
                {assignment.notes || 'Không có ghi chú thêm cho bài tập này.'}
              </Text>
            </View>

            {/* Whiteboard / Handwritten Photo Attachment */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: tokens.radii.lg,
                  padding: tokens.spacing.base,
                  marginTop: tokens.spacing.md,
                },
              ]}
            >
              <View style={styles.topRow}>
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
                  Ảnh ghi chú bảng viết / Sổ tay
                </Text>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Đính kèm ảnh mới"
                  onPress={handleAttachPhoto}
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                >
                  <Ionicons name="camera-outline" size={16} color={colors.primary} />
                  <Text style={{ color: colors.primary, fontSize: tokens.fontSize.xs, marginLeft: 3 }}>
                    {assignment.photoUri ? 'Đổi ảnh' : 'Thêm ảnh'}
                  </Text>
                </TouchableOpacity>
              </View>

              {photoError ? (
                <Text style={{ color: colors.dangerText, fontSize: tokens.fontSize.xs, marginTop: 4 }}>
                  {photoError}
                </Text>
              ) : null}

              {assignment.photoUri ? (
                <View
                  style={[
                    styles.photoPreviewWrapper,
                    {
                      backgroundColor: colors.surfaceSubtle,
                      borderRadius: tokens.radii.md,
                      marginTop: tokens.spacing.md,
                    },
                  ]}
                >
                  <Image
                    source={{ uri: assignment.photoUri }}
                    style={styles.photoImage}
                    resizeMode="cover"
                    accessibilityLabel="Ảnh ghi chú bài tập đã chụp"
                  />
                </View>
              ) : (
                <View
                  style={[
                    styles.emptyPhotoBox,
                    {
                      backgroundColor: colors.surfaceSubtle,
                      borderRadius: tokens.radii.md,
                      padding: tokens.spacing.lg,
                      marginTop: tokens.spacing.sm,
                    },
                  ]}
                >
                  <Ionicons name="image-outline" size={32} color={colors.textMuted} />
                  <Text style={{ color: colors.textMuted, fontSize: tokens.fontSize.xs, marginTop: 4 }}>
                    Chưa đính kèm ảnh chụp bảng viết hoặc sổ ghi chép
                  </Text>
                </View>
              )}
            </View>

            {/* Action Buttons: Toggle Status & Delete */}
            <View style={{ marginTop: tokens.spacing.xl, gap: 10 }}>
              <Button
                label={
                  isCompleted
                    ? 'Chuyển về Đang làm'
                    : 'Đánh dấu Đã hoàn thành (Optimistic Update)'
                }
                onPress={handleToggleStatus}
                variant={isCompleted ? 'secondary' : 'primary'}
                size="lg"
                icon={
                  <Ionicons
                    name={isCompleted ? 'reload-outline' : 'checkmark-circle-outline'}
                    size={22}
                    color={isCompleted ? colors.textPrimary : colors.textInverse}
                  />
                }
              />

              <Button
                label="Xóa bài tập"
                onPress={handleDelete}
                variant="danger"
                size="md"
                loading={deleteMutation.isPending}
                icon={<Ionicons name="trash-outline" size={18} color={colors.textInverse} />}
              />
            </View>
          </ScrollView>
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
  card: {
    borderWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {},
  courseName: {},
  sectionHeading: {},
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  photoPreviewWrapper: {
    height: 220,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  emptyPhotoBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
