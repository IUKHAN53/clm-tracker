import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { theme, spacing, radius, font } from '@/constants/Colors';
import { useAuthStore } from '@/store/authStore';

export default function LoginScreen() {
  const { login } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone.trim() || !password.trim()) {
      Toast.show({ type: 'warning', text1: 'Required', text2: 'Please enter phone number and password.' });
      return;
    }

    setIsLoading(true);
    const success = await login(phone.trim(), password);
    setIsLoading(false);

    if (success) {
      Toast.show({ type: 'success', text1: 'Welcome!', text2: 'Login successful.' });
      router.replace('/(tabs)');
    } else {
      Toast.show({ type: 'error', text1: 'Login Failed', text2: 'Invalid phone number or password.' });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        {/* Header with logos */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <Image source={require('../assets/images/govt-logo.png')} style={styles.logo} resizeMode="contain" />
            <Image source={require('../assets/images/epi-logo.png')} style={styles.logoLarge} resizeMode="contain" />
            <Image source={require('../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
          </View>
          <Text style={styles.title}>CLM Vaccination Tracker</Text>
          <Text style={styles.subtitle}>Sign in to sync your data</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputRow}>
              <Ionicons name="call" size={18} color={theme.textMuted} />
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
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputRow}>
              <Ionicons name="lock-closed" size={18} color={theme.textMuted} />
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
              <View style={styles.loginBtnContent}>
                <Ionicons name="log-in" size={20} color={theme.textOnPrimary} />
                <Text style={styles.loginBtnText}>Sign In</Text>
              </View>
            )}
          </Pressable>
        </View>

        <Text style={styles.footer}>Powered by EPI & TKF</Text>
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
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  logoLarge: {
    width: 68,
    height: 68,
    borderRadius: 8,
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: theme.surfaceAlt,
    minHeight: 48,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: font.size.md,
    color: theme.text,
    paddingVertical: spacing.md,
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
  loginBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  loginBtnText: {
    color: theme.textOnPrimary,
    fontSize: font.size.lg,
    fontWeight: font.weight.semibold,
  },
  footer: {
    textAlign: 'center',
    fontSize: font.size.xs,
    color: theme.textMuted,
    marginTop: spacing.xxl,
  },
});
