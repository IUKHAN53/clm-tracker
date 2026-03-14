import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  Platform,
  Linking,
  Share,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import NetInfo from '@react-native-community/netinfo';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import { theme, spacing, radius, font } from '@/constants/Colors';
import { useChildrenStore } from '@/store/childrenStore';
import { useAuthStore } from '@/store/authStore';

export default function SettingsScreen() {
  const { siteInfo, children, pendingSync, isSyncing, syncPending, fetchFromServer } = useChildrenStore();
  const { isAuthenticated, user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          Toast.show({ type: 'info', text1: 'Signed Out', text2: 'Data will be stored locally.' });
        },
      },
    ]);
  };

  const handleSync = async () => {
    if (!isAuthenticated) {
      Toast.show({ type: 'warning', text1: 'Not Signed In', text2: 'Please sign in first to sync data.' });
      return;
    }

    // Check internet connectivity first
    const netState = await NetInfo.fetch();
    if (!netState.isConnected || !netState.isInternetReachable) {
      Toast.show({
        type: 'error',
        text1: 'No Internet Connection',
        text2: 'Please check your internet connection and try again.',
      });
      return;
    }

    try {
      const result = await syncPending();
      await fetchFromServer();

      if (result.failed > 0) {
        Toast.show({
          type: 'warning',
          text1: 'Partial Sync',
          text2: `${result.synced} synced, ${result.failed} failed. Try again later.`,
        });
      } else {
        Toast.show({ type: 'success', text1: 'Sync Complete', text2: 'Data has been synchronized with the server.' });
      }
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Sync Failed',
        text2: 'Could not connect to server. Please try again.',
      });
    }
  };

  const getDebugInfo = async () => {
    const netState = await NetInfo.fetch();
    const debugInfo = `
CLM Tracker Debug Info
=======================
App Version: ${Application.nativeApplicationVersion || '1.0.0'}
Build: ${Application.nativeBuildVersion || 'N/A'}

Device Info:
- Brand: ${Device.brand || 'Unknown'}
- Model: ${Device.modelName || 'Unknown'}
- OS: ${Platform.OS} ${Device.osVersion || Platform.Version}
- Device Type: ${Device.deviceType === 1 ? 'Phone' : Device.deviceType === 2 ? 'Tablet' : 'Unknown'}

Network:
- Connected: ${netState.isConnected ? 'Yes' : 'No'}
- Type: ${netState.type}
- Internet Reachable: ${netState.isInternetReachable ? 'Yes' : 'No'}

User:
- Logged In: ${isAuthenticated ? 'Yes' : 'No'}
- Name: ${user?.name || 'N/A'}
- Phone: ${user?.phone || 'N/A'}

Data:
- Total Records: ${children.length}
- Pending Sync: ${pendingSync.length}
- Site: ${siteInfo.district || 'Not Set'} / ${siteInfo.uc || ''} / ${siteInfo.fixSite || ''}

Generated: ${new Date().toISOString()}
    `.trim();
    return debugInfo;
  };

  const handleShareDebugInfo = async () => {
    try {
      const debugInfo = await getDebugInfo();

      // Try WhatsApp first
      const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(debugInfo)}`;
      const canOpenWhatsApp = await Linking.canOpenURL(whatsappUrl);

      if (canOpenWhatsApp) {
        await Linking.openURL(whatsappUrl);
      } else {
        // Fallback to native share
        await Share.share({
          message: debugInfo,
          title: 'CLM Tracker Debug Info',
        });
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Share Failed', text2: 'Could not share debug info.' });
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Account Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="person-circle" size={22} color={theme.primary} />
          <Text style={styles.sectionTitle}>Account</Text>
        </View>
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
                <Text style={styles.userPhone}>{user?.phone}</Text>
              </View>
            </View>

            {/* Sync Status */}
            <View style={styles.syncRow}>
              <View style={styles.syncInfo}>
                <Ionicons
                  name={pendingSync.length > 0 ? 'cloud-upload' : 'cloud-done'}
                  size={20}
                  color={pendingSync.length > 0 ? theme.status.zeroDose : theme.status.vaccinated}
                />
                <View>
                  <Text style={styles.statsLabel}>Pending Sync</Text>
                  <Text style={[styles.syncCount, pendingSync.length > 0 && styles.syncPending]}>
                    {pendingSync.length} {pendingSync.length === 1 ? 'action' : 'actions'}
                  </Text>
                </View>
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
                  <View style={styles.btnRow}>
                    <Ionicons name="sync" size={16} color={theme.textOnPrimary} />
                    <Text style={styles.syncBtnText}>Sync Now</Text>
                  </View>
                )}
              </Pressable>
            </View>

            <Pressable
              style={({ pressed }) => [styles.logoutBtn, pressed && styles.btnPressed]}
              onPress={handleLogout}
              accessibilityRole="button"
            >
              <View style={styles.btnRow}>
                <Ionicons name="log-out" size={18} color={theme.status.refusal} />
                <Text style={styles.logoutBtnText}>Sign Out</Text>
              </View>
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
              <View style={styles.btnRow}>
                <Ionicons name="log-in" size={18} color={theme.textOnPrimary} />
                <Text style={styles.saveBtnText}>Sign In</Text>
              </View>
            </Pressable>
          </>
        )}
      </View>

      {/* Data Management */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="server" size={22} color={theme.primary} />
          <Text style={styles.sectionTitle}>Data Management</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="document-text" size={18} color={theme.primary} />
            <Text style={styles.statsLabel}>Total Records</Text>
          </View>
          <Text style={styles.statsValue}>{children.length}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="cloud-upload" size={18} color={theme.status.zeroDose} />
            <Text style={styles.statsLabel}>Pending Sync</Text>
          </View>
          <Text style={styles.statsValue}>{pendingSync.length}</Text>
        </View>
      </View>

      {/* App Info */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="information-circle" size={22} color={theme.primary} />
          <Text style={styles.sectionTitle}>About</Text>
        </View>
        <Text style={styles.aboutText}>
          CLM Vaccination Tracker v1.0.0{'\n'}
          Community Led Monitoring - Vaccination tracking for field workers.{'\n'}
          Data is stored locally and syncs with the server when connected.
        </Text>

        <Pressable
          style={({ pressed }) => [styles.debugBtn, pressed && styles.btnPressed]}
          onPress={handleShareDebugInfo}
          accessibilityRole="button"
        >
          <View style={styles.btnRow}>
            <Ionicons name="share-social" size={18} color={theme.primary} />
            <Text style={styles.debugBtnText}>Share Debug Info</Text>
          </View>
        </Pressable>
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontSize: font.size.lg,
    fontWeight: font.weight.semibold,
    color: theme.text,
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
  syncInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoutBtn: {
    borderWidth: 1,
    borderColor: theme.status.refusal,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  logoutBtnText: {
    color: theme.status.refusal,
    fontSize: font.size.md,
    fontWeight: font.weight.semibold,
  },
  saveBtn: {
    backgroundColor: theme.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
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
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
  debugBtn: {
    borderWidth: 1,
    borderColor: theme.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    marginTop: spacing.lg,
    backgroundColor: theme.primary + '10',
  },
  debugBtnText: {
    color: theme.primary,
    fontSize: font.size.md,
    fontWeight: font.weight.semibold,
  },
});
