import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

import { theme, font } from '@/constants/Colors';

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <View style={[tabIconStyles.container, focused && tabIconStyles.focused]}>
      <Text style={[tabIconStyles.text, focused && tabIconStyles.textFocused]}>
        {label}
      </Text>
    </View>
  );
}

const tabIconStyles = StyleSheet.create({
  container: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  focused: {
    backgroundColor: theme.primary + '15',
  },
  text: {
    fontSize: 18,
    color: theme.textMuted,
  },
  textFocused: {
    color: theme.primary,
  },
});

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: font.size.xs,
          fontWeight: font.weight.medium,
        },
        headerStyle: {
          backgroundColor: theme.background,
        },
        headerTintColor: theme.text,
        headerTitleStyle: {
          fontWeight: font.weight.semibold,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon label="&#9776;" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="children"
        options={{
          title: 'Records',
          tabBarIcon: ({ focused }) => (
            <TabIcon label="&#128203;" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => (
            <TabIcon label="&#9881;" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
