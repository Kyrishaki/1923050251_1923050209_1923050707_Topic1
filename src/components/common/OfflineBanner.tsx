import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppTheme } from '../../constants/theme';
import { syncOfflineQueueApi } from '../../services/mockApi';
import { appQueryClient, QUERY_KEYS } from '../../services/queryClient';
import { selectIsSimulatedOffline, selectPendingSyncCount } from '../../store/selectors';
import { useAppStore } from '../../store/useAppStore';
import { formatDateTime } from '../../utils/dateUtils';

interface OfflineBannerProps {
  lastSyncTime?: string | null;
}

export function OfflineBanner({ lastSyncTime }: OfflineBannerProps) {
  const { colors, tokens } = useAppTheme();
  const isOffline = useAppStore(selectIsSimulatedOffline);
  const pendingCount = useAppStore(selectPendingSyncCount);
  const refreshPendingCount = useAppStore((s) => s.refreshPendingSyncCount);

  if (!isOffline && pendingCount === 0) {
    return null;
  }

  const handleManualSync = async () => {
    if (isOffline) {
      useAppStore.getState().toggleSimulatedOffline();
    }
    const result = await syncOfflineQueueApi();
    await refreshPendingCount();
    appQueryClient.invalidateQueries({ queryKey: QUERY_KEYS.ASSIGNMENTS });
    appQueryClient.invalidateQueries({ queryKey: QUERY_KEYS.COURSES });
  };

  const formattedTime = lastSyncTime ? formatDateTime(lastSyncTime) : 'Vừa mới';

  return (
    <View
      accessibilityRole="alert"
      style={[
        styles.banner,
        {
          backgroundColor: isOffline ? colors.warningSubtle : colors.infoSubtle,
          borderColor: isOffline ? colors.warning : colors.info,
          paddingHorizontal: tokens.spacing.base,
          paddingVertical: tokens.spacing.sm,
        },
      ]}
    >
      <Ionicons
        name={isOffline ? 'cloud-offline-outline' : 'cloud-upload-outline'}
        size={22}
        color={isOffline ? colors.warningText : colors.infoText}
        style={{ marginRight: tokens.spacing.sm }}
      />
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.title,
            {
              color: isOffline ? colors.warningText : colors.infoText,
              fontSize: tokens.fontSize.xs,
              fontWeight: tokens.fontWeight.bold,
            },
          ]}
        >
          {isOffline ? 'CHẾ ĐỘ NGOẠI TUYẾN (OFFLINE)' : 'DỮ LIỆU ĐANG CHỜ ĐỒNG BỘ'}
        </Text>
        <Text
          style={[
            styles.subtitle,
            {
              color: isOffline ? colors.warningText : colors.infoText,
              fontSize: tokens.fontSize.xs,
            },
          ]}
        >
          {isOffline
            ? `Hiển thị bản lưu gần nhất: ${formattedTime}`
            : `Có ${pendingCount} thao tác offline chưa gửi lên server`}
        </Text>
      </View>

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Đồng bộ ngay"
        onPress={handleManualSync}
        style={[
          styles.syncButton,
          {
            backgroundColor: isOffline ? colors.warning : colors.info,
            borderRadius: tokens.radii.sm,
            minHeight: 36,
            minWidth: 44,
            paddingHorizontal: tokens.spacing.sm,
          },
        ]}
      >
        <Text
          style={[
            styles.syncText,
            {
              color: colors.textInverse,
              fontSize: tokens.fontSize.xs,
              fontWeight: tokens.fontWeight.semibold,
            },
          ]}
        >
          {isOffline ? 'Bật mạng' : 'Đồng bộ'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    letterSpacing: 0.5,
  },
  subtitle: {
    marginTop: 1,
  },
  syncButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncText: {},
});
