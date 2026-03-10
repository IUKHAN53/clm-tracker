import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { theme, spacing, radius, font } from '@/constants/Colors';
import { useChildrenStore } from '@/store/childrenStore';
import { useAuthStore } from '@/store/authStore';

export default function SettingsScreen() {
  const { siteInfo, setSiteInfo, children, pendingSync, isSyncing, syncPending, fetchFromServer } = useChildrenStore();
  const { isAuthenticated, user, logout } = useAuthStore();

  const [district, setDistrict] = useState(siteInfo.district);
  const [uc, setUc] = useState(siteInfo.uc);
  const [fixSite, setFixSite] = useState(siteInfo.fixSite);

  useEffect(() => {
    setDistrict(siteInfo.district);
    setUc(siteInfo.uc);
    setFixSite(siteInfo.fixSite);
  }, [siteInfo]);

  const handleSave = async () => {
    await setSiteInfo({ district, uc, fixSite });
    Alert.alert('Saved', 'Location information updated successfully.');
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          Alert.alert('Signed Out', 'You have been signed out. Data will be stored locally.');
        },
      },
    ]);
  };

  const handleSync = async () => {
    if (!isAuthenticated) {
      Alert.alert('Not Signed In', 'Please sign in first to sync data.');
      return;
    }
    await syncPending();
    await fetchFromServer();
    Alert.alert('Sync Complete', 'Data has been synchronized with the server.');
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        {isAuthenticated ? (
          <>
            <View style={styles.userInfo}>
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{user?.name}</Text>
                <Text style={styles.userPhone}>{user?.phone || user?.email}</Text>
              </View>
            </View>

            {/* Sync Status */}
            <View style={styles.syncRow}>
              <View>
                <Text style={styles.statsLabel}>Pending Sync:</Text>
                <Text style={[styles.syncCount, pendingSync.length > 0 && styles.syncPending]}>
                  {pendingSync.length} {pendingSync.length === 1 ? 'action' : 'actions'}
                </Text>
              </View>
              <Pressable
                style={({ pressed }) => [styles.syncBtn, pressed && styles.btnPressed]}
                onPress={handleSync}
                disabled={isSyncing}
                accessibilityRole="button"
              >
                {isSyncing ? (
                  <ActivityIndicator color={theme.textOnPrimary} size="small" />
                ) : (
                  <Text style={styles.syncBtnText}>Sync Now</Text>
                )}
              </Pressable>
            </View>

            <Pressable
              style={({ pressed }) => [styles.logoutBtn, pressed && styles.btnPressed]}
              onPress={handleLogout}
              accessibilityRole="button"
            >
              <Text style={styles.logoutBtnText}>Sign Out</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.sectionDesc}>
              Sign in to sync records with the server. Data works offline without signing in.
            </Text>
            <Pressable
              style={({ pressed }) => [styles.saveBtn, pressed && styles.btnPressed]}
              onPress={() => router.push('/login')}
              accessibilityRole="button"
            >
              <Text style={styles.saveBtnText}>Sign In</Text>
            </Pressable>
          </>
        )}
      </View>

      {/* Site Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location Information</Text>
        <Text style={styles.sectionDesc}>
          Set your current field location. This appears on the dashboard.
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>District</Text>
          <TextInput
            style={styles.input}
            value={district}
            onChangeText={setDistrict}
            placeholder="Enter district name"
            placeholderTextColor={theme.textMuted}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>UC (Union Council)</Text>
          <TextInput
            style={styles.input}
            value={uc}
            onChangeText={setUc}
            placeholder="Enter UC name"
            placeholderTextColor={theme.textMuted}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Fix Site</Text>
          <TextInput
            style={styles.input}
            value={fixSite}
            onChangeText={setFixSite}
            placeholder="Enter fix site name"
            placeholderTextColor={theme.textMuted}
          />
        </View>

        <Pressable
          style={({ pressed }) => [styles.saveBtn, pressed && styles.btnPressed]}
          onPress={handleSave}
          accessibilityRole="button"
        >
          <Text style={styles.saveBtnText}>Save Location Info</Text>
        </Pressable>
      </View>

      {/* Data Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>

        <View style={styles.statsRow}>
          <Text style={styles.statsLabel}>Total Records:</Text>
          <Text style={styles.statsValue}>{children.length}</Text>
        </View>

        <View style={styles.statsRow}>
          <Text style={styles.statsLabel}>Pending Sync:</Text>
          <Text style={styles.statsValue}>{pendingSync.length}</Text>
        </View>
      </View>

      {/* App Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.aboutText}>
          CLM Vaccination Tracker v1.0.0{'\n'}
          Community Led Monitoring - Vaccination tracking for field workers.{'\n'}
          Data is stored locally and syncs with the server when connected.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    paddingVertical: spacing.xl,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: theme.surface,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: theme.border,
  },
  sectionTitle: {
    fontSize: font.size.lg,
    fontWeight: font.weight.semibold,
    color: theme.text,
    marginBottom: spacing.xs,
  },
  sectionDesc: {
    fontSize: font.size.sm,
    color: theme.textMuted,
    marginBottom: spacing.lg,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginVertical: spacing.lg,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: font.size.xl,
    fontWeight: font.weight.bold,
    color: theme.primary,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: font.size.lg,
    fontWeight: font.weight.semibold,
    color: theme.text,
  },
  userPhone: {
    fontSize: font.size.sm,
    color: theme.textMuted,
  },
  syncRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    marginBottom: spacing.md,
  },
  syncCount: {
    fontSize: font.size.sm,
    color: theme.textMuted,
    marginTop: 2,
  },
  syncPending: {
    color: theme.status.zeroDose,
    fontWeight: font.weight.semibold,
  },
  syncBtn: {
    backgroundColor: theme.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minHeight: 36,
    justifyContent: 'center',
  },
  syncBtnText: {
    color: theme.textOnPrimary,
    fontSize: font.size.sm,
    fontWeight: font.weight.semibold,
  },
  logoutBtn: {
    borderWidth: 1,
    borderColor: theme.status.refusal,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    minHeight: 44,
  },
  logoutBtnText: {
    color: theme.status.refusal,
    fontSize: font.size.md,
    fontWeight: font.weight.semibold,
  },
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: font.size.sm,
    fontWeight: font.weight.medium,
    color: theme.textSecondary,
    marginBottom: spacing.xs,
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
  saveBtn: {
    backgroundColor: theme.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    minHeight: 48,
  },
  btnPressed: {
    opacity: 0.8,
  },
  saveBtnText: {
    color: theme.textOnPrimary,
    fontSize: font.size.md,
    fontWeight: font.weight.semibold,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  statsLabel: {
    fontSize: font.size.md,
    color: theme.textSecondary,
  },
  statsValue: {
    fontSize: font.size.md,
    fontWeight: font.weight.bold,
    color: theme.text,
  },
  aboutText: {
    fontSize: font.size.sm,
    color: theme.textMuted,
    lineHeight: 20,
    marginTop: spacing.sm,
  },
});
