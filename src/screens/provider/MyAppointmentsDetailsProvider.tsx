import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, View } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Text } from '../../components/Text';
import moment from 'moment';
import { PrimaryButton } from '../../components/PrimaryButton';
import { appointmentApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import { useUi } from '../../context/UiContext';
import { colors } from '../../theme/colors';
import type { Appointment } from '../../types/models';
import type { MyAppointmentsProviderStackParamList } from '../../navigation/types';

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export default function MyAppointmentsDetailsProvider() {
  const route = useRoute<RouteProp<MyAppointmentsProviderStackParamList, 'MyAppointmentsDetailsProvider'>>();
  const { appointmentId } = route.params;
  const { showLoading, hideLoading, showToast } = useUi();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res: any = await appointmentApi.getRequestAppointmentByProviderId(appointmentId);
      setAppointment(res?.data ?? null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [appointmentId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleComplete() {
    showLoading();
    try {
      await appointmentApi.updateAppointmentStatusByProvider({ status: 'Completed', id: appointmentId });
      showToast('Appointment marked as completed');
      await load();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      hideLoading();
    }
  }

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
      {appointment.user?.profile ? (
        <Image source={{ uri: appointment.user.profile }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Text style={styles.avatarInitial}>{(appointment.user?.name ?? appointment.name ?? 'V').charAt(0).toUpperCase()}</Text>
        </View>
      )}
      <Text style={styles.name}>{appointment.name}</Text>

      <View style={styles.section}>
        <DetailRow label="Phone" value={appointment.phone} />
        <DetailRow label="Gender" value={appointment.gender} />
        <DetailRow label="Check-in Time" value={moment(appointment.full_date).format('DD MMM YYYY, h:mm A')} />
        <DetailRow label="Purpose of Visit" value={appointment.purpose_of_visit} />
        <DetailRow label="Status" value={appointment.status} />
      </View>

      {appointment.status === 'Pending' ? (
        <PrimaryButton title="Mark as Completed" onPress={handleComplete} style={styles.button} />
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: colors.gray, fontSize: 14 },
  scroll: { padding: 20, alignItems: 'center' },
  avatar: { width: 96, height: 96, borderRadius: 48, marginBottom: 12 },
  avatarPlaceholder: { backgroundColor: colors.backgroundLight, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { color: colors.primary, fontSize: 32, fontWeight: '700' },
  name: { fontSize: 18, fontWeight: '700', color: colors.textDark },
  section: { width: '100%', marginTop: 20 },
  row: { marginBottom: 16 },
  label: { fontSize: 13, color: colors.gray, marginBottom: 4 },
  value: { fontSize: 16, color: colors.textDark, fontWeight: '600' },
  button: { width: '100%', marginTop: 20 },
});
