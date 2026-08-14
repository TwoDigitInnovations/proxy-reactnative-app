import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from './Text';
import { colors } from '../theme/colors';

interface AppointmentListItemProps {
  title: string;
  subtitle?: string;
  dateLabel: string;
  status: 'Pending' | 'Completed';
  avatarUrl?: string;
  onPress?: () => void;
}

export function AppointmentListItem({ title, subtitle, dateLabel, status, avatarUrl, onPress }: AppointmentListItemProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} disabled={!onPress} activeOpacity={0.8}>
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Text style={styles.avatarInitial}>{title.charAt(0).toUpperCase()}</Text>
        </View>
      )}
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
        <Text style={styles.date}>{dateLabel}</Text>
      </View>
      <View style={[styles.statusPill, status === 'Completed' ? styles.statusCompleted : styles.statusPending]}>
        <Text style={styles.statusText}>{status}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.backgroundLightAlt,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  avatarPlaceholder: { backgroundColor: colors.backgroundLight, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { color: colors.primary, fontSize: 18, fontWeight: '700' },
  body: { flex: 1 },
  title: { fontSize: 15, fontWeight: '600', color: colors.textDark },
  subtitle: { fontSize: 13, color: colors.gray, marginTop: 2 },
  date: { fontSize: 12, color: colors.grayAlt, marginTop: 4 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, marginLeft: 8 },
  statusPending: { backgroundColor: colors.backgroundLight },
  statusCompleted: { backgroundColor: '#DDF5E0' },
  statusText: { fontSize: 11, fontWeight: '600', color: colors.textDark },
});
