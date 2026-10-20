import React from 'react';
import { StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { getCourseColorTokens, useAppTheme } from '../../constants/theme';
import { AssignmentStatus, Priority } from '../../types';

interface StatusBadgeProps {
  status: AssignmentStatus;
  style?: ViewStyle;
}

export function StatusBadge({ status, style }: StatusBadgeProps) {
  const { colors, tokens } = useAppTheme();

  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return {
          label: 'Đã hoàn thành',
          bg: colors.successSubtle,
          text: colors.successText,
        };
      case 'in_progress':
        return {
          label: 'Đang làm',
          bg: colors.warningSubtle,
          text: colors.warningText,
        };
      case 'pending':
      default:
        return {
          label: 'Chưa làm',
          bg: colors.infoSubtle,
          text: colors.infoText,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bg,
          borderRadius: tokens.radii.sm,
          paddingHorizontal: tokens.spacing.sm,
          paddingVertical: tokens.spacing.xs,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: config.text,
            fontSize: tokens.fontSize.xs,
            fontWeight: tokens.fontWeight.semibold,
          },
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
}

interface CourseBadgeProps {
  courseCode: string;
  colourKey?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function CourseBadge({
  courseCode,
  colourKey,
  style,
  textStyle,
}: CourseBadgeProps) {
  const { colors, tokens } = useAppTheme();
  const tokenColors = getCourseColorTokens(colors, colourKey);

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: tokenColors.subtle,
          borderRadius: tokens.radii.sm,
          paddingHorizontal: tokens.spacing.sm,
          paddingVertical: tokens.spacing.xs,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: tokenColors.main,
            fontSize: tokens.fontSize.xs,
            fontWeight: tokens.fontWeight.bold,
          },
          textStyle,
        ]}
      >
        {courseCode}
      </Text>
    </View>
  );
}

interface PriorityBadgeProps {
  priority?: Priority;
  style?: ViewStyle;
}

export function PriorityBadge({ priority = 'medium', style }: PriorityBadgeProps) {
  const { colors, tokens } = useAppTheme();

  const getConfig = () => {
    switch (priority) {
      case 'high':
        return { label: 'Ưu tiên cao', bg: colors.dangerSubtle, text: colors.dangerText };
      case 'low':
        return { label: 'Thấp', bg: colors.surfaceSubtle, text: colors.textMuted };
      case 'medium':
      default:
        return { label: 'Bình thường', bg: colors.infoSubtle, text: colors.infoText };
    }
  };

  const config = getConfig();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bg,
          borderRadius: tokens.radii.sm,
          paddingHorizontal: tokens.spacing.sm,
          paddingVertical: 2,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: config.text,
            fontSize: 10,
            fontWeight: tokens.fontWeight.semibold,
          },
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    letterSpacing: 0.3,
  },
});
