import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Text } from './Text';
import { colors } from '../theme/colors';

export type AppointmentStatus = 'Pending' | 'Completed';

export function StatusPill({ status, style }: { status: AppointmentStatus; style?: StyleProp<ViewStyle> }) {
  const completed = status === 'Completed';
  return (
    <View style={[styles.pill, completed ? styles.pillCompleted : styles.pillPending, style]}>
      <View style={[styles.dot, completed ? styles.dotCompleted : styles.dotPending]} />
      <Text style={[styles.text, completed ? styles.textCompleted : styles.textPending]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  pillPending: { backgroundColor: colors.backgroundLight },
  pillCompleted: { backgroundColor: colors.successLight },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotPending: { backgroundColor: colors.primary },
  dotCompleted: { backgroundColor: colors.success },
  text: { fontSize: 11, fontWeight: '600' },
  textPending: { color: colors.primary },
  textCompleted: { color: colors.success },
});
