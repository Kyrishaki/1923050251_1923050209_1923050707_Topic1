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
import { getDueRelativeLabel, isDueWithin48Hours } from '../../utils/dateUtils';

interface Due48HoursWidgetProps {
  assignments: Assignment[];
  courses: Course[];
  style?: ViewStyle;
}

export function Due48HoursWidget({ assignments, courses, style }: Due48HoursWidgetProps) {
  const { colors, tokens } = useAppTheme();

  // Filter urgent assignments due in next 48 hours
  const urgentAssignments = assignments
    .filter((a) => a.status !== 'completed' && isDueWithin48Hours(a.dueAt))
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());

  const count = urgentAssignments.length;

  return (
    <View
      accessibilityRole="summary"
      accessibilityLabel="Widget thông báo hạn chót 48 giờ"
      style={[
        styles.widget,
        {
          backgroundColor: count > 0 ? colors.warningSubtle : colors.surfaceSubtle,
          borderColor: count > 0 ? colors.warning : colors.border,
          borderRadius: tokens.radii.xl,
          padding: tokens.spacing.base,
          marginBottom: tokens.spacing.lg,
        },
        style,
      ]}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: count > 0 ? colors.warning : colors.primary,
              },
            ]}
          >
            <Ionicons
              name={count > 0 ? 'flame' : 'shield-checkmark'}
              size={18}
              color={colors.textInverse}
            />
          </View>
          <View style={{ marginLeft: tokens.spacing.sm }}>
            <Text
              style={[
                styles.widgetTitle,
                {
                  color: colors.textPrimary,
                  fontSize: tokens.fontSize.base,
                  fontWeight: tokens.fontWeight.bold,
                },
              ]}
            >
              Hạn chót 48 giờ tới
            </Text>
            <Text
              style={[
                styles.widgetSubtitle,
                {
                  color: colors.textMuted,
                  fontSize: tokens.fontSize.xs,
                },
              ]}
            >
              {count > 0
                ? `Cần hoàn thành gấp ${count} bài tập`
                : 'Thư thả! Không có bài tập nào sắp hết hạn'}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.countPill,
            {
              backgroundColor: count > 0 ? colors.warning : colors.surface,
              borderRadius: tokens.radii.full,
              paddingHorizontal: tokens.spacing.sm,
              paddingVertical: 2,
            },
          ]}
        >
          <Text
            style={[
              styles.countText,
              {
                color: count > 0 ? colors.textInverse : colors.textSecondary,
                fontSize: tokens.fontSize.xs,
                fontWeight: tokens.fontWeight.bold,
              },
            ]}
          >
            {count}
          </Text>
        </View>
      </View>

      {/* Urgent list items */}
      {count > 0 ? (
        <View style={{ marginTop: tokens.spacing.md }}>
          {urgentAssignments.slice(0, 3).map((item) => {
            const course = courses.find((c) => c.id === item.courseId);
            const courseTokens = getCourseColorTokens(colors, course?.colour);
            const relativeDate = getDueRelativeLabel(item.dueAt);

            return (
              <TouchableOpacity
                key={item.id}
                accessibilityRole="button"
                accessibilityLabel={`Mở bài tập ${item.title}`}
                activeOpacity={0.7}
                onPress={() =>
                  router.push({
                    pathname: '/(app)/assignments/[id]',
                    params: { id: item.id },
                  })
                }
                style={[
                  styles.itemRow,
                  {
                    backgroundColor: colors.surface,
                    borderRadius: tokens.radii.md,
                    padding: tokens.spacing.sm,
                    marginBottom: tokens.spacing.xs,
                    borderLeftColor: courseTokens.main,
                    borderLeftWidth: 4,
                  },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.itemTitle,
                      {
                        color: colors.textPrimary,
                        fontSize: tokens.fontSize.sm,
                        fontWeight: tokens.fontWeight.semibold,
                      },
                    ]}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={[
                      styles.itemDue,
                      {
                        color: colors.dangerText,
                        fontSize: tokens.fontSize.xs,
                        fontWeight: tokens.fontWeight.medium,
                      },
                    ]}
                  >
                    {relativeDate}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.textMuted}
                  style={{ marginLeft: tokens.spacing.sm }}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  widget: {
    borderWidth: 1.5,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  widgetTitle: {},
  widgetSubtitle: {
    marginTop: 1,
  },
  countPill: {
    minWidth: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {},
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemTitle: {},
  itemDue: {
    marginTop: 2,
  },
});
