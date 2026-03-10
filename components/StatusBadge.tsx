import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme, spacing, radius, font } from '@/constants/Colors';
import { ChildCategory, VaccinationStatus } from '@/types';

interface StatusBadgeProps {
  category: ChildCategory;
  vaccinated: VaccinationStatus;
  size?: 'sm' | 'md';
}

function getStatusConfig(category: ChildCategory, vaccinated: VaccinationStatus) {
  if (vaccinated === 'YES') {
    return { label: 'Vaccinated', color: theme.status.vaccinated, bg: theme.status.vaccinatedBg };
  }
  if (category === 'Refusal') {
    return { label: 'Refusal', color: theme.status.refusal, bg: theme.status.refusalBg };
  }
  if (category === 'Zero Dose') {
    return { label: 'Zero Dose', color: theme.status.zeroDose, bg: theme.status.zeroDoseBg };
  }
  return { label: 'Defaulter', color: theme.status.pending, bg: theme.status.pendingBg };
}

export default function StatusBadge({ category, vaccinated, size = 'sm' }: StatusBadgeProps) {
  const config = getStatusConfig(category, vaccinated);
  const isSmall = size === 'sm';

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }, isSmall && styles.badgeSm]}>
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text style={[styles.label, { color: config.color }, isSmall && styles.labelSm]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    gap: spacing.xs + 2,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: font.size.sm,
    fontWeight: font.weight.semibold,
  },
  labelSm: {
    fontSize: font.size.xs,
  },
});
