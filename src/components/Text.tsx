import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { fontFamilies } from '../theme/typography';

function pickFamily(weight?: string | number): string {
  const w = String(weight ?? '400');
  if (w === '700' || w === 'bold') return fontFamilies.roboto.bold;
  if (w === '600') return fontFamilies.roboto.semibold;
  if (w === '500') return fontFamilies.roboto.medium;
  return fontFamilies.roboto.regular;
}

export function Text({ style, ...rest }: TextProps) {
  const flat = StyleSheet.flatten(style) || {};
  const fontFamily = flat.fontFamily ?? pickFamily(flat.fontWeight);
  return <RNText style={[style, { fontFamily }]} {...rest} />;
}
