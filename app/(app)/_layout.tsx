import { Redirect, Stack } from 'expo-router';
import React from 'react';
import { useAppTheme } from '../../src/constants/theme';
import { selectIsAuthenticated } from '../../src/store/selectors';
import { useSessionStore } from '../../src/store/useSessionStore';

export default function AppLayout() {
  const { colors } = useAppTheme();
  const isAuthenticated = useSessionStore(selectIsAuthenticated);

  // Protected route barrier
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="assignments/[id]"
        options={{
          title: 'Chi tiết bài tập',
          headerBackTitle: 'Quay lại',
        }}
      />
      <Stack.Screen
        name="courses/[id]"
        options={{
          title: 'Tiến độ môn học',
          headerBackTitle: 'Quay lại',
        }}
      />
      <Stack.Screen
        name="modal/new-assignment"
        options={{
          presentation: 'modal',
          title: 'Tạo bài tập mới',
        }}
      />
      <Stack.Screen
        name="modal/new-course"
        options={{
          presentation: 'modal',
          title: 'Thêm môn học mới',
        }}
      />
    </Stack>
  );
}
