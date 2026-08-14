import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Text } from '../../components/Text';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PrimaryButton } from '../../components/PrimaryButton';
import { appointmentApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import { colors } from '../../theme/colors';
import type { Appointment } from '../../types/models';
import type { RootStackParamList } from '../../navigation/types';

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export default function PaymentSuccess() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'PaymentSuccess'>>();
  const { appointmentId } = route.params;

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res: any = await appointmentApi.getRequestAppointmentById(appointmentId);
        if (mounted) setAppointment(res?.data ?? null);
      } catch (err) {
        if (mounted) setError(err instanceof ApiError ? err.message : 'Something went wrong');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [appointmentId]);

  if (loading) {
    return <ActivityIndicator style={styles.loading} size="large" color={colors.primary} />;
  }

  if (error || !appointment) {
    return (
      <View style={styles.loading}>
        <Text style={styles.errorText}>{error ?? 'Appointment not found'}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>✓</Text>
      </View>
      <Text style={styles.title}>Appointment Confirmed</Text>

      <View style={styles.ticket}>
        <DetailRow label="Name" value={appointment.name} />
        <DetailRow label="Ticket Number" value={appointment.ticketNumber ?? '-'} />
        <DetailRow label="Phone" value={appointment.phone} />
        <DetailRow label="Gender" value={appointment.gender} />
        <DetailRow label="Purpose of Visit" value={appointment.purpose_of_visit} />
      </View>

      <PrimaryButton title="Go to Home" style={styles.button} onPress={() => navigation.navigate('Tabs')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: colors.gray, fontSize: 14 },
  scroll: { padding: 20, alignItems: 'center' },
  badge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  badgeText: { fontSize: 32, color: colors.primary, fontWeight: '700' },
  title: { fontSize: 20, fontWeight: '700', color: colors.textDarker, marginTop: 16 },
  ticket: { width: '100%', marginTop: 30 },
  row: { marginBottom: 16 },
  label: { fontSize: 13, color: colors.gray, marginBottom: 4 },
  value: { fontSize: 16, color: colors.textDark, fontWeight: '600' },
  button: { width: '100%', marginTop: 20 },
});
