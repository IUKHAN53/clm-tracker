import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { router } from 'expo-router';
import { theme, spacing, radius, font } from '@/constants/Colors';
import { useChildrenStore } from '@/store/childrenStore';
import { ChildRecord } from '@/types';
import ChildListItem from '@/components/ChildListItem';
import SearchBar from '@/components/SearchBar';
import FilterChips from '@/components/FilterChips';

export default function ChildrenListScreen() {
  const { searchQuery, setSearchQuery, activeFilter, setActiveFilter } = useChildrenStore();
  const filteredChildren = useChildrenStore((s) => s.getFilteredChildren());

  const renderItem = useCallback(
    ({ item }: { item: ChildRecord }) => <ChildListItem child={item} />,
    []
  );

  const keyExtractor = useCallback((item: ChildRecord) => item.id, []);

  return (
    <View style={styles.screen}>
      {/* Search */}
      <View style={styles.searchSection}>
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
      </View>

      {/* Filters */}
      <FilterChips active={activeFilter} onChange={setActiveFilter} />

      {/* Results count */}
      <View style={styles.resultsRow}>
        <Text style={styles.resultsText}>{filteredChildren.length} records found</Text>
      </View>

      {/* List */}
      <FlatList
        data={filteredChildren}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No Records Found</Text>
            <Text style={styles.emptyText}>
              {searchQuery || activeFilter !== 'All'
                ? 'Try changing your search or filter'
                : 'Tap the + button to add a new child record'}
            </Text>
          </View>
        }
      />

      {/* FAB */}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => router.push('/child/new')}
        accessibilityRole="button"
        accessibilityLabel="Add new child record"
      >
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.background,
  },
  searchSection: {
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  resultsRow: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  resultsText: {
    fontSize: font.size.sm,
    color: theme.textMuted,
  },
  list: {
    paddingBottom: 100,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: spacing.xxxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: font.size.xl,
    fontWeight: font.weight.semibold,
    color: theme.text,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: font.size.md,
    color: theme.textMuted,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.secondary,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
  },
  fabPressed: {
    transform: [{ scale: 0.92 }],
    opacity: 0.9,
  },
  fabIcon: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: font.weight.bold,
    lineHeight: 34,
  },
});
