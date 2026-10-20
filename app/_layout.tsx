import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../src/constants/theme';
import { appQueryClient } from '../src/services/queryClient';
import { selectIsRestoring } from '../src/store/selectors';
import { useSessionStore } from '../src/store/useSessionStore';

export default function RootLayout() {
  const { colors, isDark } = useAppTheme();
  const restoreSession = useSessionStore((s) => s.restoreSession);
  const isRestoring = useSessionStore(selectIsRestoring);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  if (isRestoring) {
    return (
      <View style={[styles.splash, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.splashText, { color: colors.textSecondary }]}>
          Đang khởi tạo Study Planner...
        </Text>
      </View>
    );
  }

  return (
    <QueryClientProvider client={appQueryClient}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ title: 'Không tìm thấy trang' }} />
      </Stack>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashText: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: '500',
  },
});
