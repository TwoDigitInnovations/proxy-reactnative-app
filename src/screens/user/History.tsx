import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/PageHeader';
import { AppointmentListItem } from '../../components/AppointmentListItem';
import { EmptyState } from '../../components/EmptyState';
import { Text } from '../../components/Text';
import { StarRating } from '../../components/StarRating';
import { RateAppointmentSheet } from '../../components/RateAppointmentSheet';
import { Icon } from '../../components/Icon';
import { appointmentApi } from '../../api/endpoints';
import { usePaginatedList } from '../../hooks/usePaginatedList';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import type { Appointment } from '../../types/models';

import { useFocusEffect } from '@react-navigation/native';

export default function History() {
  const { t } = useTranslation();
  const { userDetail } = useAuth();
  const userId = userDetail?.id ?? userDetail?._id;

  const [ratingTarget, setRatingTarget] = useState<Appointment | null>(null);

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

  function renderRatingFooter(item: Appointment) {
    if (item.status !== 'Completed') return null;

    if (item.review) {
      return (
        <View style={styles.ratingRow}>
          <View style={styles.ratedWrap}>
            <StarRating rating={item.review.rating} size={15} />
            <Text style={styles.ratedText}>{t('You rated this visit')}</Text>
          </View>
          <TouchableOpacity onPress={() => setRatingTarget(item)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.editText}>{t('Edit')}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.ratingRow}>
        <Text style={styles.ratePrompt}>{t('How was your visit?')}</Text>
        <TouchableOpacity style={styles.rateBtn} activeOpacity={0.8} onPress={() => setRatingTarget(item)}>
          <Icon name="star" size={14} color={colors.primaryAlt} />
          <Text style={styles.rateBtnText}>{t('Rate')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <PageHeader title={t('History')} />
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
          ListEmptyComponent={<EmptyState message={t('No appointment history yet.')} />}
          renderItem={({ item }) => (
            <AppointmentListItem
              title={item.service_provider?.name ?? t('Provider')}
              subtitle={item.purpose_of_visit}
              dateLabel={moment(item.full_date).format('DD MMM YYYY, h:mm A')}
              status={item.status}
              avatarUrl={item.service_provider?.profile}
              footer={renderRatingFooter(item)}
            />
          )}
        />
      )}

      <RateAppointmentSheet
        visible={!!ratingTarget}
        appointment={ratingTarget}
        onClose={() => setRatingTarget(null)}
        onSubmitted={refresh}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.white },
  loading: { flex: 1 },
  list: { padding: 20, flexGrow: 1 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  ratedWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  ratedText: { fontSize: 12, color: colors.grayAlt },
  editText: { fontSize: 12, fontWeight: '600', color: colors.primaryAlt },
  ratePrompt: { flex: 1, fontSize: 12, color: colors.grayAlt },
  rateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: colors.primaryAlt,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  rateBtnText: { fontSize: 13, fontWeight: '700', color: colors.primaryAlt },
});
