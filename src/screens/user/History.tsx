import React, { useCallback } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import moment from 'moment';
import { PageHeader } from '../../components/PageHeader';
import { AppointmentListItem } from '../../components/AppointmentListItem';
import { EmptyState } from '../../components/EmptyState';
import { appointmentApi } from '../../api/endpoints';
import { usePaginatedList } from '../../hooks/usePaginatedList';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import type { Appointment } from '../../types/models';

import { useFocusEffect } from '@react-navigation/native';

export default function History() {
  const { userDetail } = useAuth();
  const userId = userDetail?.id ?? userDetail?._id;

  const fetchPage = useCallback(
    async (page: number, limit: number) => {
      if (!userId) return [];
      const res: any = await appointmentApi.getHistoryByUserId(userId, { page, limit });
      return (res?.data ?? []) as Appointment[];
    },
    [userId],
  );

  const { items, loading, refreshing, refresh, loadMore } = usePaginatedList<Appointment>(fetchPage);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  return (
    <View style={styles.flex}>
      <PageHeader title="History" />
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
          ListEmptyComponent={<EmptyState message="No appointment history yet." />}
          renderItem={({ item }) => (
            <AppointmentListItem
              title={item.service_provider?.name ?? 'Provider'}
              subtitle={item.purpose_of_visit}
              dateLabel={moment(item.full_date).format('DD MMM YYYY, h:mm A')}
              status={item.status}
              avatarUrl={item.service_provider?.profile}
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
