import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Text } from '../../components/Text';
import moment from 'moment';
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

export default function PurposeOfVisit() {
  const route = useRoute<RouteProp<RootStackParamList, 'PurposeOfVisit'>>();
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
      <DetailRow label="Name" value={appointment.name} />
      <DetailRow label="Phone" value={appointment.phone} />
      <DetailRow label="Gender" value={appointment.gender} />
      <DetailRow label="Check-in Time" value={moment(appointment.full_date).format('DD MMM YYYY, h:mm A')} />
      <DetailRow label="Purpose of Visit" value={appointment.purpose_of_visit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: colors.gray, fontSize: 14 },
  scroll: { padding: 20 },
  row: { marginBottom: 20 },
  label: { fontSize: 13, color: colors.gray, marginBottom: 4 },
  value: { fontSize: 16, color: colors.textDark, fontWeight: '600' },
});
