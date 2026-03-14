import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { theme, spacing, radius, font } from '@/constants/Colors';
import { useChildrenStore } from '@/store/childrenStore';
import { useAuthStore } from '@/store/authStore';
import StatusBadge from '@/components/StatusBadge';
import ConfirmDialog from '@/components/ConfirmDialog';
import LoginPrompt from '@/components/LoginPrompt';
import { isSynced, formatDate } from '@/utils/sync';
import { captureGPS } from '@/utils/gps';

export default function ChildDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const updateChild = useChildrenStore((s) => s.updateChild);
  const deleteChild = useChildrenStore((s) => s.deleteChild);
  const syncSingleRecord = useChildrenStore((s) => s.syncSingleRecord);
  const child = useChildrenStore((s) => s.children.find((c) => c.id === id));
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [isCapturingGPS, setIsCapturingGPS] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isSyncingRecord, setIsSyncingRecord] = useState(false);

  if (!child) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color={theme.textMuted} />
        <Text style={styles.errorText}>Record not found</Text>
        <Pressable
          style={styles.backBtn}
          onPress={() => router.back()}
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={18} color={theme.textOnPrimary} />
          <Text style={styles.backBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const handleVaccinate = async (vaccinated: 'YES' | 'NO') => {
    await updateChild(child.id, {
      vaccinated,
      dateOfVaccination: vaccinated === 'YES' ? new Date().toISOString().split('T')[0] : null,
    });
    Toast.show({
      type: vaccinated === 'YES' ? 'success' : 'info',
      text1: 'Status Updated',
      text2: vaccinated === 'YES' ? 'Marked as vaccinated.' : 'Marked as not vaccinated.',
    });
  };

  const handleCaptureGPS = async () => {
    setIsCapturingGPS(true);
    const coords = await captureGPS();
    if (coords) {
      await updateChild(child.id, { gpsCoordinates: coords });
      Toast.show({ type: 'success', text1: 'GPS Updated', text2: 'Coordinates captured successfully.' });
    }
    setIsCapturingGPS(false);
  };

  const handleCall = (number: string) => {
    if (!number) return;
    Linking.openURL(`tel:${number}`);
  };

  const handleDeleteConfirm = async () => {
    setShowDeleteDialog(false);
    await deleteChild(child.id);
    Toast.show({ type: 'success', text1: 'Deleted', text2: 'Record has been removed.' });
    router.back();
  };

  const handleSyncRecord = async () => {
    if (!isAuthenticated) {
      setShowLogin(true);
      return;
    }
    setIsSyncingRecord(true);
    try {
      const result = await syncSingleRecord(child.id);
      if (result.success) {
        Toast.show({ type: 'success', text1: 'Synced', text2: 'Record synced with server.' });
      } else {
        Toast.show({ type: 'error', text1: 'Sync Failed', text2: result.error || 'Could not sync record.' });
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Sync Error', text2: 'Could not connect to server.' });
    } finally {
      setIsSyncingRecord(false);
    }
  };

  const handleLoginSuccess = () => {
    setShowLogin(false);
    handleSyncRecord();
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {child.childName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.childName}>{child.childName}</Text>
            <Text style={styles.fatherName}>F/O: {child.fatherName}</Text>
            <Text style={styles.ageText}>Age: {child.age}</Text>
          </View>
        </View>
        <StatusBadge category={child.category} vaccinated={child.vaccinated} size="md" />
      </View>

      {/* Info Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="information-circle" size={20} color={theme.primary} />
          <Text style={styles.cardTitle}>Details</Text>
        </View>

        <InfoRow icon="location" label="Address" value={child.address} />
        <InfoRow
          icon="call"
          label="Contact"
          value={child.contactNumber || 'N/A'}
          onAction={child.contactNumber ? () => handleCall(child.contactNumber) : undefined}
          actionIcon="call"
        />
        <InfoRow icon="folder" label="Category" value={child.category} />
        <InfoRow icon="list" label="Serial #" value={String(child.serialNumber)} />
        {child.district ? <InfoRow icon="map" label="District" value={child.district} /> : null}
        {child.uc ? <InfoRow icon="business" label="UC" value={child.uc} /> : null}
        {child.fixSite ? <InfoRow icon="flag" label="Fix Site" value={child.fixSite} /> : null}
      </View>

      {/* Vaccination Action */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="medkit" size={20} color={theme.primary} />
          <Text style={styles.cardTitle}>Vaccination Status</Text>
        </View>

        <View style={styles.toggleRow}>
          <Pressable
            style={[
              styles.toggleBtn,
              child.vaccinated === 'YES' ? styles.toggleActive : styles.toggleInactive,
            ]}
            onPress={() => handleVaccinate('YES')}
            accessibilityRole="button"
            accessibilityLabel="Mark as vaccinated"
          >
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={child.vaccinated === 'YES' ? '#FFFFFF' : theme.textSecondary}
            />
            <Text
              style={[
                styles.toggleText,
                child.vaccinated === 'YES' && styles.toggleTextActive,
              ]}
            >
              YES - Vaccinated
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.toggleBtn,
              child.vaccinated === 'NO' ? styles.toggleDanger : styles.toggleInactive,
            ]}
            onPress={() => handleVaccinate('NO')}
            accessibilityRole="button"
            accessibilityLabel="Mark as not vaccinated"
          >
            <Ionicons
              name="close-circle"
              size={20}
              color={child.vaccinated === 'NO' ? '#FFFFFF' : theme.textSecondary}
            />
            <Text
              style={[
                styles.toggleText,
                child.vaccinated === 'NO' && styles.toggleTextActive,
              ]}
            >
              NO - Not Yet
            </Text>
          </Pressable>
        </View>

        {child.dateOfVaccination && (
          <InfoRow icon="calendar" label="Date of Vaccination" value={child.dateOfVaccination} />
        )}
      </View>

      {/* Community Info */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="people" size={20} color={theme.primary} />
          <Text style={styles.cardTitle}>Community Member</Text>
        </View>
        <InfoRow icon="person" label="Name" value={child.communityMemberName || 'N/A'} />
        <InfoRow
          icon="call"
          label="Contact"
          value={child.communityMemberContact || 'N/A'}
          onAction={
            child.communityMemberContact
              ? () => handleCall(child.communityMemberContact)
              : undefined
          }
          actionIcon="call"
        />
      </View>

      {/* GPS */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="location" size={20} color={theme.primary} />
          <Text style={styles.cardTitle}>GPS Location</Text>
        </View>
        {child.gpsCoordinates ? (
          <InfoRow icon="navigate" label="Coordinates" value={child.gpsCoordinates} />
        ) : (
          <Text style={styles.noGps}>No GPS coordinates captured yet</Text>
        )}
        <Pressable
          style={({ pressed }) => [styles.gpsBtn, pressed && styles.btnPressed]}
          onPress={handleCaptureGPS}
          disabled={isCapturingGPS}
          accessibilityRole="button"
        >
          {isCapturingGPS ? (
            <ActivityIndicator color={theme.textOnPrimary} size="small" />
          ) : (
            <View style={styles.btnContent}>
              <Ionicons name="navigate" size={18} color={theme.textOnPrimary} />
              <Text style={styles.gpsBtnText}>
                {child.gpsCoordinates ? 'Update GPS' : 'Capture GPS'}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Record Info */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="time" size={20} color={theme.primary} />
          <Text style={styles.cardTitle}>Record Info</Text>
        </View>

        <View style={infoStyles.row}>
          <View style={infoStyles.labelRow}>
            <Ionicons
              name={isSynced(child.id) ? 'cloud-done' : 'cloud-offline'}
              size={14}
              color={isSynced(child.id) ? theme.status.vaccinated : theme.status.zeroDose}
            />
            <Text style={infoStyles.label}>Sync Status</Text>
          </View>
          <Text style={[
            infoStyles.value,
            { color: isSynced(child.id) ? theme.status.vaccinated : theme.status.zeroDose },
          ]}>
            {isSynced(child.id) ? 'Synced' : 'Local Only'}
          </Text>
        </View>

        <InfoRow icon="calendar" label="Created" value={formatDate(child.createdAt)} />
        <InfoRow icon="create" label="Last Updated" value={formatDate(child.updatedAt)} />

        {!isSynced(child.id) && (
          <Pressable
            style={({ pressed }) => [styles.syncNowBtn, pressed && styles.btnPressed, isSyncingRecord && styles.syncNowBtnDisabled]}
            onPress={handleSyncRecord}
            disabled={isSyncingRecord}
            accessibilityRole="button"
          >
            {isSyncingRecord ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <View style={styles.btnContent}>
                <Ionicons name="cloud-upload" size={18} color="#FFFFFF" />
                <Text style={styles.syncNowBtnText}>Sync Now</Text>
              </View>
            )}
          </Pressable>
        )}
      </View>

      {/* Delete */}
      <Pressable
        style={({ pressed }) => [styles.deleteBtn, pressed && styles.btnPressed]}
        onPress={() => setShowDeleteDialog(true)}
        accessibilityRole="button"
      >
        <View style={styles.btnContent}>
          <Ionicons name="trash" size={18} color={theme.status.refusal} />
          <Text style={styles.deleteBtnText}>Delete Record</Text>
        </View>
      </Pressable>

      <ConfirmDialog
        visible={showDeleteDialog}
        icon="trash"
        title="Delete Record"
        message={`Are you sure you want to delete the record for ${child.childName}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteDialog(false)}
      />

      <LoginPrompt
        visible={showLogin}
        onSuccess={handleLoginSuccess}
        onCancel={() => setShowLogin(false)}
      />
    </ScrollView>
  );
}

function InfoRow({
  icon,
  label,
  value,
  onAction,
  actionIcon,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  onAction?: () => void;
  actionIcon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={infoStyles.row}>
      <View style={infoStyles.labelRow}>
        <Ionicons name={icon} size={14} color={theme.textMuted} />
        <Text style={infoStyles.label}>{label}</Text>
      </View>
      <View style={infoStyles.valueRow}>
        <Text style={infoStyles.value}>{value}</Text>
        {onAction && actionIcon && (
          <Pressable
            onPress={onAction}
            style={infoStyles.actionBtn}
            accessibilityRole="button"
            accessibilityLabel={`Call ${value}`}
          >
            <Ionicons name={actionIcon} size={14} color={theme.primary} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderLight,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  label: {
    fontSize: font.size.sm,
    color: theme.textMuted,
    fontWeight: font.weight.medium,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 1,
  },
  value: {
    fontSize: font.size.md,
    color: theme.text,
    fontWeight: font.weight.medium,
    textAlign: 'right',
    flexShrink: 1,
  },
  actionBtn: {
    backgroundColor: theme.primary + '15',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 40,
    gap: spacing.lg,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.background,
    gap: spacing.md,
  },
  errorText: {
    fontSize: font.size.lg,
    color: theme.textSecondary,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: theme.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  backBtnText: {
    color: theme.textOnPrimary,
    fontWeight: font.weight.semibold,
  },
  profileCard: {
    backgroundColor: theme.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: theme.border,
    gap: spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: font.size.xxl,
    fontWeight: font.weight.bold,
    color: theme.primary,
  },
  profileInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  childName: {
    fontSize: font.size.xl,
    fontWeight: font.weight.bold,
    color: theme.text,
  },
  fatherName: {
    fontSize: font.size.md,
    color: theme.textSecondary,
  },
  ageText: {
    fontSize: font.size.sm,
    color: theme.textMuted,
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: theme.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: font.size.lg,
    fontWeight: font.weight.semibold,
    color: theme.text,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    minHeight: 52,
  },
  toggleActive: {
    backgroundColor: theme.status.vaccinated,
  },
  toggleDanger: {
    backgroundColor: theme.status.refusal,
  },
  toggleInactive: {
    backgroundColor: theme.status.pendingBg,
    borderWidth: 1,
    borderColor: theme.border,
  },
  toggleText: {
    fontSize: font.size.md,
    fontWeight: font.weight.semibold,
    color: theme.textSecondary,
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  noGps: {
    fontSize: font.size.sm,
    color: theme.textMuted,
    marginVertical: spacing.sm,
  },
  gpsBtn: {
    backgroundColor: theme.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
    minHeight: 48,
    justifyContent: 'center',
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  btnPressed: {
    opacity: 0.8,
  },
  gpsBtnText: {
    color: theme.textOnPrimary,
    fontSize: font.size.md,
    fontWeight: font.weight.semibold,
  },
  deleteBtn: {
    borderWidth: 1,
    borderColor: theme.status.refusal,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    minHeight: 48,
  },
  deleteBtnText: {
    color: theme.status.refusal,
    fontSize: font.size.md,
    fontWeight: font.weight.semibold,
  },
  syncNowBtn: {
    backgroundColor: theme.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
    minHeight: 48,
    justifyContent: 'center',
  },
  syncNowBtnText: {
    color: '#FFFFFF',
    fontSize: font.size.md,
    fontWeight: font.weight.semibold,
  },
  syncNowBtnDisabled: {
    opacity: 0.6,
  },
});
