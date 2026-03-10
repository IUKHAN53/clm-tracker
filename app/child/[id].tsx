import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { theme, spacing, radius, font } from '@/constants/Colors';
import { useChildrenStore } from '@/store/childrenStore';
import StatusBadge from '@/components/StatusBadge';
import { captureGPS } from '@/utils/gps';

export default function ChildDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { updateChild, deleteChild } = useChildrenStore();
  const child = useChildrenStore((s) => s.getChildById(id));
  const [isCapturingGPS, setIsCapturingGPS] = useState(false);

  if (!child) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Record not found</Text>
        <Pressable
          style={styles.backBtn}
          onPress={() => router.back()}
          accessibilityRole="button"
        >
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
  };

  const handleCaptureGPS = async () => {
    setIsCapturingGPS(true);
    const coords = await captureGPS();
    if (coords) {
      await updateChild(child.id, { gpsCoordinates: coords });
    }
    setIsCapturingGPS(false);
  };

  const handleCall = (number: string) => {
    if (!number) return;
    Linking.openURL(`tel:${number}`);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Record',
      `Are you sure you want to delete the record for ${child.childName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteChild(child.id);
            router.back();
          },
        },
      ]
    );
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
        <Text style={styles.cardTitle}>Details</Text>

        <InfoRow label="Address" value={child.address} />
        <InfoRow
          label="Contact"
          value={child.contactNumber || 'N/A'}
          onAction={child.contactNumber ? () => handleCall(child.contactNumber) : undefined}
          actionLabel="Call"
        />
        <InfoRow label="Category" value={child.category} />
        <InfoRow label="Serial #" value={String(child.serialNumber)} />
      </View>

      {/* Vaccination Action */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Vaccination Status</Text>

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
          <InfoRow label="Date of Vaccination" value={child.dateOfVaccination} />
        )}
      </View>

      {/* Community Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Community Member</Text>
        <InfoRow label="Name" value={child.communityMemberName || 'N/A'} />
        <InfoRow
          label="Contact"
          value={child.communityMemberContact || 'N/A'}
          onAction={
            child.communityMemberContact
              ? () => handleCall(child.communityMemberContact)
              : undefined
          }
          actionLabel="Call"
        />
      </View>

      {/* GPS */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>GPS Location</Text>
        {child.gpsCoordinates ? (
          <InfoRow label="Coordinates" value={child.gpsCoordinates} />
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
            <Text style={styles.gpsBtnText}>
              {child.gpsCoordinates ? 'Update GPS' : 'Capture GPS'}
            </Text>
          )}
        </Pressable>
      </View>

      {/* Delete */}
      <Pressable
        style={({ pressed }) => [styles.deleteBtn, pressed && styles.btnPressed]}
        onPress={handleDelete}
        accessibilityRole="button"
      >
        <Text style={styles.deleteBtnText}>Delete Record</Text>
      </Pressable>
    </ScrollView>
  );
}

function InfoRow({
  label,
  value,
  onAction,
  actionLabel,
}: {
  label: string;
  value: string;
  onAction?: () => void;
  actionLabel?: string;
}) {
  return (
    <View style={infoStyles.row}>
      <Text style={infoStyles.label}>{label}</Text>
      <View style={infoStyles.valueRow}>
        <Text style={infoStyles.value}>{value}</Text>
        {onAction && (
          <Pressable
            onPress={onAction}
            style={infoStyles.actionBtn}
            accessibilityRole="button"
            accessibilityLabel={`${actionLabel} ${value}`}
          >
            <Text style={infoStyles.actionText}>{actionLabel}</Text>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  actionText: {
    fontSize: font.size.xs,
    color: theme.primary,
    fontWeight: font.weight.semibold,
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
  },
  errorText: {
    fontSize: font.size.lg,
    color: theme.textSecondary,
    marginBottom: spacing.lg,
  },
  backBtn: {
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
  cardTitle: {
    fontSize: font.size.lg,
    fontWeight: font.weight.semibold,
    color: theme.text,
    marginBottom: spacing.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
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
});
