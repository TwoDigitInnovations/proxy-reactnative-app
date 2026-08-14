import React from 'react';
import { ActivityIndicator, StyleSheet, TextStyle, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { Text } from './Text';
import { colors } from '../theme/colors';

interface PrimaryButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  textStyle?: TextStyle;
}

export function PrimaryButton({ title, loading, style, textStyle, disabled, ...rest }: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, (disabled || loading) && styles.buttonDisabled, style]}
      disabled={disabled || loading}
      activeOpacity={0.85}
      {...rest}>
      {loading ? <ActivityIndicator color={colors.white} /> : <Text style={[styles.title, textStyle]}>{title}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primaryAlt,
    borderRadius: 10,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  title: { color: colors.white, fontSize: 16 },
});
