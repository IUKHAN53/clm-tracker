import { Link, Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { theme, spacing, font } from '@/constants/Colors';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View style={styles.container}>
        <Text style={styles.title}>This screen doesn't exist.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go to home screen</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: theme.background,
  },
  title: {
    fontSize: font.size.xl,
    fontWeight: font.weight.bold,
    color: theme.text,
  },
  link: {
    marginTop: spacing.lg,
    paddingVertical: spacing.lg,
  },
  linkText: {
    fontSize: font.size.md,
    color: theme.primary,
  },
});
