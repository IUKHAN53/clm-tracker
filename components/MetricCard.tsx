import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme, spacing, radius, font } from '@/constants/Colors';

interface MetricCardProps {
  title: string;
  value: number;
  iconLabel: string;
  bgColor: string;
  iconColor: string;
}

export default function MetricCard({ title, value, iconLabel, bgColor, iconColor }: MetricCardProps) {
  return (
    <View style={[styles.card, { backgroundColor: bgColor }]}>
      <View style={[styles.iconCircle, { backgroundColor: iconColor + '20' }]}>
        <Text style={[styles.iconText, { color: iconColor }]}>{iconLabel}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    minWidth: 140,
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  iconText: {
    fontSize: font.size.lg,
    fontWeight: font.weight.bold,
  },
  value: {
    fontSize: font.size.xxl,
    fontWeight: font.weight.bold,
    color: theme.text,
  },
  title: {
    fontSize: font.size.xs,
    fontWeight: font.weight.medium,
    color: theme.textSecondary,
    textAlign: 'center',
  },
});
