import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { theme, spacing, radius, font } from '@/constants/Colors';
import { useAuthStore } from '@/store/authStore';

export default function LoginScreen() {
  const { login } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone.trim() || !password.trim()) {
      Alert.alert('Required', 'Please enter phone number and password.');
      return;
    }

    setIsLoading(true);
    const success = await login(phone.trim(), password);
    setIsLoading(false);

    if (success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Login Failed', 'Invalid phone number or password. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>CLM</Text>
          </View>
          <Text style={styles.title}>CLM Vaccination Tracker</Text>
          <Text style={styles.subtitle}>Sign in to sync your data</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter your phone number"
              placeholderTextColor={theme.textMuted}
              keyboardType="phone-pad"
              autoCapitalize="none"
              accessibilityLabel="Phone number"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor={theme.textMuted}
              secureTextEntry
              accessibilityLabel="Password"
            />
          </View>

          <Pressable
            style={({ pressed }) => [styles.loginBtn, pressed && styles.btnPressed]}
            onPress={handleLogin}
            disabled={isLoading}
            accessibilityRole="button"
          >
            {isLoading ? (
              <ActivityIndicator color={theme.textOnPrimary} size="small" />
            ) : (
              <Text style={styles.loginBtnText}>Sign In</Text>
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  logoText: {
    fontSize: font.size.xxl,
    fontWeight: font.weight.bold,
    color: theme.textOnPrimary,
  },
  title: {
    fontSize: font.size.xxl,
    fontWeight: font.weight.bold,
    color: theme.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: font.size.md,
    color: theme.textMuted,
  },
  form: {
    backgroundColor: theme.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: theme.border,
    gap: spacing.lg,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    fontSize: font.size.sm,
    fontWeight: font.weight.medium,
    color: theme.textSecondary,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: font.size.md,
    color: theme.text,
    backgroundColor: theme.surfaceAlt,
    minHeight: 48,
  },
  loginBtn: {
    backgroundColor: theme.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  btnPressed: {
    opacity: 0.8,
  },
  loginBtnText: {
    color: theme.textOnPrimary,
    fontSize: font.size.lg,
    fontWeight: font.weight.semibold,
  },
});
