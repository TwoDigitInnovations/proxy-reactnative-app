import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Text } from './Text';
import { contentApi } from '../api/endpoints';
import { ApiError } from '../api/client';
import { colors } from '../theme/colors';
import { parseRichText, type RichBlock } from '../utils/richText';
import { LEGAL_LAST_UPDATED, sectionsToBlocks, type LegalSection } from '../content/legal';

const MIN_REMOTE_LENGTH = 400;

function isPublishedContent(blocks: RichBlock[]): boolean {
  return blocks.reduce((total, block) => total + block.text.length, 0) >= MIN_REMOTE_LENGTH;
}

function Block({ block }: { block: RichBlock }) {
  if (block.type === 'heading') {
    return (
      <Text style={styles.heading} accessibilityRole="header">
        {block.text}
      </Text>
    );
  }

  if (block.type === 'bullet') {
    return (
      <View style={styles.bulletRow}>
        <Text style={styles.bulletDot}>•</Text>
        <Text style={styles.bulletText}>{block.text}</Text>
      </View>
    );
  }

  return <Text style={styles.paragraph}>{block.text}</Text>;
}

interface LegalDocumentProps {
  field: 'termsAndConditions' | 'privacy';
  fallbackSections: LegalSection[];
  errorLabel: string;
  footer?: string;
}

export function LegalDocument({ field, fallbackSections, errorLabel, footer }: LegalDocumentProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const mounted = useRef(true);
  const fallbackBlocks = useRef(sectionsToBlocks(fallbackSections)).current;

  const [blocks, setBlocks] = useState<RichBlock[]>(fallbackBlocks);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res: any = await contentApi.getContent();
      const parsed = parseRichText(res?.data?.[field] ?? '');
      if (!mounted.current) return;
      setBlocks(isPublishedContent(parsed) ? parsed : fallbackBlocks);
    } catch (err) {
      if (!mounted.current) return;
      setError(
        err instanceof ApiError
          ? err.message
          : t('Unable to load the latest {{document}}.', { document: errorLabel }),
      );
      setBlocks(fallbackBlocks);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [field, errorLabel, fallbackBlocks, t]);

  useEffect(() => {
    mounted.current = true;
    load();
    return () => {
      mounted.current = false;
    };
  }, [load]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}>

      {error ? (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            {error} {t('Showing the version included with this app.')}
          </Text>
          <TouchableOpacity onPress={load} accessibilityRole="button" hitSlop={styles.hitSlop}>
            <Text style={styles.noticeAction}>{t('Retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {blocks.map((block, index) => (
        <Block key={`${block.type}-${index}`} block={block} />
      ))}

      <Text style={styles.lastUpdated}>
        {t('Last updated {{date}}', { date: LEGAL_LAST_UPDATED })}
      </Text>

      {footer ? <Text style={styles.footer}>{footer}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.white },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white },
  scroll: { padding: 20 },
  hitSlop: { top: 8, bottom: 8, left: 8, right: 8 },
  lastUpdated: { fontSize: 12, color: colors.gray, marginBottom: 16 },
  notice: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.backgroundLightAlt,
    padding: 12,
    marginBottom: 20,
  },
  noticeText: { fontSize: 13, lineHeight: 19, color: colors.textDark },
  noticeAction: { fontSize: 13, fontWeight: '600', color: colors.primary, marginTop: 8 },
  heading: { fontSize: 16, fontWeight: '600', color: colors.textDarker, marginTop: 22, marginBottom: 8 },
  paragraph: { fontSize: 14, lineHeight: 22, color: colors.textDark, marginBottom: 10 },
  bulletRow: { flexDirection: 'row', marginBottom: 8, paddingRight: 4 },
  bulletDot: { fontSize: 14, lineHeight: 22, color: colors.textDark, width: 18, textAlign: 'center' },
  bulletText: { flex: 1, fontSize: 14, lineHeight: 22, color: colors.textDark },
  footer: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.gray,
    marginTop: 28,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.backgroundLightAlt,
  },
});
