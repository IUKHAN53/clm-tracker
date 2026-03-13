import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { theme, spacing, radius, font } from '@/constants/Colors';
import { useChildrenStore } from '@/store/childrenStore';
import { useAuthStore } from '@/store/authStore';
import { ChildCategory, VaccinationStatus } from '@/types';
import { captureGPS } from '@/utils/gps';

export default function NewChildScreen() {
  const { addChild } = useChildrenStore();
  const user = useAuthStore((s) => s.user);

  const [childName, setChildName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [age, setAge] = useState('');
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [category, setCategory] = useState<ChildCategory>('Defaulter');
  const [vaccinated, setVaccinated] = useState<VaccinationStatus>('NO');
  const communityMemberName = user?.name || '';
  const communityMemberContact = user?.phone || '';
  const [gpsCoordinates, setGpsCoordinates] = useState<string | null>(null);
  const [isCapturingGPS, setIsCapturingGPS] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isSavingRef = useRef(false);

  const handleCaptureGPS = async () => {
    setIsCapturingGPS(true);
    const coords = await captureGPS();
    if (coords) setGpsCoordinates(coords);
    setIsCapturingGPS(false);
  };

  const handleSave = async () => {
    if (!childName.trim()) {
      Toast.show({ type: 'warning', text1: 'Required', text2: 'Please enter the child name.' });
      return;
    }
    if (!fatherName.trim()) {
      Toast.show({ type: 'warning', text1: 'Required', text2: 'Please enter the father name.' });
      return;
    }
    if (!age.trim()) {
      Toast.show({ type: 'warning', text1: 'Required', text2: 'Please enter the child age.' });
      return;
    }

    // Prevent duplicate submissions
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    setIsSaving(true);

    try {
      // Auto-fetch GPS if not already captured
      let finalGpsCoordinates = gpsCoordinates;
      if (!finalGpsCoordinates) {
        const coords = await captureGPS();
        if (coords) {
          finalGpsCoordinates = coords;
          setGpsCoordinates(coords);
        }
      }

      await addChild({
        childName: childName.trim(),
        fatherName: fatherName.trim(),
        age: age.trim(),
        address: address.trim(),
        contactNumber: contactNumber.trim(),
        category,
        vaccinated,
        dateOfVaccination:
          vaccinated === 'YES' ? new Date().toISOString().split('T')[0] : null,
        communityMemberName: communityMemberName.trim(),
        communityMemberContact: communityMemberContact.trim(),
        gpsCoordinates: finalGpsCoordinates,
      });

      Toast.show({
        type: 'success',
        text1: 'Record Saved',
        text2: 'Child record added successfully.',
      });

      // Redirect to home after a short delay for toast visibility
      setTimeout(() => router.replace('/(tabs)'), 2500);
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to save record. Please try again.' });
      isSavingRef.current = false;
      setIsSaving(false);
    }
  };

  const categoryIcons: Record<ChildCategory, keyof typeof Ionicons.glyphMap> = {
    Defaulter: 'time',
    Refusal: 'close-circle',
    'Zero Dose': 'alert-circle',
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Child Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={20} color={theme.primary} />
            <Text style={styles.sectionTitle}>Child Information</Text>
          </View>

          <FormField label="Child Name *" value={childName} onChange={setChildName} placeholder="Enter child name" />
          <FormField label="Father Name *" value={fatherName} onChange={setFatherName} placeholder="Enter father name" />
          <FormField label="Age *" value={age} onChange={setAge} placeholder="e.g. 2 years" />
          <FormField label="Address" value={address} onChange={setAddress} placeholder="Enter address" />
          <FormField
            label="Contact Number"
            value={contactNumber}
            onChange={setContactNumber}
            placeholder="Enter contact number"
            keyboardType="phone-pad"
          />
        </View>

        {/* Category */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="list" size={20} color={theme.primary} />
            <Text style={styles.sectionTitle}>Category</Text>
          </View>
          <View style={styles.chipRow}>
            {(['Defaulter', 'Refusal', 'Zero Dose'] as ChildCategory[]).map((cat) => (
              <Pressable
                key={cat}
                style={[
                  styles.categoryChip,
                  category === cat ? styles.categoryActive : styles.categoryInactive,
                ]}
                onPress={() => setCategory(cat)}
                accessibilityRole="button"
                accessibilityState={{ selected: category === cat }}
              >
                <Ionicons
                  name={categoryIcons[cat]}
                  size={16}
                  color={category === cat ? '#FFFFFF' : theme.textSecondary}
                />
                <Text
                  style={[
                    styles.categoryText,
                    category === cat && styles.categoryTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Vaccination */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="medkit" size={20} color={theme.primary} />
            <Text style={styles.sectionTitle}>Vaccinated?</Text>
          </View>
          <View style={styles.toggleRow}>
            <Pressable
              style={[
                styles.toggleBtn,
                vaccinated === 'YES' ? styles.toggleYes : styles.toggleOff,
              ]}
              onPress={() => setVaccinated('YES')}
              accessibilityRole="button"
            >
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={vaccinated === 'YES' ? '#FFFFFF' : theme.textSecondary}
              />
              <Text
                style={[
                  styles.toggleText,
                  vaccinated === 'YES' && styles.toggleTextOn,
                ]}
              >
                YES
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.toggleBtn,
                vaccinated === 'NO' ? styles.toggleNo : styles.toggleOff,
              ]}
              onPress={() => setVaccinated('NO')}
              accessibilityRole="button"
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={vaccinated === 'NO' ? '#FFFFFF' : theme.textSecondary}
              />
              <Text
                style={[
                  styles.toggleText,
                  vaccinated === 'NO' && styles.toggleTextOn,
                ]}
              >
                NO
              </Text>
            </Pressable>
          </View>
          {vaccinated === 'YES' && (
            <View style={styles.dateRow}>
              <Ionicons name="calendar" size={14} color={theme.status.vaccinated} />
              <Text style={styles.dateNote}>
                Date will be set to today: {new Date().toISOString().split('T')[0]}
              </Text>
            </View>
          )}
        </View>

        {/* GPS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={20} color={theme.primary} />
            <Text style={styles.sectionTitle}>GPS Coordinates</Text>
          </View>
          {gpsCoordinates && (
            <Text style={styles.gpsValue}>{gpsCoordinates}</Text>
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
                  {gpsCoordinates ? 'Re-capture GPS' : 'Capture GPS Location'}
                </Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Save Button */}
        <Pressable
          style={({ pressed }) => [styles.saveBtn, pressed && styles.btnPressed, isSaving && styles.btnDisabled]}
          onPress={handleSave}
          disabled={isSaving}
          accessibilityRole="button"
        >
          {isSaving ? (
            <ActivityIndicator color={theme.textOnPrimary} size="small" />
          ) : (
            <View style={styles.btnContent}>
              <Ionicons name="checkmark-done" size={20} color={theme.textOnPrimary} />
              <Text style={styles.saveBtnText}>Save Record</Text>
            </View>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  keyboardType = 'default',
}: {
  label: string;
  value: string;
  onChange: (text: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'phone-pad' | 'numeric';
}) {
  return (
    <View style={fieldStyles.container}>
      <Text style={fieldStyles.label}>{label}</Text>
      <TextInput
        style={fieldStyles.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        keyboardType={keyboardType}
        accessibilityLabel={label}
      />
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  container: {
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
});

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 40,
    gap: spacing.lg,
  },
  section: {
    backgroundColor: theme.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: theme.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: font.size.lg,
    fontWeight: font.weight.semibold,
    color: theme.text,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  categoryChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    minHeight: 48,
  },
  categoryActive: {
    backgroundColor: theme.primary,
  },
  categoryInactive: {
    backgroundColor: theme.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.border,
  },
  categoryText: {
    fontSize: font.size.sm,
    fontWeight: font.weight.semibold,
    color: theme.textSecondary,
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    minHeight: 56,
  },
  toggleYes: {
    backgroundColor: theme.status.vaccinated,
  },
  toggleNo: {
    backgroundColor: theme.status.refusal,
  },
  toggleOff: {
    backgroundColor: theme.status.pendingBg,
    borderWidth: 1,
    borderColor: theme.border,
  },
  toggleText: {
    fontSize: font.size.lg,
    fontWeight: font.weight.bold,
    color: theme.textSecondary,
  },
  toggleTextOn: {
    color: '#FFFFFF',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  dateNote: {
    fontSize: font.size.sm,
    color: theme.status.vaccinated,
    fontWeight: font.weight.medium,
  },
  gpsValue: {
    fontSize: font.size.md,
    color: theme.text,
    fontWeight: font.weight.medium,
    marginBottom: spacing.sm,
    fontVariant: ['tabular-nums'],
  },
  gpsBtn: {
    backgroundColor: theme.primaryDark,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
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
  btnDisabled: {
    opacity: 0.6,
  },
  gpsBtnText: {
    color: theme.textOnPrimary,
    fontSize: font.size.md,
    fontWeight: font.weight.semibold,
  },
  saveBtn: {
    backgroundColor: theme.secondary,
    borderRadius: radius.md,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
    shadowColor: theme.secondary,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    color: theme.textOnPrimary,
    fontSize: font.size.lg,
    fontWeight: font.weight.bold,
  },
});
