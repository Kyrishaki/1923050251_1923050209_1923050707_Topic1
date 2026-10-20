import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../src/components/common/Button';
import { useAppTheme } from '../src/constants/theme';

export default function NotFoundScreen() {
  const { colors, tokens } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.iconCircle, { backgroundColor: colors.surfaceSubtle }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.warning} />
      </View>

      <Text
        style={[
          styles.title,
          {
            color: colors.textPrimary,
            fontSize: tokens.fontSize.xl,
            fontWeight: tokens.fontWeight.bold,
            marginTop: tokens.spacing.base,
          },
        ]}
      >
        404 - Không tìm thấy trang
      </Text>

      <Text
        style={[
          styles.message,
          {
            color: colors.textMuted,
            fontSize: tokens.fontSize.base,
            marginTop: tokens.spacing.xs,
            marginBottom: tokens.spacing.xl,
          },
        ]}
      >
        Đường dẫn bạn yêu cầu không tồn tại hoặc đã được di chuyển.
      </Text>

      <Button
        label="Quay lại Trang chủ"
        onPress={() => router.replace('/(app)/(tabs)')}
        variant="primary"
        icon={<Ionicons name="home-outline" size={18} color={colors.textInverse} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {},
  message: {
    textAlign: 'center',
  },
});
