import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
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
import { createCourseApi } from '../../../src/services/mockApi';
import { appQueryClient, QUERY_KEYS } from '../../../src/services/queryClient';
import { Course } from '../../../src/types';

export default function NewCourseModal() {
  const { colors, tokens } = useAppTheme();

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [colour, setColour] = useState<Course['colour']>('emerald');
  const [credits, setCredits] = useState('3');
  const [instructor, setInstructor] = useState('');
  const [room, setRoom] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: createCourseApi,
    onSuccess: () => {
      appQueryClient.invalidateQueries({ queryKey: QUERY_KEYS.COURSES });
      Alert.alert('Thành công', 'Đã thêm môn học mới vào hệ thống.');
      router.back();
    },
    onError: (err: any) => {
      setFormError(err?.message || 'Không thể tạo môn học');
    },
  });

  const availableColors: Course['colour'][] = [
    'emerald',
    'blue',
    'amber',
    'purple',
    'rose',
    'indigo',
    'cyan',
  ];

  const handleSubmit = () => {
    setFormError(null);
    if (!code.trim()) {
      setFormError('Vui lòng nhập mã môn học (ví dụ: TH7011107)');
      return;
    }
    if (!name.trim()) {
      setFormError('Vui lòng nhập tên môn học');
      return;
    }

    createMutation.mutate({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      colour,
      credits: parseInt(credits, 10) || 3,
      instructor: instructor.trim() || undefined,
      room: room.trim() || undefined,
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
          Thông tin môn học mới
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

        <Input
          label="Mã môn học *"
          placeholder="Ví dụ: TH7011107"
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
        />

        <Input
          label="Tên môn học *"
          placeholder="Ví dụ: Phát triển Ứng dụng Di động nâng cao"
          value={name}
          onChangeText={setName}
        />

        {/* Color Palette Selector */}
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
          Màu đại diện môn học *
        </Text>
        <View style={styles.colorPaletteRow}>
          {availableColors.map((cKey) => {
            const active = colour === cKey;
            const cTokens = getCourseColorTokens(colors, cKey);
            return (
              <TouchableOpacity
                key={cKey}
                accessibilityRole="button"
                accessibilityLabel={`Chọn màu ${cKey}`}
                onPress={() => setColour(cKey)}
                style={[
                  styles.colorCircle,
                  {
                    backgroundColor: cTokens.main,
                    borderColor: active ? colors.textPrimary : 'transparent',
                    borderWidth: active ? 3 : 0,
                  },
                ]}
              >
                {active ? <Ionicons name="checkmark" size={18} color={colors.textInverse} /> : null}
              </TouchableOpacity>
            );
          })}
        </View>

        <Input
          label="Số tín chỉ"
          placeholder="3"
          value={credits}
          onChangeText={setCredits}
          keyboardType="numeric"
          containerStyle={{ marginTop: tokens.spacing.md }}
        />

        <Input
          label="Giảng viên phụ trách"
          placeholder="Ví dụ: ThS. Nguyễn Xuân Vinh"
          value={instructor}
          onChangeText={setInstructor}
        />

        <Input
          label="Phòng học"
          placeholder="Ví dụ: Lab 302 - Nhà B"
          value={room}
          onChangeText={setRoom}
        />

        <View style={{ marginTop: tokens.spacing.xl, gap: 10 }}>
          <Button
            label="Lưu môn học"
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
  colorPaletteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
