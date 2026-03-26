import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl, Image } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { theme, spacing, radius, font } from '@/constants/Colors';
import { useChildrenStore } from '@/store/childrenStore';
import MetricCard from '@/components/MetricCard';
import SearchBar from '@/components/SearchBar';

export default function DashboardScreen() {
  const siteInfo = useChildrenStore((s) => s.siteInfo);
  const isLoading = useChildrenStore((s) => s.isLoading);
  const loadData = useChildrenStore((s) => s.loadData);
  const searchQuery = useChildrenStore((s) => s.searchQuery);
  const setSearchQuery = useChildrenStore((s) => s.setSearchQuery);
  const children = useChildrenStore((s) => s.children);

  const metrics = useMemo(() => ({
    totalDefaulters: children.length,
    vaccinated: children.filter((c) => c.vaccinated === 'YES').length,
    pendingRefusals: children.filter((c) => c.category === 'Refusal' && c.vaccinated === 'NO').length,
    zeroDoseCases: children.filter((c) => c.category === 'Zero Dose').length,
  }), [children]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
      <StatusBar style="light" />

      {/* Banner with logos */}
      <View style={styles.banner}>
        <View style={styles.logoRow}>
          <Image source={require('../../assets/images/govt-logo.png')} style={styles.logo} resizeMode="contain" />
          <Image source={require('../../assets/images/epi-logo.png')} style={styles.logoLarge} resizeMode="contain" />
          <Image source={require('../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
        </View>
        <Text style={styles.bannerTitle}>CLM Vaccination Tracker</Text>
        <View style={styles.locationRow}>
          {siteInfo.district ? (
            <>
              <Ionicons name="location" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.locationText}>
                {siteInfo.district} &bull; {siteInfo.uc} &bull; {siteInfo.fixSite}
              </Text>
            </>
          ) : (
            <Pressable
              onPress={() => router.push('/(tabs)/settings')}
              accessibilityRole="button"
              style={styles.setupRow}
            >
              <Ionicons name="location-outline" size={14} color="#CCFBF1" />
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
            icon="people"
            bgColor={theme.metrics.totalBg}
            iconColor={theme.metrics.totalIcon}
          />
          <MetricCard
            title="Vaccinated"
            value={metrics.vaccinated}
            icon="checkmark-circle"
            bgColor={theme.metrics.vaccinatedBg}
            iconColor={theme.metrics.vaccinatedIcon}
          />
        </View>
        <View style={styles.metricsGrid}>
          <MetricCard
            title="Pending / Refusals"
            value={metrics.pendingRefusals}
            icon="close-circle"
            bgColor={theme.metrics.pendingBg}
            iconColor={theme.metrics.pendingIcon}
          />
          <MetricCard
            title="Zero Dose"
            value={metrics.zeroDoseCases}
            icon="alert-circle"
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
          <Ionicons name="add-circle" size={22} color={theme.textOnPrimary} />
          <Text style={styles.actionBtnText}>Add New Record</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.actionBtnOutline, pressed && styles.actionBtnPressed]}
          onPress={() => router.push('/(tabs)/children')}
          accessibilityRole="button"
          accessibilityLabel="View all children"
        >
          <Ionicons name="list" size={18} color={theme.primary} />
          <Text style={styles.actionBtnOutlineText}>View All Records ({metrics.totalDefaulters})</Text>
        </Pressable>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>Powered by EPI & TKF</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    paddingBottom: 100,
  },
  banner: {
    backgroundColor: theme.primary,
    paddingTop: spacing.xxxl + 16,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  logoLarge: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  bannerTitle: {
    fontSize: font.size.xxl,
    fontWeight: font.weight.bold,
    color: theme.textOnPrimary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  locationText: {
    fontSize: font.size.sm,
    color: 'rgba(255,255,255,0.85)',
  },
  setupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 52,
  },
  actionBtnOutlineText: {
    fontSize: font.size.md,
    color: theme.primary,
    fontWeight: font.weight.semibold,
  },
  footer: {
    textAlign: 'center',
    fontSize: font.size.xs,
    color: theme.textMuted,
    marginTop: spacing.xxl,
  },
});
