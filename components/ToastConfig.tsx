import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme, spacing, radius, font } from '@/constants/Colors';
import { BaseToastProps } from 'react-native-toast-message';

function SuccessToast({ text1, text2 }: BaseToastProps) {
  return (
    <View style={[styles.container, styles.successBorder]}>
      <View style={[styles.iconCircle, { backgroundColor: '#D1FAE5' }]}>
        <Ionicons name="checkmark-circle" size={22} color={theme.status.vaccinated} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{text1}</Text>
        {text2 ? <Text style={styles.message}>{text2}</Text> : null}
      </View>
    </View>
  );
}

function ErrorToast({ text1, text2 }: BaseToastProps) {
  return (
    <View style={[styles.container, styles.errorBorder]}>
      <View style={[styles.iconCircle, { backgroundColor: '#FEE2E2' }]}>
        <Ionicons name="close-circle" size={22} color={theme.status.refusal} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{text1}</Text>
        {text2 ? <Text style={styles.message}>{text2}</Text> : null}
      </View>
    </View>
  );
}

function InfoToast({ text1, text2 }: BaseToastProps) {
  return (
    <View style={[styles.container, styles.infoBorder]}>
      <View style={[styles.iconCircle, { backgroundColor: '#DBEAFE' }]}>
        <Ionicons name="information-circle" size={22} color={theme.primary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{text1}</Text>
        {text2 ? <Text style={styles.message}>{text2}</Text> : null}
      </View>
    </View>
  );
}

function WarningToast({ text1, text2 }: BaseToastProps) {
  return (
    <View style={[styles.container, styles.warningBorder]}>
      <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
        <Ionicons name="warning" size={22} color={theme.status.zeroDose} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{text1}</Text>
        {text2 ? <Text style={styles.message}>{text2}</Text> : null}
      </View>
    </View>
  );
}

export const toastConfig = {
  success: (props: BaseToastProps) => <SuccessToast {...props} />,
  error: (props: BaseToastProps) => <ErrorToast {...props} />,
  info: (props: BaseToastProps) => <InfoToast {...props} />,
  warning: (props: BaseToastProps) => <WarningToast {...props} />,
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    borderRadius: radius.md,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
    gap: spacing.md,
    minHeight: 56,
    maxWidth: 420,
    width: '92%',
  },
  successBorder: { borderLeftColor: theme.status.vaccinated },
  errorBorder: { borderLeftColor: theme.status.refusal },
  infoBorder: { borderLeftColor: theme.primary },
  warningBorder: { borderLeftColor: theme.status.zeroDose },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: font.size.md,
    fontWeight: font.weight.semibold,
    color: theme.text,
  },
  message: {
    fontSize: font.size.sm,
    color: theme.textSecondary,
    lineHeight: 18,
  },
});
