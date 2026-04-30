import { useEffect } from 'react';
import { useSessionStore } from '../../session/store/sessionStore';
import { useVoiceSettingsStore } from '../store/voiceSettingsStore';
import type { VoiceAdapter } from '../engine/voiceAdapter';
import { processDueVoiceEvents } from '../engine/processDueVoiceEvents';

export function useVoiceCoach(adapter: VoiceAdapter, graceMs: number = 250): void {
  const activeSession = useSessionStore((state) => state.activeSession);
  const snapshot = useSessionStore((state) => state.snapshot);
  const markVoiceEventsCompleted = useSessionStore((state) => state.markVoiceEventsCompleted);
  const voiceSettings = useVoiceSettingsStore((state) => state.settings);

  useEffect(() => {
    if (!activeSession || !snapshot) {
      return;
    }

    const now = Date.now();
    const { dueEvents, nextCompletedEventIds } = processDueVoiceEvents(
      activeSession,
      snapshot,
      voiceSettings,
      now,
      graceMs,
    );

    if (dueEvents.length === 0) {
      return;
    }

    for (const event of dueEvents) {
      void adapter.speak(event, voiceSettings);
    }

    markVoiceEventsCompleted(nextCompletedEventIds);
  }, [activeSession, adapter, graceMs, markVoiceEventsCompleted, snapshot, voiceSettings]);
}
