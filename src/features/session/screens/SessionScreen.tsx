import React from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useSessionTicker } from '../hooks/useSessionTicker';
import { useSessionStore } from '../store/sessionStore';
import { TimerDisplay } from '../components/TimerDisplay';

function getStatusLabel(status: string): string {
  switch (status) {
    case 'preparing':
      return 'Prepare';
    case 'working':
      return 'Work';
    case 'resting':
      return 'Rest';
    case 'setResting':
      return 'Set Rest';
    case 'paused':
      return 'Paused';
    case 'completed':
      return 'Complete';
    default:
      return 'Idle';
  }
}

type SessionScreenProps = {
  onExit?: () => void;
};

export function SessionScreen({ onExit }: SessionScreenProps): React.JSX.Element {
  useSessionTicker();

  const snapshot = useSessionStore((state) => state.snapshot);
  const pause = useSessionStore((state) => state.pause);
  const resume = useSessionStore((state) => state.resume);
  const stop = useSessionStore((state) => state.stop);
  const clearCompleted = useSessionStore((state) => state.clearCompleted);

  if (!snapshot) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No active session</Text>
          <Text style={styles.emptySubtitle}>Start a routine from the home screen.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const actionLabel = snapshot.status === 'paused' ? 'Resume' : 'Pause';
  const actionHandler = snapshot.status === 'paused' ? resume : pause;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.status}>{getStatusLabel(snapshot.status)}</Text>
        <TimerDisplay label="Remaining" remainingMs={snapshot.remainingPhaseMs} />

        <View style={styles.meta}>
          <MetaCard label="Round" value={`${snapshot.currentRound} / ${snapshot.totalRounds}`} />
          <MetaCard label="Set" value={`${snapshot.currentSet} / ${snapshot.totalSets}`} />
        </View>

        <View style={styles.actions}>
          {!snapshot.isCompleted ? (
            <Pressable style={styles.primaryButton} onPress={() => actionHandler()}>
              <Text style={styles.primaryButtonText}>{actionLabel}</Text>
            </Pressable>
          ) : (
            <Pressable
              style={styles.primaryButton}
              onPress={() => {
                clearCompleted();
                onExit?.();
              }}
            >
              <Text style={styles.primaryButtonText}>Done</Text>
            </Pressable>
          )}

          <Pressable
            style={styles.secondaryButton}
            onPress={() => {
              stop();
              onExit?.();
            }}
          >
            <Text style={styles.secondaryButtonText}>Stop</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

type MetaCardProps = {
  label: string;
  value: string;
};

function MetaCard({ label, value }: MetaCardProps): React.JSX.Element {
  return (
    <View style={styles.metaCard}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#08131d',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 28,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 24,
  },
  emptyTitle: {
    color: '#f5f7fb',
    fontSize: 22,
    fontWeight: '700',
  },
  emptySubtitle: {
    color: '#9db1c8',
    fontSize: 15,
  },
  status: {
    color: '#f25f4c',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  meta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaCard: {
    flex: 1,
    backgroundColor: '#0e1b27',
    borderRadius: 18,
    padding: 18,
    gap: 4,
  },
  metaLabel: {
    color: '#9db1c8',
    fontSize: 13,
    textTransform: 'uppercase',
  },
  metaValue: {
    color: '#f5f7fb',
    fontSize: 22,
    fontWeight: '800',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f25f4c',
    borderRadius: 16,
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#13212f',
    borderRadius: 16,
    paddingVertical: 14,
  },
  secondaryButtonText: {
    color: '#dce6f2',
    fontSize: 16,
    fontWeight: '700',
  },
});
