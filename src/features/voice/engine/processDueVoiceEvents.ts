import type { VoiceSettings } from '../../settings/types';
import type { PersistedSession, SessionSnapshot } from '../../session/types';
import { scheduleVoiceEvents } from './scheduleVoiceEvents';
import type { VoiceEvent } from '../types';

type ProcessDueVoiceEventsResult = {
  dueEvents: VoiceEvent[];
  nextCompletedEventIds: string[];
};

export function processDueVoiceEvents(
  session: PersistedSession,
  snapshot: SessionSnapshot,
  voiceSettings: VoiceSettings,
  now: number,
  graceMs: number = 250,
): ProcessDueVoiceEventsResult {
  const scheduledEvents = scheduleVoiceEvents(session, snapshot, voiceSettings, now, graceMs, graceMs);
  const dueEvents = scheduledEvents.filter((event) => event.triggerAt <= now);

  if (dueEvents.length === 0) {
    return {
      dueEvents: [],
      nextCompletedEventIds: session.completedEventIds,
    };
  }

  const completedIds = new Set(session.completedEventIds);
  for (const event of dueEvents) {
    completedIds.add(event.id);
  }

  return {
    dueEvents,
    nextCompletedEventIds: [...completedIds],
  };
}
