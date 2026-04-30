import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { RoutineCard } from '../components/RoutineCard';
import { useRoutineStore } from '../store/routineStore';
import { useSessionStore } from '../../session/store/sessionStore';

type HomeScreenProps = {
  onOpenSettings?: () => void;
  onOpenSession?: () => void;
};

export function HomeScreen({ onOpenSettings, onOpenSession }: HomeScreenProps): React.JSX.Element {
  const routines = useRoutineStore((state) => state.routines);
  const recentRoutineId = useRoutineStore((state) => state.recentRoutineId);
  const markRoutineStarted = useRoutineStore((state) => state.markRoutineStarted);
  const startSession = useSessionStore((state) => state.start);

  const recentRoutine = routines.find((routine) => routine.id === recentRoutineId) ?? routines[0] ?? null;
  const otherRoutines = routines.filter((routine) => routine.id !== recentRoutine?.id);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>Tabata Voice Coach</Text>
          <Text style={styles.title}>Start fast. Keep your eyes off the screen.</Text>
          <Text style={styles.subtitle}>
            The timer engine is ready. Next step is wiring navigation and voice events on top of this scaffold.
          </Text>
        </View>

        {recentRoutine ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Routine</Text>
            <RoutineCard
              routine={recentRoutine}
              onStart={(routine) => {
                markRoutineStarted(routine.id);
                startSession(routine);
                onOpenSession?.();
              }}
            />
          </View>
        ) : null}

        {otherRoutines.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Saved Routines</Text>
            <View style={styles.list}>
              {otherRoutines.map((routine) => (
                <RoutineCard
                  key={routine.id}
                  routine={routine}
                  onStart={(nextRoutine) => {
                    markRoutineStarted(nextRoutine.id);
                    startSession(nextRoutine);
                    onOpenSession?.();
                  }}
                />
              ))}
            </View>
          </View>
        ) : null}

        {onOpenSettings ? (
          <Pressable style={styles.settingsButton} onPress={onOpenSettings}>
            <Text style={styles.settingsButtonText}>Open Settings</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#08131d',
  },
  content: {
    padding: 20,
    gap: 24,
  },
  hero: {
    backgroundColor: '#0e1b27',
    borderRadius: 28,
    padding: 24,
    gap: 10,
  },
  kicker: {
    color: '#f25f4c',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    color: '#f5f7fb',
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 36,
  },
  subtitle: {
    color: '#9db1c8',
    fontSize: 15,
    lineHeight: 22,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: '#f5f7fb',
    fontSize: 18,
    fontWeight: '700',
  },
  list: {
    gap: 12,
  },
  settingsButton: {
    alignItems: 'center',
    backgroundColor: '#13212f',
    borderRadius: 16,
    paddingVertical: 14,
  },
  settingsButtonText: {
    color: '#dce6f2',
    fontSize: 16,
    fontWeight: '700',
  },
});
