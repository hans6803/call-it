import React, { useState } from 'react';
import {
  View, TextInput as RNInput, Text, TouchableOpacity, StyleSheet, ViewStyle,
} from 'react-native';
import { Colors, Radius, MIN_TOUCH } from './theme';

interface Props {
  label?: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  error?: string;
  style?: ViewStyle;
  editable?: boolean;
}

export function TextInput({
  label, value, onChangeText, placeholder, secureTextEntry,
  autoCapitalize = 'none', keyboardType = 'default', error, style, editable = true,
}: Props) {
  const [secure, setSecure] = useState(secureTextEntry ?? false);

  return (
    <View style={[styles.wrapper, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.row, !!error && styles.rowError]}>
        <RNInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.grey}
          secureTextEntry={secure}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          editable={editable}
          style={styles.input}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setSecure(s => !s)} style={styles.eye}>
            <Text style={styles.eyeIcon}>{secure ? '🙈' : '👁'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 4 },
  label: { fontSize: 12, color: Colors.grey, fontWeight: '600', letterSpacing: 0.5 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.greyDark,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.greyMid,
    minHeight: MIN_TOUCH,
    paddingHorizontal: 14,
  },
  rowError: { borderColor: Colors.red },
  input: {
    flex: 1,
    color: Colors.white,
    fontSize: 16,
    paddingVertical: 12,
  },
  eye: { padding: 8 },
  eyeIcon: { fontSize: 16 },
  error: { fontSize: 12, color: Colors.red },
});
