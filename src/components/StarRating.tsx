import React from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Star } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Text } from './Text';
import { colors } from '../theme/colors';

interface StarRatingProps {
  rating: number;
  size?: number;
  gap?: number;
  onChange?: (rating: number) => void;
  style?: StyleProp<ViewStyle>;
}

function FilledPortion({ size, fraction }: { size: number; fraction: number }) {
  if (fraction <= 0) return null;
  return (
    <View style={[styles.fillOverlay, { width: size * fraction, height: size }]}>
      <Star size={size} color={colors.star} fill={colors.star} />
    </View>
  );
}

export function StarRating({ rating, size = 16, gap = 3, onChange, style }: StarRatingProps) {
  const { t } = useTranslation();
  const safeRating = Number.isFinite(rating) ? Math.min(Math.max(rating, 0), 5) : 0;

  return (
    <View style={[styles.row, { gap }, style]}>
      {[1, 2, 3, 4, 5].map(position => {
        const fraction = Math.min(Math.max(safeRating - (position - 1), 0), 1);
        const star = (
          <View style={{ width: size, height: size }}>
            <Star size={size} color={colors.starEmpty} fill="transparent" />
            <FilledPortion size={size} fraction={fraction} />
          </View>
        );

        if (!onChange) return <View key={position}>{star}</View>;

        return (
          <TouchableOpacity
            key={position}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={t('Rate {{value}} out of 5', { value: position })}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            onPress={() => onChange(position)}>
            {star}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

interface RatingStatProps {
  average?: number;
  count?: number;
  size?: number;
  starsOnly?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Stars plus the average and how many reviews it is based on. */
export function RatingStat({ average = 0, count = 0, size = 14, starsOnly, style }: RatingStatProps) {
  const { t } = useTranslation();
  return (
    <View style={[styles.statRow, style]}>
      <StarRating rating={average} size={size} />
      {starsOnly ? null : count > 0 ? (
        <Text style={[styles.statText, { fontSize: size - 1 }]}>
          {average.toFixed(1)} ({count})
        </Text>
      ) : (
        <Text style={[styles.statTextEmpty, { fontSize: size - 1 }]}>{t('No reviews yet')}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  fillOverlay: { position: 'absolute', top: 0, left: 0, overflow: 'hidden' },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { color: colors.textDark, fontWeight: '600' },
  statTextEmpty: { color: colors.grayLight },
});
