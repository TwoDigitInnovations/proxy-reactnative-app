import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Text } from '../../components/Text';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PrimaryButton } from '../../components/PrimaryButton';
import { appointmentApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import { colors } from '../../theme/colors';
import type { Appointment } from '../../types/models';
import type { MyAppointmentsStackParamList } from '../../navigation/types';

export default function MyAppointmentsDetails() {
  const navigation = useNavigation<NativeStackNavigationProp<MyAppointmentsStackParamList>>();
  const route = useRoute<RouteProp<MyAppointmentsStackParamList, 'MyAppointmentsDetails'>>();
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

  const provider = appointment.service_provider;

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      {provider?.profile ? (
        <Image source={{ uri: provider.profile }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Text style={styles.avatarInitial}>{(provider?.name ?? 'P').charAt(0).toUpperCase()}</Text>
        </View>
      )}
      <Text style={styles.name}>{provider?.name ?? 'Service Provider'}</Text>
      {provider?.phone ? <Text style={styles.meta}>{provider.phone}</Text> : null}

      {provider?.about_us ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.sectionText}>{provider.about_us}</Text>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Purpose of visit</Text>
        <Text style={styles.sectionText}>{appointment.purpose_of_visit}</Text>
      </View>

      <PrimaryButton
        title="View Purpose of Visit"
        style={styles.button}
        onPress={() => navigation.navigate('PurposeOfVisit', { appointmentId })}
      />
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
  meta: { fontSize: 14, color: colors.gray, marginTop: 4 },
  section: { width: '100%', marginTop: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: colors.textDark, marginBottom: 6 },
  sectionText: { fontSize: 14, color: colors.gray, lineHeight: 20 },
  button: { width: '100%', marginTop: 30 },
});
