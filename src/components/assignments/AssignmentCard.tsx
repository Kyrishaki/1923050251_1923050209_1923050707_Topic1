import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { getCourseColorTokens, useAppTheme } from '../../constants/theme';
import { Assignment, Course } from '../../types';
import { getDueRelativeLabel, isOverdue } from '../../utils/dateUtils';
import { CourseBadge, PriorityBadge, StatusBadge } from '../common/Badge';

export interface AssignmentCardProps {
  assignment: Assignment;
  course?: Course;
  onToggleComplete?: (assignment: Assignment) => void;
  style?: ViewStyle;
}

export function AssignmentCard({
  assignment,
  course,
  onToggleComplete,
  style,
}: AssignmentCardProps) {
  const { colors, tokens } = useAppTheme();
  const isCompleted = assignment.status === 'completed';
  const overdue = !isCompleted && isOverdue(assignment.dueAt);
  const relativeDate = getDueRelativeLabel(assignment.dueAt);
  const courseTokens = getCourseColorTokens(colors, course?.colour);

  const handlePress = () => {
    router.push({
      pathname: '/(app)/assignments/[id]',
      params: { id: assignment.id },
    });
  };

  const handleToggle = () => {
    if (onToggleComplete) {
      onToggleComplete(assignment);
    }
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`Bài tập ${assignment.title}, môn ${course?.name || ''}, hạn: ${relativeDate}`}
      activeOpacity={0.7}
      onPress={handlePress}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: isCompleted
            ? colors.border
            : overdue
            ? colors.danger
            : colors.border,
          borderRadius: tokens.radii.lg,
          padding: tokens.spacing.base,
          marginBottom: tokens.spacing.md,
        },
        style,
      ]}
    >
      {/* Course indicator bar */}
      <View
        style={[
          styles.accentBar,
          {
            backgroundColor: courseTokens.main,
            borderTopLeftRadius: tokens.radii.lg,
            borderBottomLeftRadius: tokens.radii.lg,
          },
        ]}
      />

      <View style={styles.content}>
        {/* Top row: Badges */}
        <View style={styles.topRow}>
          <View style={styles.badgeGroup}>
            <CourseBadge
              courseCode={course?.code || 'MÔN HỌC'}
              colourKey={course?.colour}
            />
            {assignment.priority ? (
              <PriorityBadge
                priority={assignment.priority}
                style={{ marginLeft: tokens.spacing.xs }}
              />
            ) : null}
          </View>

          <StatusBadge status={assignment.status} />
        </View>

        {/* Title */}
        <Text
          numberOfLines={2}
          style={[
            styles.title,
            {
              color: isCompleted ? colors.textMuted : colors.textPrimary,
              fontSize: tokens.fontSize.base,
              fontWeight: tokens.fontWeight.bold,
              textDecorationLine: isCompleted ? 'line-through' : 'none',
              marginTop: tokens.spacing.sm,
            },
          ]}
        >
          {assignment.title}
        </Text>

        {/* Course name */}
        <Text
          numberOfLines={1}
          style={[
            styles.courseName,
            {
              color: colors.textSecondary,
              fontSize: tokens.fontSize.xs,
              marginTop: 2,
            },
          ]}
        >
          {course?.name || 'Môn học chưa xác định'}
        </Text>

        {/* Bottom meta row: Due date, photo icon, and quick complete button */}
        <View style={[styles.bottomRow, { marginTop: tokens.spacing.md }]}>
          <View style={styles.metaGroup}>
            <Ionicons
              name={overdue ? 'alert-circle' : 'time-outline'}
              size={15}
              color={overdue ? colors.danger : colors.textMuted}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.dateText,
                {
                  color: overdue ? colors.dangerText : colors.textMuted,
                  fontSize: tokens.fontSize.xs,
                  fontWeight: overdue ? tokens.fontWeight.semibold : tokens.fontWeight.normal,
                },
              ]}
            >
              {relativeDate}
            </Text>

            {assignment.photoUri ? (
              <View style={[styles.photoTag, { backgroundColor: colors.surfaceSubtle }]}>
                <Ionicons name="image-outline" size={13} color={colors.primary} />
                <Text style={[styles.photoText, { color: colors.primary }]}>Ảnh</Text>
              </View>
            ) : null}
          </View>

          {/* Quick toggle completion checkbox */}
          <TouchableOpacity
            accessibilityRole="checkbox"
            accessibilityLabel={isCompleted ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu hoàn thành'}
            accessibilityState={{ checked: isCompleted }}
            onPress={handleToggle}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={[
              styles.checkbox,
              {
                borderColor: isCompleted ? colors.success : colors.borderStrong,
                backgroundColor: isCompleted ? colors.success : 'transparent',
                borderRadius: tokens.radii.sm,
              },
            ]}
          >
            {isCompleted ? (
              <Ionicons name="checkmark" size={16} color={colors.textInverse} />
            ) : null}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },
  content: {
    paddingLeft: 6,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  title: {
    lineHeight: 22,
  },
  courseName: {
    fontStyle: 'italic',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateText: {
    marginRight: 8,
  },
  photoTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  photoText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 3,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
