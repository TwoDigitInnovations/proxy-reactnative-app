import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { Text } from '../../components/Text';
import { contentApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import { colors } from '../../theme/colors';

function stripHtml(html: string) {
  return html
    .replace(/<[^>]+>/g, '\n')
    .replace(/\n{2,}/g, '\n\n')
    .trim();
}

export default function TermsAndConditions() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res: any = await contentApi.getContent();
        if (mounted) setContent(stripHtml(res?.data?.termsAndConditions ?? ''));
      } catch (err) {
        if (mounted) setContent(err instanceof ApiError ? err.message : 'Unable to load content');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <ActivityIndicator style={styles.loading} size="large" color={colors.primary} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Text style={styles.text}>{content}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1 },
  scroll: { padding: 20 },
  text: { fontSize: 14, lineHeight: 22, color: colors.textDark },
});
