import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { theme, spacing, radius, font } from '@/constants/Colors';
import { useChildrenStore } from '@/store/childrenStore';
import MetricCard from '@/components/MetricCard';
import SearchBar from '@/components/SearchBar';

export default function DashboardScreen() {
  const { siteInfo, isLoading, loadData, searchQuery, setSearchQuery } = useChildrenStore();
  const metrics = useChildrenStore((s) => s.getMetrics());

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim()) {
      router.push('/(tabs)/children');
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={loadData} tintColor={theme.primary} />
      }
    >
      <StatusBar style="dark" />

      {/* Location Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>CLM Vaccination Tracker</Text>
        <View style={styles.locationRow}>
          {siteInfo.district ? (
            <Text style={styles.locationText}>
              {siteInfo.district} &bull; {siteInfo.uc} &bull; {siteInfo.fixSite}
            </Text>
          ) : (
            <Pressable
              onPress={() => router.push('/(tabs)/settings')}
              accessibilityRole="button"
            >
              <Text style={styles.setupLink}>Tap to set location info</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Search */}
      <SearchBar value={searchQuery} onChangeText={handleSearch} placeholder="Search child by name or father name..." />

      {/* Metrics Grid */}
      <View style={styles.metricsSection}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.metricsGrid}>
          <MetricCard
            title="Total Defaulters"
            value={metrics.totalDefaulters}
            iconLabel="T"
            bgColor={theme.metrics.totalBg}
            iconColor={theme.metrics.totalIcon}
          />
          <MetricCard
            title="Vaccinated"
            value={metrics.vaccinated}
            iconLabel="V"
            bgColor={theme.metrics.vaccinatedBg}
            iconColor={theme.metrics.vaccinatedIcon}
          />
        </View>
        <View style={styles.metricsGrid}>
          <MetricCard
            title="Pending / Refusals"
            value={metrics.pendingRefusals}
            iconLabel="R"
            bgColor={theme.metrics.pendingBg}
            iconColor={theme.metrics.pendingIcon}
          />
          <MetricCard
            title="Zero Dose"
            value={metrics.zeroDoseCases}
            iconLabel="Z"
            bgColor={theme.metrics.zeroDoseBg}
            iconColor={theme.metrics.zeroDoseIcon}
          />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <Pressable
          style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
          onPress={() => router.push('/child/new')}
          accessibilityRole="button"
          accessibilityLabel="Add new child record"
        >
          <Text style={styles.actionBtnIcon}>+</Text>
          <Text style={styles.actionBtnText}>Add New Record</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.actionBtnOutline, pressed && styles.actionBtnPressed]}
          onPress={() => router.push('/(tabs)/children')}
          accessibilityRole="button"
          accessibilityLabel="View all children"
        >
          <Text style={styles.actionBtnOutlineText}>View All Records ({metrics.totalDefaulters})</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    paddingBottom: 40,
  },
  banner: {
    backgroundColor: theme.primary,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    marginBottom: spacing.lg,
  },
  bannerTitle: {
    fontSize: font.size.xxl,
    fontWeight: font.weight.bold,
    color: theme.textOnPrimary,
    marginBottom: spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: font.size.sm,
    color: 'rgba(255,255,255,0.85)',
  },
  setupLink: {
    fontSize: font.size.sm,
    color: '#CCFBF1',
    fontWeight: font.weight.medium,
  },
  metricsSection: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: font.size.lg,
    fontWeight: font.weight.semibold,
    color: theme.text,
    marginBottom: spacing.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  actionsSection: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  actionBtn: {
    backgroundColor: theme.secondary,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 52,
  },
  actionBtnPressed: {
    opacity: 0.8,
  },
  actionBtnIcon: {
    fontSize: font.size.xl,
    color: theme.textOnPrimary,
    fontWeight: font.weight.bold,
  },
  actionBtnText: {
    fontSize: font.size.lg,
    color: theme.textOnPrimary,
    fontWeight: font.weight.semibold,
  },
  actionBtnOutline: {
    borderWidth: 2,
    borderColor: theme.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  actionBtnOutlineText: {
    fontSize: font.size.md,
    color: theme.primary,
    fontWeight: font.weight.semibold,
  },
});
