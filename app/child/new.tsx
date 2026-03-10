import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { theme, spacing, radius, font } from '@/constants/Colors';
import { useChildrenStore } from '@/store/childrenStore';
import { ChildCategory, VaccinationStatus } from '@/types';
import { captureGPS } from '@/utils/gps';

export default function NewChildScreen() {
  const { addChild } = useChildrenStore();

  const [childName, setChildName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [age, setAge] = useState('');
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [category, setCategory] = useState<ChildCategory>('Defaulter');
  const [vaccinated, setVaccinated] = useState<VaccinationStatus>('NO');
  const [communityMemberName, setCommunityMemberName] = useState('');
  const [communityMemberContact, setCommunityMemberContact] = useState('');
  const [gpsCoordinates, setGpsCoordinates] = useState<string | null>(null);
  const [isCapturingGPS, setIsCapturingGPS] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleCaptureGPS = async () => {
    setIsCapturingGPS(true);
    const coords = await captureGPS();
    if (coords) setGpsCoordinates(coords);
    setIsCapturingGPS(false);
  };

  const handleSave = async () => {
    if (!childName.trim()) {
      Alert.alert('Required', 'Please enter the child name.');
      return;
    }
    if (!fatherName.trim()) {
      Alert.alert('Required', 'Please enter the father name.');
      return;
    }
    if (!age.trim()) {
      Alert.alert('Required', 'Please enter the child age.');
      return;
    }

    setIsSaving(true);
    try {
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
        gpsCoordinates,
      });

      Alert.alert('Success', 'Child record added successfully.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to save record. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Child Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Child Information</Text>

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
          <Text style={styles.sectionTitle}>Category</Text>
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
          <Text style={styles.sectionTitle}>Vaccinated?</Text>
          <View style={styles.toggleRow}>
            <Pressable
              style={[
                styles.toggleBtn,
                vaccinated === 'YES' ? styles.toggleYes : styles.toggleOff,
              ]}
              onPress={() => setVaccinated('YES')}
              accessibilityRole="button"
            >
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
            <Text style={styles.dateNote}>
              Date will be set to today: {new Date().toISOString().split('T')[0]}
            </Text>
          )}
        </View>

        {/* Community Member */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Community Member Info</Text>
          <FormField
            label="Community Member Name"
            value={communityMemberName}
            onChange={setCommunityMemberName}
            placeholder="Enter community member name"
          />
          <FormField
            label="Contact Number"
            value={communityMemberContact}
            onChange={setCommunityMemberContact}
            placeholder="Enter contact number"
            keyboardType="phone-pad"
          />
        </View>

        {/* GPS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GPS Coordinates</Text>
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
              <Text style={styles.gpsBtnText}>
                {gpsCoordinates ? 'Re-capture GPS' : 'Capture GPS Location'}
              </Text>
            )}
          </Pressable>
        </View>

        {/* Save Button */}
        <Pressable
          style={({ pressed }) => [styles.saveBtn, pressed && styles.btnPressed]}
          onPress={handleSave}
          disabled={isSaving}
          accessibilityRole="button"
        >
          {isSaving ? (
            <ActivityIndicator color={theme.textOnPrimary} size="small" />
          ) : (
            <Text style={styles.saveBtnText}>Save Record</Text>
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
  sectionTitle: {
    fontSize: font.size.lg,
    fontWeight: font.weight.semibold,
    color: theme.text,
    marginBottom: spacing.lg,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  categoryChip: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
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
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
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
  dateNote: {
    fontSize: font.size.sm,
    color: theme.status.vaccinated,
    marginTop: spacing.sm,
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
  btnPressed: {
    opacity: 0.8,
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
