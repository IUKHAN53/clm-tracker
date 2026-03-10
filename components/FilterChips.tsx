import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme, spacing, radius, font } from '@/constants/Colors';
import { FilterType } from '@/types';

interface FilterChipsProps {
  active: FilterType;
  onChange: (filter: FilterType) => void;
}

const filters: { key: FilterType; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'All', icon: 'apps' },
  { key: 'Refusal', icon: 'close-circle' },
  { key: 'Zero Dose', icon: 'alert-circle' },
  { key: 'Vaccinated', icon: 'checkmark-circle' },
  { key: 'Not Vaccinated', icon: 'time' },
];

const filterColors: Record<FilterType, string> = {
  All: theme.primary,
  Refusal: theme.status.refusal,
  'Zero Dose': theme.status.zeroDose,
  Vaccinated: theme.status.vaccinated,
  'Not Vaccinated': theme.status.pending,
};

export default function FilterChips({ active, onChange }: FilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {filters.map(({ key, icon }) => {
        const isActive = active === key;
        const color = filterColors[key];
        return (
          <Pressable
            key={key}
            style={[
              styles.chip,
              isActive
                ? { backgroundColor: color }
                : { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border },
            ]}
            onPress={() => onChange(key)}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`Filter by ${key}`}
          >
            <Ionicons
              name={icon}
              size={14}
              color={isActive ? '#FFFFFF' : theme.textMuted}
            />
            <Text
              style={[
                styles.label,
                { color: isActive ? '#FFFFFF' : theme.textSecondary },
              ]}
            >
              {key}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.full,
    height: 36,
  },
  label: {
    fontSize: font.size.sm,
    fontWeight: font.weight.semibold,
  },
});
