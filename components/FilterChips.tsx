import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { theme, spacing, radius, font } from '@/constants/Colors';
import { FilterType } from '@/types';

interface FilterChipsProps {
  active: FilterType;
  onChange: (filter: FilterType) => void;
}

const filters: FilterType[] = ['All', 'Refusal', 'Zero Dose', 'Vaccinated', 'Not Vaccinated'];

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
      {filters.map((filter) => {
        const isActive = active === filter;
        const color = filterColors[filter];
        return (
          <Pressable
            key={filter}
            style={[
              styles.chip,
              isActive
                ? { backgroundColor: color }
                : { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border },
            ]}
            onPress={() => onChange(filter)}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`Filter by ${filter}`}
          >
            <Text
              style={[
                styles.label,
                { color: isActive ? '#FFFFFF' : theme.textSecondary },
              ]}
            >
              {filter}
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    minHeight: 36,
    justifyContent: 'center',
  },
  label: {
    fontSize: font.size.sm,
    fontWeight: font.weight.semibold,
  },
});
