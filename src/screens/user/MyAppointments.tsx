import React, { useCallback } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import moment from 'moment';
import { Text } from '../../components/Text';
import { PageHeader } from '../../components/PageHeader';
import { AppointmentListItem } from '../../components/AppointmentListItem';
import { EmptyState } from '../../components/EmptyState';
import { appointmentApi } from '../../api/endpoints';
import { usePaginatedList } from '../../hooks/usePaginatedList';
import { colors } from '../../theme/colors';
import type { Appointment } from '../../types/models';
import type { MyAppointmentsStackParamList } from '../../navigation/types';

export default function MyAppointments() {
  const navigation = useNavigation<NativeStackNavigationProp<MyAppointmentsStackParamList>>();

  const fetchPage = useCallback(async (page: number, limit: number) => {
    const res: any = await appointmentApi.getAppointmentByUser({ page, limit });
    return (res?.data ?? []) as Appointment[];
  }, []);

  const { items, loading, refreshing, hasMore, refresh, loadMore } = usePaginatedList<Appointment>(fetchPage);

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
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={[colors.primary]} />}
          onEndReachedThreshold={0.4}
          onEndReached={loadMore}
          ListHeaderComponent={
            items.length > 0 ? <Text style={styles.caption}>Tap a booking to see its full details.</Text> : undefined
          }
          ListFooterComponent={
            hasMore && items.length > 0 ? (
              <ActivityIndicator style={styles.footerLoader} color={colors.primary} />
            ) : undefined
          }
          ListEmptyComponent={
            <EmptyState
              icon="📅"
              title="No appointments yet"
              message="Book a service from the home screen and it will show up here."
            />
          }
          renderItem={({ item }) => (
            <AppointmentListItem
              title={item.service_provider?.name ?? 'Provider'}
              subtitle={item.purpose_of_visit}
              dateLabel={moment(item.full_date).format('DD MMM YYYY, h:mm A')}
              status={item.status}
              avatarUrl={item.service_provider?.profile}
              onPress={() => navigation.navigate('MyAppointmentsDetails', { appointmentId: item._id })}
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
  list: { paddingHorizontal: 20, paddingBottom: 24, flexGrow: 1 },
  caption: { fontSize: 13, color: colors.gray, marginBottom: 14 },
  footerLoader: { marginVertical: 12 },
});
