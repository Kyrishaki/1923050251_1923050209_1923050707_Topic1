import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { getCourseColorTokens, useAppTheme } from '../../constants/theme';
import { CourseProgressStats } from '../../types';
import { CourseBadge } from '../common/Badge';

interface CourseProgressCardProps {
  stats: CourseProgressStats;
  style?: ViewStyle;
}

export function CourseProgressCard({ stats, style }: CourseProgressCardProps) {
  const { colors, tokens } = useAppTheme();
  const courseTokens = getCourseColorTokens(colors, stats.courseColour);

  const handlePress = () => {
    router.push({
      pathname: '/(app)/courses/[id]',
      params: { id: stats.courseId },
    });
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`Môn học ${stats.courseName}, tiến độ: ${stats.completionRate}%`}
      activeOpacity={0.7}
      onPress={handlePress}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: tokens.radii.lg,
          padding: tokens.spacing.base,
          marginBottom: tokens.spacing.md,
        },
        style,
      ]}
    >
      {/* Top Header */}
      <View style={styles.topRow}>
        <CourseBadge courseCode={stats.courseCode} colourKey={stats.courseColour} />
        <View
          style={[
            styles.percentageBadge,
            {
              backgroundColor: stats.completionRate === 100 ? colors.successSubtle : courseTokens.subtle,
              borderRadius: tokens.radii.sm,
              paddingHorizontal: tokens.spacing.sm,
              paddingVertical: 2,
            },
          ]}
        >
          <Text
            style={[
              styles.percentageText,
              {
                color: stats.completionRate === 100 ? colors.successText : courseTokens.main,
                fontSize: tokens.fontSize.xs,
                fontWeight: tokens.fontWeight.bold,
              },
            ]}
          >
            {stats.completionRate}%
          </Text>
        </View>
      </View>

      {/* Course Name */}
      <Text
        numberOfLines={1}
        style={[
          styles.courseName,
          {
            color: colors.textPrimary,
            fontSize: tokens.fontSize.base,
            fontWeight: tokens.fontWeight.bold,
            marginTop: tokens.spacing.sm,
          },
        ]}
      >
        {stats.courseName}
      </Text>

      {/* Dynamic Progress Bar */}
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
              backgroundColor: stats.completionRate === 100 ? colors.success : courseTokens.main,
              borderRadius: tokens.radii.full,
              width: `${Math.max(stats.completionRate, 4)}%`,
            },
          ]}
        />
      </View>

      {/* Progress Breakdown: Completed vs Outstanding (Computed dynamically) */}
      <View style={[styles.statsRow, { marginTop: tokens.spacing.sm }]}>
        <Text style={[styles.statItem, { color: colors.successText, fontSize: tokens.fontSize.xs }]}>
          ✓ Đã xong: {stats.completed}
        </Text>
        <Text style={[styles.statItem, { color: colors.warningText, fontSize: tokens.fontSize.xs }]}>
          ⏳ Còn lại: {stats.outstanding}
        </Text>
        <Text style={[styles.statItem, { color: colors.textMuted, fontSize: tokens.fontSize.xs }]}>
          Tổng: {stats.total} bài
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  percentageBadge: {},
  percentageText: {},
  courseName: {},
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
  statItem: {
    fontWeight: '600',
  },
});
