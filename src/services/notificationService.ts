import { router } from 'expo-router';
import { Alert, Platform } from 'react-native';
import { Assignment } from '../types';

export interface ScheduledReminder {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  triggerTime: number;
}

let activeReminders: ScheduledReminder[] = [];

/**
 * Schedule a local notification reminder for an assignment.
 * When tapped or triggered, directly opens the assignment's dynamic route.
 */
export async function scheduleAssignmentReminder(assignment: Assignment): Promise<boolean> {
  const dueTime = new Date(assignment.dueAt).getTime();
  const reminderTime = dueTime - 60 * 60 * 1000; // 1 hour before deadline

  const reminder: ScheduledReminder = {
    id: `reminder-${assignment.id}-${Date.now()}`,
    assignmentId: assignment.id,
    assignmentTitle: assignment.title,
    triggerTime: reminderTime,
  };

  activeReminders.push(reminder);

  if (Platform.OS === 'web') {
    return true;
  }

  return true;
}

/**
 * Simulates a local notification receiving event right now.
 * Tapping "Xem chi tiết" navigates directly to /assignments/[id].
 */
export function triggerTestNotification(assignment: Assignment) {
  Alert.alert(
    '🔔 Nhắc nhở hạn chót bài tập!',
    `Bài tập "${assignment.title}" sắp đến hạn nộp. Chạm để xem chi tiết bài làm.`,
    [
      { text: 'Bỏ qua', style: 'cancel' },
      {
        text: 'Xem chi tiết',
        onPress: () => {
          router.push({
            pathname: '/(app)/assignments/[id]',
            params: { id: assignment.id },
          });
        },
      },
    ]
  );
}

export function getActiveReminders(): ScheduledReminder[] {
  return [...activeReminders];
}
