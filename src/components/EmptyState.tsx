import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { colors } from '../theme/colors';

export function EmptyState({ message, title, icon }: { message: string; title?: string; icon?: string }) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Text style={styles.icon}>{icon ?? '📋'}</Text>
      </View>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  icon: { fontSize: 28 },
  title: { fontSize: 16, fontWeight: '600', color: colors.textDarker, marginBottom: 6, textAlign: 'center' },
  text: { fontSize: 14, color: colors.gray, textAlign: 'center', lineHeight: 20 },
});
