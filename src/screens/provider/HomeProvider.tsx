import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Text } from '../../components/Text';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import moment from 'moment';
import { PageHeader } from '../../components/PageHeader';
import { AppointmentListItem } from '../../components/AppointmentListItem';
import { EmptyState } from '../../components/EmptyState';
import { appointmentApi, authApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useUi } from '../../context/UiContext';
import { colors } from '../../theme/colors';
import type { Appointment } from '../../types/models';
import type { RootStackParamList } from '../../navigation/types';

interface VisitorsStatus {
  totalAppoint: number;
  pendingAppoint: number;
  completedAppoint: number;
}

export default function HomeProvider() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { userDetail, updateUserDetail } = useAuth();
  const { showToast } = useUi();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [status, setStatus] = useState<VisitorsStatus | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isAvailable, setIsAvailable] = useState(userDetail?.isAvailable !== false);
  const [togglingAvailability, setTogglingAvailability] = useState(false);

  const load = useCallback(async () => {
    try {
      const [statusRes, appointmentsRes]: [any, any] = await Promise.all([
        appointmentApi.getVisitorsStatus(),
        appointmentApi.getAppointmentByProvider({ limit: 5, page: 1 }),
      ]);
      setStatus(statusRes?.data ?? null);
      setAppointments(appointmentsRes?.data ?? []);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Unable to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  function onRefresh() {
    setRefreshing(true);
    load();
  }

  async function toggleAvailability(value: boolean) {
    setIsAvailable(value);
    setTogglingAvailability(true);
    try {
      const formData = new FormData();
      formData.append('isAvailable', String(value));
      const res: any = await authApi.updateProfile(formData);
      if (res?.data && userDetail) {
        await updateUserDetail({ ...userDetail, ...res.data });
      }
    } catch (err) {
      setIsAvailable(!value);
      showToast(err instanceof ApiError ? err.message : 'Unable to update availability');
    } finally {
      setTogglingAvailability(false);
    }
  }

  if (loading) {
    return <ActivityIndicator style={styles.loading} size="large" color={colors.primary} />;
  }

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.scroll}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}>
      <PageHeader title={`Hi, ${userDetail?.name ?? 'Provider'}`} />

      <View style={styles.availabilityRow}>
        <Text style={styles.availabilityLabel}>Available for appointments</Text>
        <Switch
          value={isAvailable}
          onValueChange={toggleAvailability}
          disabled={togglingAvailability}
          trackColor={{ true: colors.primaryAlt, false: colors.grayLight }}
        />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{status?.totalAppoint ?? 0}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{status?.pendingAppoint ?? 0}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{status?.completedAppoint ?? 0}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
        <Text style={styles.seeAll} onPress={() => navigation.navigate('Tabs')}>
          See All
        </Text>
      </View>

      <View style={styles.listWrap}>
        {appointments.length === 0 ? (
          <EmptyState message="No pending appointments." />
        ) : (
          appointments.map(item => (
            <AppointmentListItem
              key={item._id}
              title={item.user?.name ?? 'Visitor'}
              subtitle={item.purpose_of_visit}
              dateLabel={moment(item.full_date).format('DD MMM YYYY, h:mm A')}
              status={item.status}
              avatarUrl={item.user?.profile}
              onPress={() => navigation.navigate('MyAppointmentsDetailsProvider', { appointmentId: item._id })}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.white },
  loading: { flex: 1 },
  scroll: { paddingBottom: 40 },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  availabilityLabel: { fontSize: 14, color: colors.textDark },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  statValue: { fontSize: 22, fontWeight: '700', color: colors.primary },
  statLabel: { fontSize: 12, color: colors.gray, marginTop: 4 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: colors.textDark },
  seeAll: { fontSize: 13, color: colors.primaryAlt, fontWeight: '600' },
  listWrap: { paddingHorizontal: 20 },
});
