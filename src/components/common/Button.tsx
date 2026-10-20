import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { useAppTheme } from '../../constants/theme';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  accessibilityHint?: string;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
  accessibilityHint,
}: ButtonProps) {
  const { colors, tokens } = useAppTheme();

  const getBackgroundColor = () => {
    if (disabled) return colors.disabled;
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'secondary':
        return colors.surfaceSubtle;
      case 'danger':
        return colors.danger;
      case 'outline':
      case 'ghost':
        return 'transparent';
      default:
        return colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.disabledText;
    switch (variant) {
      case 'primary':
      case 'danger':
        return colors.textInverse;
      case 'secondary':
        return colors.textPrimary;
      case 'outline':
        return colors.primary;
      case 'ghost':
        return colors.textSecondary;
      default:
        return colors.textInverse;
    }
  };

  const getBorderColor = () => {
    if (variant === 'outline') {
      return disabled ? colors.disabled : colors.primary;
    }
    return 'transparent';
  };

  const getMinHeight = () => {
    switch (size) {
      case 'sm':
        return Math.max(tokens.touchTarget.minHeight, 44);
      case 'lg':
        return 52;
      case 'md':
      default:
        return 46;
    }
  };

  const getPaddingHorizontal = () => {
    switch (size) {
      case 'sm':
        return tokens.spacing.md;
      case 'lg':
        return tokens.spacing.xl;
      case 'md':
      default:
        return tokens.spacing.base;
    }
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading }}
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 1.5 : 0,
          minHeight: getMinHeight(),
          minWidth: tokens.touchTarget.minWidth,
          paddingHorizontal: getPaddingHorizontal(),
          borderRadius: tokens.radii.md,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={getTextColor()}
          accessibilityLabel="Đang tải..."
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              {
                color: getTextColor(),
                fontSize: size === 'sm' ? tokens.fontSize.sm : tokens.fontSize.base,
                fontWeight: tokens.fontWeight.semibold,
                marginLeft: icon ? tokens.spacing.sm : 0,
              },
              textStyle,
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
});
