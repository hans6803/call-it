import React from 'react';
import {
  TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle,
} from 'react-native';
import { Colors, Radius, MIN_TOUCH } from './theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function Button({
  label, onPress, variant = 'primary', loading, disabled, style, textStyle, fullWidth,
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[
        styles.base,
        styles[variant],
        fullWidth && { width: '100%' },
        isDisabled && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {loading
        ? <ActivityIndicator color={variant === 'primary' ? Colors.white : Colors.blue} />
        : <Text style={[styles.text, styles[`${variant}Text`] as TextStyle, textStyle]}>{label}</Text>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: MIN_TOUCH,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  primary:       { backgroundColor: Colors.blue },
  secondary:     { backgroundColor: Colors.greyDark, borderWidth: 1, borderColor: Colors.blueLight },
  ghost:         { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.blueLight },
  danger:        { backgroundColor: Colors.red },
  disabled:      { opacity: 0.45 },

  text:          { fontSize: 16, fontWeight: '700' },
  primaryText:   { color: Colors.white },
  secondaryText: { color: Colors.white },
  ghostText:     { color: Colors.white },
  dangerText:    { color: Colors.white },
});
