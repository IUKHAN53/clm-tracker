import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { theme, spacing, radius, font } from '@/constants/Colors';
import { ChildRecord } from '@/types';
import StatusBadge from './StatusBadge';

interface ChildListItemProps {
  child: ChildRecord;
}

function ChildListItem({ child }: ChildListItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => router.push(`/child/${child.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`View details for ${child.childName}`}
    >
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{child.childName}</Text>
          <Text style={styles.detail} numberOfLines={1}>F: {child.fatherName}</Text>
          <Text style={styles.detail} numberOfLines={1}>Age: {child.age} | {child.address}</Text>
        </View>
        <View style={styles.right}>
          <StatusBadge category={child.category} vaccinated={child.vaccinated} />
          <Text style={styles.serial}>#{child.serialNumber}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default memo(ChildListItem);

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: theme.shadow.color,
    shadowOpacity: theme.shadow.opacity,
    shadowOffset: theme.shadow.offset,
    shadowRadius: theme.shadow.radius,
    elevation: theme.shadow.elevation,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  info: {
    flex: 1,
    marginRight: spacing.md,
    gap: spacing.xs,
  },
  name: {
    fontSize: font.size.lg,
    fontWeight: font.weight.semibold,
    color: theme.text,
  },
  detail: {
    fontSize: font.size.sm,
    color: theme.textSecondary,
  },
  right: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  serial: {
    fontSize: font.size.xs,
    color: theme.textMuted,
    fontWeight: font.weight.medium,
  },
});
