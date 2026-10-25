import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '../../../src/components/common/Button';
import { Input } from '../../../src/components/common/Input';
import { getCourseColorTokens, useAppTheme } from '../../../src/constants/theme';
import { createAssignmentApi, fetchCoursesApi } from '../../../src/services/mockApi';
import { scheduleAssignmentReminder } from '../../../src/services/notificationService';
import { appQueryClient, QUERY_KEYS } from '../../../src/services/queryClient';
import { Priority } from '../../../src/types';
import { capturePhotoFromCamera, pickImageFromGallery } from '../../../src/utils/photoUtils';

export default function NewAssignmentModal() {
  const { defaultCourseId } = useLocalSearchParams<{ defaultCourseId?: string }>();
  const { colors, tokens } = useAppTheme();

  const coursesQuery = useQuery({
    queryKey: QUERY_KEYS.COURSES,
    queryFn: fetchCoursesApi,
  });

  const courses = coursesQuery.data?.data || [];

  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState(defaultCourseId || courses[0]?.id || '');
  const [priority, setPriority] = useState<Priority>('medium');
  const [notes, setNotes] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  // Due Date offset selection
  const [dueDaysOffset, setDueDaysOffset] = useState<number>(1); // default 1 day (tomorrow)
  const [dueHours, setDueHours] = useState<number>(23);
  const [dueMinutes, setDueMinutes] = useState<number>(59);

  const [formError, setFormError] = useState<string | null>(null);

  // Mutation
  const createMutation = useMutation({
    mutationFn: createAssignmentApi,
    onSuccess: (newAssignment) => {
      // Schedule local notification reminder
      scheduleAssignmentReminder(newAssignment);

      appQueryClient.invalidateQueries({ queryKey: QUERY_KEYS.ASSIGNMENTS });
      Alert.alert('Thành công', 'Đã thêm bài tập mới vào kế hoạch học tập.');
      router.back();
    },
    onError: (err: any) => {
      setFormError(err?.message || 'Không thể tạo bài tập');
    },
  });

  const handlePickPhoto = async () => {
    setPhotoError(null);
    const res = await pickImageFromGallery();
    if (res.error) {
      setPhotoError(res.error);
      return;
    }
    if (res.uri) {
      setPhotoUri(res.uri);
    }
  };

  const handleCapturePhoto = async () => {
    setPhotoError(null);
    const res = await capturePhotoFromCamera();
    if (res.error) {
      setPhotoError(res.error);
      return;
    }
    if (res.uri) {
      setPhotoUri(res.uri);
    }
  };

  const handleSubmit = () => {
    setFormError(null);
    if (!title.trim()) {
      setFormError('Vui lòng nhập tiêu đề bài tập');
      return;
    }
    if (!courseId) {
      setFormError('Vui lòng chọn môn học');
      return;
    }

    // Calculate target due date
    const target = new Date();
    target.setDate(target.getDate() + dueDaysOffset);
    target.setHours(dueHours, dueMinutes, 0, 0);

    createMutation.mutate({
      title: title.trim(),
      courseId,
      dueAt: target.toISOString(),
      status: 'pending',
      priority,
      notes: notes.trim() || undefined,
      photoUri: photoUri || undefined,
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { padding: tokens.spacing.base }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text
          style={[
            styles.modalTitle,
            {
              color: colors.textPrimary,
              fontSize: tokens.fontSize.lg,
              fontWeight: tokens.fontWeight.bold,
              marginBottom: tokens.spacing.md,
            },
          ]}
        >
          Thông tin bài tập cần làm
        </Text>

        {formError ? (
          <View
            accessibilityRole="alert"
            style={[
              styles.errorBanner,
              {
                backgroundColor: colors.dangerSubtle,
                borderColor: colors.danger,
                borderRadius: tokens.radii.md,
                padding: tokens.spacing.md,
                marginBottom: tokens.spacing.md,
              },
            ]}
          >
            <Ionicons name="alert-circle" size={18} color={colors.danger} />
            <Text
              style={{
                color: colors.dangerText,
                fontSize: tokens.fontSize.sm,
                marginLeft: tokens.spacing.xs,
                fontWeight: '500',
              }}
            >
              {formError}
            </Text>
          </View>
        ) : null}

        {/* Title Input */}
        <Input
          label="Tiêu đề bài tập *"
          placeholder="Ví dụ: Báo cáo đồ án cuối kỳ..."
          value={title}
          onChangeText={setTitle}
        />

        {/* Course Picker */}
        <Text
          style={[
            styles.fieldLabel,
            {
              color: colors.textSecondary,
              fontSize: tokens.fontSize.sm,
              fontWeight: tokens.fontWeight.medium,
              marginBottom: tokens.spacing.xs,
            },
          ]}
        >
          Môn học *
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ marginBottom: tokens.spacing.base }}
        >
          {courses.map((c) => {
            const active = courseId === c.id;
            const cTokens = getCourseColorTokens(colors, c.colour);
            return (
              <TouchableOpacity
                key={c.id}
                accessibilityRole="button"
                accessibilityLabel={`Chọn môn ${c.name}`}
                onPress={() => setCourseId(c.id)}
                style={[
                  styles.courseChip,
                  {
                    backgroundColor: active ? cTokens.main : colors.surface,
                    borderColor: active ? cTokens.main : colors.border,
                    borderRadius: tokens.radii.md,
                    paddingHorizontal: tokens.spacing.md,
                    paddingVertical: 8,
                    marginRight: tokens.spacing.sm,
                  },
                ]}
              >
                <Text
                  style={{
                    color: active ? colors.textInverse : colors.textPrimary,
                    fontSize: tokens.fontSize.xs,
                    fontWeight: '700',
                  }}
                >
                  {c.code}
                </Text>
                <Text
                  numberOfLines={1}
                  style={{
                    color: active ? colors.textInverse : colors.textSecondary,
                    fontSize: 10,
                    maxWidth: 120,
                  }}
                >
                  {c.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Deadline Offset Selector */}
        <Text
          style={[
            styles.fieldLabel,
            {
              color: colors.textSecondary,
              fontSize: tokens.fontSize.sm,
              fontWeight: tokens.fontWeight.medium,
              marginBottom: tokens.spacing.xs,
            },
          ]}
        >
          Thời hạn nộp (Deadline) *
        </Text>
        <View style={styles.dueOffsetRow}>
          {[
            { offset: 0, label: 'Hôm nay (23:59)' },
            { offset: 1, label: 'Ngày mai (23:59)' },
            { offset: 3, label: '3 ngày nữa' },
            { offset: 7, label: '1 tuần nữa' },
          ].map((item) => {
            const active = dueDaysOffset === item.offset;
            return (
              <TouchableOpacity
                key={item.offset}
                accessibilityRole="button"
                accessibilityLabel={`Chọn hạn ${item.label}`}
                onPress={() => setDueDaysOffset(item.offset)}
                style={[
                  styles.dueChip,
                  {
                    backgroundColor: active ? colors.primary : colors.surface,
                    borderColor: active ? colors.primary : colors.border,
                    borderRadius: tokens.radii.md,
                    paddingHorizontal: tokens.spacing.md,
                    paddingVertical: 8,
                    marginRight: tokens.spacing.xs,
                    marginBottom: tokens.spacing.xs,
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
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Priority Selector */}
        <Text
          style={[
            styles.fieldLabel,
            {
              color: colors.textSecondary,
              fontSize: tokens.fontSize.sm,
              fontWeight: tokens.fontWeight.medium,
              marginTop: tokens.spacing.sm,
              marginBottom: tokens.spacing.xs,
            },
          ]}
        >
          Mức độ ưu tiên
        </Text>
        <View style={styles.priorityRow}>
          {[
            { key: 'high', label: 'Ưu tiên cao', color: colors.danger },
            { key: 'medium', label: 'Bình thường', color: colors.warning },
            { key: 'low', label: 'Thấp', color: colors.info },
          ].map((p) => {
            const active = priority === p.key;
            return (
              <TouchableOpacity
                key={p.key}
                accessibilityRole="button"
                accessibilityLabel={`Ưu tiên ${p.label}`}
                onPress={() => setPriority(p.key as Priority)}
                style={[
                  styles.priorityChip,
                  {
                    backgroundColor: active ? p.color : colors.surface,
                    borderColor: active ? p.color : colors.border,
                    borderRadius: tokens.radii.md,
                    paddingHorizontal: tokens.spacing.md,
                    paddingVertical: 8,
                    marginRight: tokens.spacing.xs,
                    flex: 1,
                    alignItems: 'center',
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
                  {p.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Notes Input */}
        <Input
          label="Ghi chú bài làm / Hướng dẫn của giảng viên"
          placeholder="Ví dụ: Đọc chương 4, nén mã nguồn không kèm node_modules..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          containerStyle={{ marginTop: tokens.spacing.sm }}
          inputStyle={{ minHeight: 70, textAlignVertical: 'top' }}
        />

        {/* Photo Attachment Section */}
        <Text
          style={[
            styles.fieldLabel,
            {
              color: colors.textSecondary,
              fontSize: tokens.fontSize.sm,
              fontWeight: tokens.fontWeight.medium,
              marginBottom: tokens.spacing.xs,
            },
          ]}
        >
          Đính kèm ảnh bảng viết / Sổ tay (Tùy chọn)
        </Text>

        {photoError ? (
          <Text style={{ color: colors.dangerText, fontSize: tokens.fontSize.xs, marginBottom: 4 }}>
            {photoError}
          </Text>
        ) : null}

        <View style={styles.photoActionsRow}>
          <Button
            label="Chụp ảnh"
            onPress={handleCapturePhoto}
            variant="secondary"
            size="sm"
            icon={<Ionicons name="camera-outline" size={18} color={colors.textPrimary} />}
            style={{ flex: 1, marginRight: tokens.spacing.xs }}
          />
          <Button
            label="Chọn từ thư viện"
            onPress={handlePickPhoto}
            variant="secondary"
            size="sm"
            icon={<Ionicons name="images-outline" size={18} color={colors.textPrimary} />}
            style={{ flex: 1 }}
          />
        </View>

        {photoUri ? (
          <View
            style={[
              styles.previewContainer,
              {
                backgroundColor: colors.surfaceSubtle,
                borderRadius: tokens.radii.md,
                marginTop: tokens.spacing.sm,
              },
            ]}
          >
            <Image
              source={{ uri: photoUri }}
              style={styles.previewImage}
              resizeMode="cover"
            />
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Xóa ảnh đính kèm"
              onPress={() => setPhotoUri(null)}
              style={[styles.removePhotoBtn, { backgroundColor: colors.danger }]}
            >
              <Ionicons name="close" size={16} color={colors.textInverse} />
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Submit & Cancel Buttons */}
        <View style={{ marginTop: tokens.spacing.xl, gap: 10 }}>
          <Button
            label="Lưu bài tập"
            onPress={handleSubmit}
            loading={createMutation.isPending}
            variant="primary"
            size="lg"
            icon={<Ionicons name="checkmark-circle-outline" size={20} color={colors.textInverse} />}
          />
          <Button label="Hủy" onPress={() => router.back()} variant="ghost" size="md" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 40,
  },
  modalTitle: {},
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  fieldLabel: {},
  courseChip: {
    borderWidth: 1,
    minHeight: 46,
    justifyContent: 'center',
  },
  dueOffsetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dueChip: {
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center',
  },
  priorityRow: {
    flexDirection: 'row',
  },
  priorityChip: {
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center',
  },
  photoActionsRow: {
    flexDirection: 'row',
  },
  previewContainer: {
    position: 'relative',
    height: 180,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removePhotoBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
