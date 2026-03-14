import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  FlatList,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme, spacing, radius, font } from '@/constants/Colors';

interface DropdownPickerProps {
  label?: string;
  value: string;
  options: string[];
  placeholder?: string;
  onSelect: (value: string) => void;
  disabled?: boolean;
  loading?: boolean;
  searchable?: boolean;
}

export default function DropdownPicker({
  label,
  value,
  options,
  placeholder = 'Select...',
  onSelect,
  disabled = false,
  loading = false,
  searchable = true,
}: DropdownPickerProps) {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');

  const filteredOptions = search
    ? options.filter((o) => o.toLowerCase().includes(search.toLowerCase()))
    : options;

  const handleSelect = (item: string) => {
    onSelect(item);
    setVisible(false);
    setSearch('');
  };

  const handleClose = () => {
    setVisible(false);
    setSearch('');
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Pressable
        style={[
          styles.trigger,
          disabled && styles.triggerDisabled,
        ]}
        onPress={() => !disabled && setVisible(true)}
        accessibilityRole="button"
        accessibilityLabel={label || placeholder}
      >
        <Text style={value ? styles.triggerText : styles.triggerPlaceholder}>
          {loading ? 'Loading...' : value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color={theme.textMuted} />
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <Pressable style={styles.overlay} onPress={handleClose}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>{label || placeholder}</Text>

            {searchable && options.length > 5 && (
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={18} color={theme.textMuted} />
                <TextInput
                  style={styles.searchInput}
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search..."
                  placeholderTextColor={theme.textMuted}
                  autoFocus={false}
                />
                {search.length > 0 && (
                  <Pressable onPress={() => setSearch('')}>
                    <Ionicons name="close-circle" size={18} color={theme.textMuted} />
                  </Pressable>
                )}
              </View>
            )}

            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item}
              style={styles.list}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.option,
                    item === value && styles.optionSelected,
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      item === value && styles.optionTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                  {item === value && (
                    <Ionicons name="checkmark" size={20} color={theme.primary} />
                  )}
                </Pressable>
              )}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Ionicons name="search-outline" size={24} color={theme.textMuted} />
                  <Text style={styles.emptyText}>
                    {search ? 'No results found' : 'No options available'}
                  </Text>
                </View>
              }
            />

            <Pressable style={styles.cancelBtn} onPress={handleClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: font.size.sm,
    fontWeight: font.weight.medium,
    color: theme.textSecondary,
    marginBottom: spacing.xs,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: radius.sm,
    backgroundColor: theme.surfaceAlt,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  triggerDisabled: {
    opacity: 0.5,
  },
  triggerText: {
    fontSize: font.size.md,
    color: theme.text,
    flex: 1,
  },
  triggerPlaceholder: {
    fontSize: font.size.md,
    color: theme.textMuted,
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    maxHeight: '70%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.border,
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  sheetTitle: {
    fontSize: font.size.lg,
    fontWeight: font.weight.semibold,
    color: theme.text,
    marginBottom: spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: radius.sm,
    backgroundColor: theme.surfaceAlt,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: font.size.md,
    color: theme.text,
    paddingVertical: spacing.md,
  },
  list: {
    flexGrow: 0,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderLight,
  },
  optionSelected: {
    backgroundColor: theme.primary + '10',
  },
  optionText: {
    fontSize: font.size.md,
    color: theme.text,
    flex: 1,
  },
  optionTextSelected: {
    color: theme.primary,
    fontWeight: font.weight.semibold,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: font.size.sm,
    color: theme.textMuted,
  },
  cancelBtn: {
    marginTop: spacing.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    borderRadius: radius.md,
    backgroundColor: theme.surfaceAlt,
  },
  cancelText: {
    fontSize: font.size.md,
    fontWeight: font.weight.semibold,
    color: theme.textSecondary,
  },
});
