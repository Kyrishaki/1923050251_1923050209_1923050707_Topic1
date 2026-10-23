import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { useAppTheme } from '../../constants/theme';
import { Button } from './Button';

export interface StateViewProps {
  isLoading: boolean;
  error?: Error | string | null;
  isEmpty: boolean;
  onRetry?: () => void;
  loadingMessage?: string;
  errorMessage?: string;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function StateView({
  isLoading,
  error,
  isEmpty,
  onRetry,
  loadingMessage = 'Đang tải dữ liệu...',
  errorMessage,
  emptyTitle = 'Chưa có dữ liệu',
  emptyMessage = 'Hiện tại không có mục nào để hiển thị.',
  emptyActionLabel,
  onEmptyAction,
  children,
  style,
}: StateViewProps) {
  const { colors, tokens } = useAppTheme();

  // 1. Loading State
  if (isLoading) {
    return (
      <View
        accessibilityRole="progressbar"
        accessibilityLabel={loadingMessage}
        style={[styles.centeredContainer, { backgroundColor: colors.background }, style]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text
          style={[
            styles.messageText,
            {
              color: colors.textSecondary,
              fontSize: tokens.fontSize.base,
              marginTop: tokens.spacing.md,
            },
          ]}
        >
          {loadingMessage}
        </Text>
      </View>
    );
  }

  // 2. Error State with WORKING Retry
  if (error) {
    const displayError =
      errorMessage || (typeof error === 'string' ? error : error.message) || 'Đã có lỗi xảy ra';

    return (
      <View
        accessibilityRole="alert"
        style={[styles.centeredContainer, { backgroundColor: colors.background }, style]}
      >
        <View
          style={[
            styles.iconWrapper,
            {
              backgroundColor: colors.dangerSubtle,
              marginBottom: tokens.spacing.base,
            },
          ]}
        >
          <Ionicons name="alert-circle-outline" size={38} color={colors.danger} />
        </View>

        <Text
          style={[
            styles.titleText,
            {
              color: colors.textPrimary,
              fontSize: tokens.fontSize.lg,
              fontWeight: tokens.fontWeight.bold,
              marginBottom: tokens.spacing.xs,
            },
          ]}
        >
          Không thể tải dữ liệu
        </Text>

        <Text
          style={[
            styles.messageText,
            {
              color: colors.textMuted,
              fontSize: tokens.fontSize.sm,
              marginBottom: tokens.spacing.xl,
            },
          ]}
        >
          {displayError}
        </Text>

        {onRetry ? (
          <Button
            label="Thử lại ngay"
            onPress={onRetry}
            variant="primary"
            icon={<Ionicons name="refresh-outline" size={18} color={colors.textInverse} />}
          />
        ) : null}
      </View>
    );
  }

  // 3. Empty State
  if (isEmpty) {
    return (
      <View
        style={[styles.centeredContainer, { backgroundColor: colors.background }, style]}
      >
        <View
          style={[
            styles.iconWrapper,
            {
              backgroundColor: colors.surfaceSubtle,
              marginBottom: tokens.spacing.base,
            },
          ]}
        >
          <Ionicons name="file-tray-outline" size={38} color={colors.textMuted} />
        </View>

        <Text
          style={[
            styles.titleText,
            {
              color: colors.textPrimary,
              fontSize: tokens.fontSize.lg,
              fontWeight: tokens.fontWeight.bold,
              marginBottom: tokens.spacing.xs,
            },
          ]}
        >
          {emptyTitle}
        </Text>

        <Text
          style={[
            styles.messageText,
            {
              color: colors.textMuted,
              fontSize: tokens.fontSize.sm,
              marginBottom: emptyActionLabel && onEmptyAction ? tokens.spacing.xl : 0,
            },
          ]}
        >
          {emptyMessage}
        </Text>

        {emptyActionLabel && onEmptyAction ? (
          <Button
            label={emptyActionLabel}
            onPress={onEmptyAction}
            variant="primary"
            icon={<Ionicons name="add-circle-outline" size={18} color={colors.textInverse} />}
          />
        ) : null}
      </View>
    );
  }

  // 4. Content State
  return <>{children}</>;
}

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  iconWrapper: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    textAlign: 'center',
  },
  messageText: {
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
});
