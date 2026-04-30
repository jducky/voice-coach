import React from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { HomeScreen } from '../features/routines/screens/HomeScreen';
import { SessionScreen } from '../features/session/screens/SessionScreen';
import { SettingsScreen } from '../features/settings/screens/SettingsScreen';
import { useVoiceCoach } from '../features/voice/hooks/useVoiceCoach';
import { noopVoiceAdapter } from '../features/voice/engine/voiceAdapter';
import { useSessionStore } from '../features/session/store/sessionStore';

export function App(): React.JSX.Element {
  useVoiceCoach(noopVoiceAdapter);

  const snapshot = useSessionStore((state) => state.snapshot);
  const [screen, setScreen] = React.useState<'home' | 'session' | 'settings'>('home');

  React.useEffect(() => {
    if (snapshot && !snapshot.isCompleted) {
      setScreen('session');
    }
  }, [snapshot]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          {screen === 'home' ? (
            <HomeScreen onOpenSession={() => setScreen('session')} onOpenSettings={() => setScreen('settings')} />
          ) : null}
          {screen === 'session' ? <SessionScreen onExit={() => setScreen('home')} /> : null}
          {screen === 'settings' ? <SettingsScreen onBack={() => setScreen('home')} /> : null}
        </View>

        <View style={styles.tabBar}>
          <TabButton label="Home" active={screen === 'home'} onPress={() => setScreen('home')} />
          <TabButton label="Session" active={screen === 'session'} onPress={() => setScreen('session')} />
          <TabButton label="Settings" active={screen === 'settings'} onPress={() => setScreen('settings')} />
        </View>
      </View>
    </SafeAreaView>
  );
}

type TabButtonProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

function TabButton({ label, active, onPress }: TabButtonProps): React.JSX.Element {
  return (
    <Pressable style={[styles.tabButton, active ? styles.tabButtonActive : null]} onPress={onPress}>
      <Text style={[styles.tabButtonText, active ? styles.tabButtonTextActive : null]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#08131d',
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: '#0b1721',
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tabButton: {
    alignItems: 'center',
    backgroundColor: '#13212f',
    borderRadius: 14,
    flex: 1,
    paddingVertical: 12,
  },
  tabButtonActive: {
    backgroundColor: '#f25f4c',
  },
  tabButtonText: {
    color: '#dce6f2',
    fontWeight: '700',
  },
  tabButtonTextActive: {
    color: '#ffffff',
  },
});
