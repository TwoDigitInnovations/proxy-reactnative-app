import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { colors } from '../theme/colors';

export function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  text: { fontSize: 14, color: colors.gray, textAlign: 'center' },
});
