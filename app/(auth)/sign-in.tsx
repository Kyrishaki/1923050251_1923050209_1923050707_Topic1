import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '../../src/components/common/Button';
import { Input } from '../../src/components/common/Input';
import { useAppTheme } from '../../src/constants/theme';
import { DEMO_USERS } from '../../src/data/seedData';
import { useSessionStore } from '../../src/store/useSessionStore';
import { User } from '../../src/types';

export default function SignInScreen() {
  const { colors, tokens } = useAppTheme();
  const signIn = useSessionStore((s) => s.signIn);

  const [email, setEmail] = useState('tuan.mai@student.dntu.edu.vn');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignIn = async (targetUser?: User) => {
    setErrorMessage(null);
    setLoading(true);

    try {
      // Validate
      if (!targetUser && (!email.trim() || !password.trim())) {
        setErrorMessage('Vui lòng nhập đầy đủ Email sinh viên và Mật khẩu');
        setLoading(false);
        return;
      }

      await new Promise((res) => setTimeout(res, 400)); // simulated auth check

      const user =
        targetUser ||
        DEMO_USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase()) || {
          id: `usr-${Date.now()}`,
          name: email.split('@')[0],
          email: email.trim(),
          studentId: '1923050209',
        };

      const token = `sec_jwt_${user.id}_${Date.now()}`;

      // Persist in SecureStore
      await signIn(user, token);

      router.replace('/(app)/(tabs)');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Đăng nhập không thành công. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const selectQuickUser = (user: User) => {
    setEmail(user.email);
    setPassword('password123');
    handleSignIn(user);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand / Logo section */}
        <View style={styles.brandSection}>
          <View
            style={[
              styles.logoCircle,
              {
                backgroundColor: colors.primaryLight,
              },
            ]}
          >
            <Ionicons name="school" size={42} color={colors.primary} />
          </View>

          <Text
            style={[
              styles.appTitle,
              {
                color: colors.textPrimary,
                fontSize: tokens.fontSize.xxl,
                fontWeight: tokens.fontWeight.bold,
                marginTop: tokens.spacing.base,
              },
            ]}
          >
            Study Planner
          </Text>

          <Text
            style={[
              styles.appSubtitle,
              {
                color: colors.textMuted,
                fontSize: tokens.fontSize.sm,
                marginTop: 4,
                textAlign: 'center',
              },
            ]}
          >
            Quản lý học phần, bài tập và hạn nộp thông minh dành cho sinh viên
          </Text>
        </View>

        {/* Card Form */}
        <View
          style={[
            styles.cardForm,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: tokens.radii.xl,
              padding: tokens.spacing.xl,
              marginTop: tokens.spacing.xl,
            },
          ]}
        >
          <Text
            style={[
              styles.formHeading,
              {
                color: colors.textPrimary,
                fontSize: tokens.fontSize.lg,
                fontWeight: tokens.fontWeight.bold,
                marginBottom: tokens.spacing.base,
              },
            ]}
          >
            Đăng nhập tài khoản
          </Text>

          {errorMessage ? (
            <View
              accessibilityRole="alert"
              style={[
                styles.errorBanner,
                {
                  backgroundColor: colors.dangerSubtle,
                  borderColor: colors.danger,
                  borderRadius: tokens.radii.md,
                  padding: tokens.spacing.md,
                  marginBottom: tokens.spacing.base,
                },
              ]}
            >
              <Ionicons name="alert-circle" size={18} color={colors.danger} />
              <Text
                style={[
                  styles.errorBannerText,
                  {
                    color: colors.dangerText,
                    fontSize: tokens.fontSize.sm,
                    marginLeft: tokens.spacing.xs,
                  },
                ]}
              >
                {errorMessage}
              </Text>
            </View>
          ) : null}

          <Input
            label="Email sinh viên"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="MSSV@student.dntu.edu.vn"
          />

          <Input
            label="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholder="Nhập mật khẩu"
            rightElement={
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            }
          />

          <Button
            label="Đăng nhập ngay"
            onPress={() => handleSignIn()}
            loading={loading}
            variant="primary"
            size="lg"
            style={{ marginTop: tokens.spacing.sm }}
            icon={<Ionicons name="log-in-outline" size={20} color={colors.textInverse} />}
          />

          {/* Quick Select Buttons for the 3 Students */}
          <View style={{ marginTop: tokens.spacing.xl }}>
            <Text
              style={[
                styles.quickTitle,
                {
                  color: colors.textSecondary,
                  fontSize: tokens.fontSize.xs,
                  fontWeight: tokens.fontWeight.bold,
                  marginBottom: tokens.spacing.sm,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                },
              ]}
            >
              Chọn nhanh thành viên nhóm kiểm tra:
            </Text>

            {DEMO_USERS.map((usr) => (
              <TouchableOpacity
                key={usr.id}
                accessibilityRole="button"
                accessibilityLabel={`Đăng nhập nhanh với ${usr.name}`}
                onPress={() => selectQuickUser(usr)}
                style={[
                  styles.quickUserBtn,
                  {
                    backgroundColor: colors.surfaceSubtle,
                    borderColor: colors.border,
                    borderRadius: tokens.radii.md,
                    padding: tokens.spacing.sm,
                    marginBottom: tokens.spacing.xs,
                  },
                ]}
              >
                <Ionicons name="person-circle-outline" size={22} color={colors.primary} />
                <View style={{ marginLeft: tokens.spacing.sm, flex: 1 }}>
                  <Text
                    style={[
                      styles.quickUserName,
                      {
                        color: colors.textPrimary,
                        fontSize: tokens.fontSize.sm,
                        fontWeight: tokens.fontWeight.semibold,
                      },
                    ]}
                  >
                    {usr.name} ({usr.studentId})
                  </Text>
                  <Text
                    style={[
                      styles.quickUserEmail,
                      {
                        color: colors.textMuted,
                        fontSize: tokens.fontSize.xs,
                      },
                    ]}
                  >
                    {usr.email}
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  brandSection: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appTitle: {},
  appSubtitle: {
    maxWidth: 280,
    lineHeight: 18,
  },
  cardForm: {
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  formHeading: {},
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  errorBannerText: {
    flex: 1,
    fontWeight: '500',
  },
  quickTitle: {},
  quickUserBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  quickUserName: {},
  quickUserEmail: {},
});
