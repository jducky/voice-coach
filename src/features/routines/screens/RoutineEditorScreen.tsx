import React, { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { formatSeconds } from '../../../shared/utils/formatTime';
import type { Routine } from '../types';

type RoutineEditorScreenProps = {
  initialRoutine?: Routine;
  onSave: (draft: Omit<Routine, 'id' | 'createdAt' | 'updatedAt'>) => void;
};

type NumericFieldKey =
  | 'prepareSeconds'
  | 'workSeconds'
  | 'restSeconds'
  | 'roundsPerSet'
  | 'setCount'
  | 'setRestSeconds';

const defaultDraft: Omit<Routine, 'id' | 'createdAt' | 'updatedAt'> = {
  name: 'Custom Routine',
  prepareSeconds: 10,
  workSeconds: 20,
  restSeconds: 10,
  roundsPerSet: 8,
  setCount: 1,
  setRestSeconds: 30,
};

export function RoutineEditorScreen({
  initialRoutine,
  onSave,
}: RoutineEditorScreenProps): React.JSX.Element {
  const [draft, setDraft] = useState<Omit<Routine, 'id' | 'createdAt' | 'updatedAt'>>(
    initialRoutine ? {
      name: initialRoutine.name,
      prepareSeconds: initialRoutine.prepareSeconds,
      workSeconds: initialRoutine.workSeconds,
      restSeconds: initialRoutine.restSeconds,
      roundsPerSet: initialRoutine.roundsPerSet,
      setCount: initialRoutine.setCount,
      setRestSeconds: initialRoutine.setRestSeconds,
    } : defaultDraft,
  );

  const totalSeconds = useMemo(() => {
    const prepare = draft.prepareSeconds;
    const work = draft.workSeconds * draft.roundsPerSet * draft.setCount;
    const rest = draft.restSeconds * Math.max(0, draft.roundsPerSet - 1) * draft.setCount;
    const setRest = draft.setRestSeconds * Math.max(0, draft.setCount - 1);
    return prepare + work + rest + setRest;
  }, [draft]);

  const updateNumericField = (key: NumericFieldKey, rawValue: string) => {
    const nextValue = Number.parseInt(rawValue, 10);
    setDraft((current) => ({
      ...current,
      [key]: Number.isNaN(nextValue) ? 0 : Math.max(0, nextValue),
    }));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{initialRoutine ? 'Edit Routine' : 'Create Routine'}</Text>

        <View style={styles.form}>
          <Field label="Name">
            <TextInput
              value={draft.name}
              onChangeText={(name) => setDraft((current) => ({ ...current, name }))}
              style={styles.input}
              placeholder="Morning HIIT"
              placeholderTextColor="#60758d"
            />
          </Field>

          <NumberField label="Prepare" value={draft.prepareSeconds} onChangeText={(value) => updateNumericField('prepareSeconds', value)} />
          <NumberField label="Work" value={draft.workSeconds} onChangeText={(value) => updateNumericField('workSeconds', value)} />
          <NumberField label="Rest" value={draft.restSeconds} onChangeText={(value) => updateNumericField('restSeconds', value)} />
          <NumberField label="Rounds" value={draft.roundsPerSet} onChangeText={(value) => updateNumericField('roundsPerSet', value)} />
          <NumberField label="Sets" value={draft.setCount} onChangeText={(value) => updateNumericField('setCount', value)} />
          <NumberField label="Set Rest" value={draft.setRestSeconds} onChangeText={(value) => updateNumericField('setRestSeconds', value)} />
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryLabel}>Estimated Total Time</Text>
          <Text style={styles.summaryValue}>{formatSeconds(totalSeconds)}</Text>
        </View>

        <Pressable style={styles.saveButton} onPress={() => onSave(draft)}>
          <Text style={styles.saveButtonText}>Save Routine</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

type FieldProps = {
  label: string;
  children: React.ReactNode;
};

function Field({ label, children }: FieldProps): React.JSX.Element {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

type NumberFieldProps = {
  label: string;
  value: number;
  onChangeText: (value: string) => void;
};

function NumberField({ label, value, onChangeText }: NumberFieldProps): React.JSX.Element {
  return (
    <Field label={label}>
      <TextInput
        value={String(value)}
        onChangeText={onChangeText}
        style={styles.input}
        keyboardType="number-pad"
        placeholder="0"
        placeholderTextColor="#60758d"
      />
    </Field>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#08131d',
  },
  content: {
    padding: 20,
    gap: 20,
  },
  title: {
    color: '#f5f7fb',
    fontSize: 28,
    fontWeight: '800',
  },
  form: {
    gap: 16,
  },
  field: {
    gap: 8,
  },
  fieldLabel: {
    color: '#9db1c8',
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#10202d',
    borderRadius: 14,
    color: '#f5f7fb',
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  summary: {
    backgroundColor: '#0e1b27',
    borderRadius: 18,
    padding: 18,
    gap: 4,
  },
  summaryLabel: {
    color: '#9db1c8',
    fontSize: 14,
  },
  summaryValue: {
    color: '#f5f7fb',
    fontSize: 26,
    fontWeight: '800',
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: '#f25f4c',
    borderRadius: 16,
    paddingVertical: 14,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
