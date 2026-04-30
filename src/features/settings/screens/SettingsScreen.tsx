import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAppSettingsStore } from '../store/appSettingsStore';
import { useVoiceSettingsStore } from '../../voice/store/voiceSettingsStore';

type SettingsScreenProps = {
  onBack?: () => void;
};

export function SettingsScreen({ onBack }: SettingsScreenProps): React.JSX.Element {
  const voiceSettings = useVoiceSettingsStore((state) => state.settings);
  const updateVoiceSettings = useVoiceSettingsStore((state) => state.updateSettings);
  const resetVoiceSettings = useVoiceSettingsStore((state) => state.resetSettings);

  const appSettings = useAppSettingsStore((state) => state.settings);
  const updateAppSettings = useAppSettingsStore((state) => state.updateSettings);
  const resetAppSettings = useAppSettingsStore((state) => state.resetSettings);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.kicker}>Settings</Text>
            <Text style={styles.title}>Voice guidance and playback behavior</Text>
          </View>
          {onBack ? (
            <Pressable style={styles.ghostButton} onPress={onBack}>
              <Text style={styles.ghostButtonText}>Back</Text>
            </Pressable>
          ) : null}
        </View>

        <Section title="Voice">
          <ValueRow
            label="Speech Rate"
            value={voiceSettings.speechRate.toFixed(2)}
            onDecrease={() => updateVoiceSettings({ speechRate: Math.max(0.1, voiceSettings.speechRate - 0.1) })}
            onIncrease={() => updateVoiceSettings({ speechRate: Math.min(1, voiceSettings.speechRate + 0.1) })}
          />
          <ValueRow
            label="Speech Volume"
            value={voiceSettings.speechVolume.toFixed(2)}
            onDecrease={() => updateVoiceSettings({ speechVolume: Math.max(0, voiceSettings.speechVolume - 0.1) })}
            onIncrease={() => updateVoiceSettings({ speechVolume: Math.min(1, voiceSettings.speechVolume + 0.1) })}
          />
          <ToggleRow
            label="Announce Prepare"
            enabled={voiceSettings.announcePrepare}
            onToggle={() => updateVoiceSettings({ announcePrepare: !voiceSettings.announcePrepare })}
          />
          <ToggleRow
            label="Announce Work Start"
            enabled={voiceSettings.announceWorkStart}
            onToggle={() => updateVoiceSettings({ announceWorkStart: !voiceSettings.announceWorkStart })}
          />
          <ToggleRow
            label="Announce Rest Start"
            enabled={voiceSettings.announceRestStart}
            onToggle={() => updateVoiceSettings({ announceRestStart: !voiceSettings.announceRestStart })}
          />
          <ToggleRow
            label="Announce Set Rest"
            enabled={voiceSettings.announceSetRestStart}
            onToggle={() => updateVoiceSettings({ announceSetRestStart: !voiceSettings.announceSetRestStart })}
          />
          <ToggleRow
            label="Round Number"
            enabled={voiceSettings.announceRoundNumber}
            onToggle={() => updateVoiceSettings({ announceRoundNumber: !voiceSettings.announceRoundNumber })}
          />
          <ToggleRow
            label="Last 10 Seconds"
            enabled={voiceSettings.announceLast10Seconds}
            onToggle={() => updateVoiceSettings({ announceLast10Seconds: !voiceSettings.announceLast10Seconds })}
          />
          <ToggleRow
            label="3-2-1 Countdown"
            enabled={voiceSettings.announceCountdown}
            onToggle={() => updateVoiceSettings({ announceCountdown: !voiceSettings.announceCountdown })}
          />
          <ToggleRow
            label="Completion"
            enabled={voiceSettings.announceCompletion}
            onToggle={() => updateVoiceSettings({ announceCompletion: !voiceSettings.announceCompletion })}
          />
          <Pressable style={styles.secondaryButton} onPress={resetVoiceSettings}>
            <Text style={styles.secondaryButtonText}>Reset Voice Settings</Text>
          </Pressable>
        </Section>

        <Section title="Playback">
          <ToggleRow
            label="Sound Enabled"
            enabled={appSettings.soundEnabled}
            onToggle={() => updateAppSettings({ soundEnabled: !appSettings.soundEnabled })}
          />
          <ToggleRow
            label="Vibration"
            enabled={appSettings.vibrationEnabled}
            onToggle={() => updateAppSettings({ vibrationEnabled: !appSettings.vibrationEnabled })}
          />
          <ToggleRow
            label="Auto Pause on Interruption"
            enabled={appSettings.autoPauseOnInterruption}
            onToggle={() => updateAppSettings({ autoPauseOnInterruption: !appSettings.autoPauseOnInterruption })}
          />
          <Pressable style={styles.secondaryButton} onPress={resetAppSettings}>
            <Text style={styles.secondaryButtonText}>Reset Playback Settings</Text>
          </Pressable>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

function Section({ title, children }: SectionProps): React.JSX.Element {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

type ToggleRowProps = {
  label: string;
  enabled: boolean;
  onToggle: () => void;
};

function ToggleRow({ label, enabled, onToggle }: ToggleRowProps): React.JSX.Element {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Pressable style={[styles.pillButton, enabled ? styles.pillOn : styles.pillOff]} onPress={onToggle}>
        <Text style={styles.pillText}>{enabled ? 'On' : 'Off'}</Text>
      </Pressable>
    </View>
  );
}

type ValueRowProps = {
  label: string;
  value: string;
  onDecrease: () => void;
  onIncrease: () => void;
};

function ValueRow({ label, value, onDecrease, onIncrease }: ValueRowProps): React.JSX.Element {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.valueControls}>
        <Pressable style={styles.stepButton} onPress={onDecrease}>
          <Text style={styles.stepButtonText}>-</Text>
        </Pressable>
        <Text style={styles.valueText}>{value}</Text>
        <Pressable style={styles.stepButton} onPress={onIncrease}>
          <Text style={styles.stepButtonText}>+</Text>
        </Pressable>
      </View>
    </View>
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
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  kicker: {
    color: '#f25f4c',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  title: {
    color: '#f5f7fb',
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 32,
    marginTop: 4,
  },
  ghostButton: {
    backgroundColor: '#13212f',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  ghostButtonText: {
    color: '#dce6f2',
    fontWeight: '700',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: '#f5f7fb',
    fontSize: 18,
    fontWeight: '700',
  },
  sectionBody: {
    backgroundColor: '#0e1b27',
    borderRadius: 20,
    padding: 16,
    gap: 14,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowLabel: {
    color: '#dce6f2',
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  pillButton: {
    borderRadius: 999,
    minWidth: 64,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  pillOn: {
    backgroundColor: '#f25f4c',
  },
  pillOff: {
    backgroundColor: '#1f3344',
  },
  pillText: {
    color: '#ffffff',
    fontWeight: '700',
    textAlign: 'center',
  },
  valueControls: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  stepButton: {
    alignItems: 'center',
    backgroundColor: '#13212f',
    borderRadius: 10,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  stepButtonText: {
    color: '#f5f7fb',
    fontSize: 18,
    fontWeight: '700',
  },
  valueText: {
    color: '#f5f7fb',
    fontSize: 16,
    fontVariant: ['tabular-nums'],
    minWidth: 42,
    textAlign: 'center',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#13212f',
    borderRadius: 14,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: '#dce6f2',
    fontWeight: '700',
  },
});
