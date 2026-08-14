import React, { useCallback } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import moment from 'moment';
import { PageHeader } from '../../components/PageHeader';
import { AppointmentListItem } from '../../components/AppointmentListItem';
import { EmptyState } from '../../components/EmptyState';
import { appointmentApi } from '../../api/endpoints';
import { usePaginatedList } from '../../hooks/usePaginatedList';
import { colors } from '../../theme/colors';
import type { Appointment } from '../../types/models';
import type { MyAppointmentsProviderStackParamList } from '../../navigation/types';

export default function MyAppointmentsProvider() {
  const navigation = useNavigation<NativeStackNavigationProp<MyAppointmentsProviderStackParamList>>();

  const fetchPage = useCallback(async (page: number, limit: number) => {
    const res: any = await appointmentApi.getAppointmentByProvider({ page, limit });
    return (res?.data ?? []) as Appointment[];
  }, []);

  const { items, loading, refreshing, refresh, loadMore } = usePaginatedList<Appointment>(fetchPage);

  return (
    <View style={styles.flex}>
      <PageHeader title="Appointments" />
      {loading ? (
        <ActivityIndicator style={styles.loading} size="large" color={colors.primary} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={[colors.primary]} />}
          onEndReachedThreshold={0.4}
          onEndReached={loadMore}
          ListEmptyComponent={<EmptyState message="No pending appointments." />}
          renderItem={({ item }) => (
            <AppointmentListItem
              title={item.user?.name ?? 'Visitor'}
              subtitle={item.purpose_of_visit}
              dateLabel={moment(item.full_date).format('DD MMM YYYY, h:mm A')}
              status={item.status}
              avatarUrl={item.user?.profile}
              onPress={() => navigation.navigate('MyAppointmentsDetailsProvider', { appointmentId: item._id })}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.white },
  loading: { flex: 1 },
  list: { padding: 20, flexGrow: 1 },
});
