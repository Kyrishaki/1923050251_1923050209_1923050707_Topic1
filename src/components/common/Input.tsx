import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { useAppTheme } from '../../constants/theme';

export interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  rightElement?: React.ReactNode;
}

export function Input({
  label,
  error,
  containerStyle,
  inputStyle,
  rightElement,
  ...rest
}: InputProps) {
  const { colors, tokens } = useAppTheme();

  return (
    <View style={[styles.container, containerStyle]}>
      <Text
        style={[
          styles.label,
          {
            color: colors.textSecondary,
            fontSize: tokens.fontSize.sm,
            fontWeight: tokens.fontWeight.medium,
            marginBottom: tokens.spacing.xs,
          },
        ]}
      >
        {label}
      </Text>

      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: colors.inputBackground,
            borderColor: error ? colors.danger : colors.inputBorder,
            borderRadius: tokens.radii.md,
            minHeight: tokens.touchTarget.minHeight,
            paddingHorizontal: tokens.spacing.md,
          },
        ]}
      >
        <TextInput
          accessibilityLabel={label}
          accessibilityHint={error || undefined}
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            {
              color: colors.textPrimary,
              fontSize: tokens.fontSize.base,
            },
            inputStyle,
          ]}
          {...rest}
        />
        {rightElement}
      </View>

      {error ? (
        <Text
          accessibilityRole="alert"
          style={[
            styles.errorText,
            {
              color: colors.dangerText,
              fontSize: tokens.fontSize.xs,
              marginTop: tokens.spacing.xs,
            },
          ]}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    letterSpacing: 0.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
  },
  errorText: {
    fontWeight: '500',
  },
});
