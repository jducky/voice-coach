import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatMsAsClock } from '../../../shared/utils/formatTime';

type TimerDisplayProps = {
  label: string;
  remainingMs: number;
};

export function TimerDisplay({ label, remainingMs }: TimerDisplayProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.time}>{formatMsAsClock(remainingMs)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
  },
  label: {
    color: '#9db1c8',
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  time: {
    color: '#f5f7fb',
    fontSize: 64,
    fontWeight: '800',
    letterSpacing: 2,
  },
});
