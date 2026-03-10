import React from 'react';
import { View, TextInput, StyleSheet, Pressable, Text } from 'react-native';
import { theme, spacing, radius, font } from '@/constants/Colors';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChangeText, placeholder = 'Search by name or father name...' }: SearchBarProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>&#x1F50D;</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        accessibilityLabel="Search children"
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => onChangeText('')}
          style={styles.clearBtn}
          accessibilityLabel="Clear search"
          accessibilityRole="button"
        >
          <Text style={styles.clearText}>✕</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: theme.border,
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  icon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: font.size.md,
    color: theme.text,
    height: '100%',
  },
  clearBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearText: {
    fontSize: 12,
    color: theme.textSecondary,
    fontWeight: font.weight.bold,
  },
});
