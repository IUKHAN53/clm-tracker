import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { theme, spacing, radius, font } from '@/constants/Colors';
import { useChildrenStore } from '@/store/childrenStore';
import { useAuthStore } from '@/store/authStore';
import { ChildRecord } from '@/types';
import ChildListItem from '@/components/ChildListItem';
import SearchBar from '@/components/SearchBar';
import FilterChips from '@/components/FilterChips';
import LoginPrompt from '@/components/LoginPrompt';

export default function ChildrenListScreen() {
  const searchQuery = useChildrenStore((s) => s.searchQuery);
  const setSearchQuery = useChildrenStore((s) => s.setSearchQuery);
  const activeFilter = useChildrenStore((s) => s.activeFilter);
  const setActiveFilter = useChildrenStore((s) => s.setActiveFilter);
  const children = useChildrenStore((s) => s.children);
  const syncPending = useChildrenStore((s) => s.syncPending);
  const fetchFromServer = useChildrenStore((s) => s.fetchFromServer);
  const isSyncing = useChildrenStore((s) => s.isSyncing);
  const pendingSync = useChildrenStore((s) => s.pendingSync);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [showLogin, setShowLogin] = useState(false);
  const [syncingAll, setSyncingAll] = useState(false);

  // Count local-only records (non-numeric IDs)
  const localCount = useMemo(
    () => children.filter((c) => !/^\d+$/.test(c.id)).length,
    [children]
  );

  const handleSyncAll = async () => {
    if (!isAuthenticated) {
      setShowLogin(true);
      return;
    }
    setSyncingAll(true);
    try {
      const result = await syncPending();
      await fetchFromServer();
      if (result.synced > 0) {
        Toast.show({ type: 'success', text1: 'Sync Complete', text2: `${result.synced} record(s) synced successfully` });
      } else if (result.failed > 0) {
        Toast.show({ type: 'error', text1: 'Sync Failed', text2: `${result.failed} record(s) failed to sync` });
      } else {
        Toast.show({ type: 'info', text1: 'All Synced', text2: 'All records are already up to date' });
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Sync Error', text2: 'Could not connect to server' });
    } finally {
      setSyncingAll(false);
    }
  };

  const handleLoginSuccess = () => {
    setShowLogin(false);
    handleSyncAll();
  };

  const filteredChildren = useMemo(() => {
    let filtered = children;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.childName.toLowerCase().includes(q) ||
          c.fatherName.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q)
      );
    }
    switch (activeFilter) {
      case 'Refusal': filtered = filtered.filter((c) => c.category === 'Refusal'); break;
      case 'Zero Dose': filtered = filtered.filter((c) => c.category === 'Zero Dose'); break;
      case 'Vaccinated': filtered = filtered.filter((c) => c.vaccinated === 'YES'); break;
      case 'Not Vaccinated': filtered = filtered.filter((c) => c.vaccinated === 'NO'); break;
    }
    return filtered;
  }, [children, searchQuery, activeFilter]);

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

      {/* Results count + Sync button */}
      <View style={styles.resultsRow}>
        <Text style={styles.resultsText}>{filteredChildren.length} records found</Text>
        <Pressable
          style={({ pressed }) => [
            styles.syncBtn,
            (syncingAll || isSyncing) && styles.syncBtnDisabled,
            pressed && styles.syncBtnPressed,
          ]}
          onPress={handleSyncAll}
          disabled={syncingAll || isSyncing}
          accessibilityRole="button"
          accessibilityLabel="Sync all records"
        >
          {syncingAll || isSyncing ? (
            <ActivityIndicator size={14} color={theme.primary} />
          ) : (
            <Ionicons name="cloud-upload-outline" size={16} color={theme.primary} />
          )}
          <Text style={styles.syncBtnText}>
            {syncingAll || isSyncing ? 'Syncing...' : `Sync${localCount > 0 || pendingSync.length > 0 ? ` (${localCount + pendingSync.length})` : ''}`}
          </Text>
        </Pressable>
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
            <Ionicons name="document-text-outline" size={56} color={theme.textMuted} style={{ marginBottom: spacing.lg }} />
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
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </Pressable>

      {/* Login Prompt */}
      <LoginPrompt
        visible={showLogin}
        onSuccess={handleLoginSuccess}
        onCancel={() => setShowLogin(false)}
      />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  resultsText: {
    fontSize: font.size.sm,
    color: theme.textMuted,
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.sm,
    backgroundColor: theme.primary + '12',
    borderWidth: 1,
    borderColor: theme.primary + '30',
  },
  syncBtnText: {
    fontSize: font.size.sm,
    fontWeight: font.weight.semibold,
    color: theme.primary,
  },
  syncBtnPressed: {
    opacity: 0.7,
  },
  syncBtnDisabled: {
    opacity: 0.5,
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
