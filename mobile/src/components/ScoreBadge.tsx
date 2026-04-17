import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from './theme';
import { ScoreName } from '../types';

interface Props {
  strokes: number | null;
  par: number;
  size?: 'sm' | 'md' | 'lg';
}

function getStyle(diff: number): { bg: string; border: string; shape: 'circle' | 'square' | 'none' } {
  if (diff <= -2) return { bg: '#F5C518', border: '#F5C518', shape: 'circle' };  // eagle / albatross
  if (diff === -1) return { bg: Colors.red,     border: Colors.red,     shape: 'circle' };
  if (diff === 0)  return { bg: 'transparent',  border: 'transparent',  shape: 'none'   };
  if (diff === 1)  return { bg: 'transparent',  border: Colors.blue,    shape: 'square' };
  if (diff === 2)  return { bg: Colors.greyDark, border: Colors.blue,   shape: 'square' };
  return              { bg: Colors.red,      border: Colors.red,     shape: 'square' };
}

export function ScoreBadge({ strokes, par, size = 'md' }: Props) {
  if (strokes == null) {
    return <View style={[styles.empty, sizeStyle(size)]}><Text style={styles.dash}>—</Text></View>;
  }

  const diff  = strokes - par;
  const badge = getStyle(diff);
  const sz    = sizeStyle(size);
  const isDouble = Math.abs(diff) >= 2 && badge.shape !== 'none';

  return (
    <View style={[styles.container, sz]}>
      {isDouble && (
        <View style={[styles.outerRing, { borderColor: badge.border, borderRadius: badge.shape === 'circle' ? 99 : 4 }, sz]} />
      )}
      <View style={[
        styles.inner,
        { backgroundColor: badge.bg, borderColor: badge.border },
        badge.shape === 'circle' ? styles.circle : badge.shape === 'square' ? styles.square : styles.none,
        innerSizeStyle(size),
      ]}>
        <Text style={[styles.text, textSizeStyle(size)]}>{strokes}</Text>
      </View>
    </View>
  );
}

function sizeStyle(size: string) {
  if (size === 'sm') return { width: 28, height: 28 };
  if (size === 'lg') return { width: 44, height: 44 };
  return { width: 34, height: 34 };
}
function innerSizeStyle(size: string) {
  if (size === 'sm') return { width: 22, height: 22 };
  if (size === 'lg') return { width: 34, height: 34 };
  return { width: 26, height: 26 };
}
function textSizeStyle(size: string) {
  if (size === 'sm') return { fontSize: 12 };
  if (size === 'lg') return { fontSize: 18 };
  return { fontSize: 14 };
}

const styles = StyleSheet.create({
  container: { justifyContent: 'center', alignItems: 'center' },
  outerRing: {
    position: 'absolute',
    borderWidth: 1.5,
  },
  inner: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  circle:  { borderRadius: 99 },
  square:  { borderRadius: 3 },
  none:    { borderWidth: 0, backgroundColor: 'transparent' },
  text:    { color: Colors.white, fontWeight: '800' },
  empty:   { justifyContent: 'center', alignItems: 'center' },
  dash:    { color: Colors.grey, fontSize: 14 },
});
