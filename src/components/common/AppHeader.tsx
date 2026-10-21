import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppTheme } from '../../constants/theme';
import {
  selectIsSimulatedError,
  selectIsSimulatedOffline,
  selectUser,
} from '../../store/selectors';
import { useAppStore } from '../../store/useAppStore';
import { useSessionStore } from '../../store/useSessionStore';

export function AppHeader() {
  const { colors, tokens } = useAppTheme();
  const user = useSessionStore(selectUser);
  const signOut = useSessionStore((s) => s.signOut);

  const isOffline = useAppStore(selectIsSimulatedOffline);
  const isError = useAppStore(selectIsSimulatedError);
  const toggleOffline = useAppStore((s) => s.toggleSimulatedOffline);
  const toggleError = useAppStore((s) => s.toggleSimulatedError);

  const handleSignOut = () => {
    Alert.alert(
      'Đăng xuất tài khoản',
      'Bạn có chắc chắn muốn đăng xuất? Phiên đăng nhập sẽ bị xóa an toàn khỏi SecureStore.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/sign-in');
          },
        },
      ]
    );
  };

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          paddingHorizontal: tokens.spacing.base,
          paddingVertical: tokens.spacing.md,
        },
      ]}
    >
      {/* User greeting */}
      <View style={styles.userInfo}>
        <View
          style={[
            styles.avatarCircle,
            {
              backgroundColor: colors.primaryLight,
            },
          ]}
        >
          <Text
            style={[
              styles.avatarText,
              {
                color: colors.primaryDark,
                fontSize: tokens.fontSize.sm,
                fontWeight: tokens.fontWeight.bold,
              },
            ]}
          >
            {user?.name ? user.name.charAt(0) : 'T'}
          </Text>
        </View>

        <View style={{ marginLeft: tokens.spacing.sm }}>
          <Text
            style={[
              styles.userName,
              {
                color: colors.textPrimary,
                fontSize: tokens.fontSize.sm,
                fontWeight: tokens.fontWeight.bold,
              },
            ]}
          >
            {user?.name || 'Mai Hoàng Tuấn'}
          </Text>
          <Text
            style={[
              styles.userSub,
              {
                color: colors.textMuted,
                fontSize: tokens.fontSize.xs,
              },
            ]}
          >
            MSSV: {user?.studentId || '1923050209'} • DNTU
          </Text>
        </View>
      </View>

      {/* Action buttons: Offline simulator, Error simulator, Sign out */}
      <View style={styles.actions}>
        {/* Offline simulator toggle button */}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={isOffline ? 'Tắt chế độ Offline' : 'Bật chế độ Offline'}
          onPress={toggleOffline}
          style={[
            styles.iconBtn,
            {
              backgroundColor: isOffline ? colors.warningSubtle : colors.surfaceSubtle,
              borderColor: isOffline ? colors.warning : colors.border,
              marginRight: 6,
            },
          ]}
        >
          <Ionicons
            name={isOffline ? 'cloud-offline' : 'cloud-outline'}
            size={18}
            color={isOffline ? colors.warningText : colors.textSecondary}
          />
        </TouchableOpacity>

        {/* Server Error simulator toggle button */}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={isError ? 'Tắt lỗi Server' : 'Giả lập lỗi Server 500'}
          onPress={toggleError}
          style={[
            styles.iconBtn,
            {
              backgroundColor: isError ? colors.dangerSubtle : colors.surfaceSubtle,
              borderColor: isError ? colors.danger : colors.border,
              marginRight: 6,
            },
          ]}
        >
          <Ionicons
            name={isError ? 'flash' : 'flash-outline'}
            size={18}
            color={isError ? colors.dangerText : colors.textSecondary}
          />
        </TouchableOpacity>

        {/* Logout button */}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Đăng xuất khỏi ứng dụng"
          onPress={handleSignOut}
          style={[
            styles.iconBtn,
            {
              backgroundColor: colors.dangerSubtle,
              borderColor: colors.danger,
            },
          ]}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.dangerText} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {},
  userName: {},
  userSub: {},
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
