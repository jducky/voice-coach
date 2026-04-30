import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Routine } from '../types';
import { formatSeconds } from '../../../shared/utils/formatTime';

type RoutineCardProps = {
  routine: Routine;
  onStart: (routine: Routine) => void;
  onEdit?: (routine: Routine) => void;
};

export function RoutineCard({ routine, onStart, onEdit }: RoutineCardProps): React.JSX.Element {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{routine.name}</Text>
        <Text style={styles.subtitle}>
          {formatSeconds(routine.workSeconds)} / {formatSeconds(routine.restSeconds)} / {routine.roundsPerSet} rounds
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.primaryButton} onPress={() => onStart(routine)}>
          <Text style={styles.primaryButtonText}>Start</Text>
        </Pressable>
        {onEdit ? (
          <Pressable style={styles.secondaryButton} onPress={() => onEdit(routine)}>
            <Text style={styles.secondaryButtonText}>Edit</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#13212f',
    borderRadius: 18,
    padding: 16,
    gap: 12,
  },
  header: {
    gap: 4,
  },
  title: {
    color: '#f5f7fb',
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    color: '#9db1c8',
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    backgroundColor: '#f25f4c',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#1d3347',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: '#dce6f2',
    fontWeight: '600',
  },
});
