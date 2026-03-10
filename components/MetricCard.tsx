import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme, spacing, radius, font } from '@/constants/Colors';

interface MetricCardProps {
  title: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  bgColor: string;
  iconColor: string;
}

export default function MetricCard({ title, value, icon, bgColor, iconColor }: MetricCardProps) {
  return (
    <View style={[styles.card, { backgroundColor: bgColor }]}>
      <View style={[styles.iconCircle, { backgroundColor: iconColor + '20' }]}>
        <Ionicons name={icon} size={22} color={iconColor} />
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
