import type { VoiceSettings } from '../../settings/types';
import type { PersistedSession, SessionPhase, SessionSnapshot } from '../../session/types';
import type { VoiceEvent } from '../types';

const PRIORITY = {
  countdown: 100,
  phaseStart: 80,
  roundStart: 70,
  completion: 60,
  last10Seconds: 40,
} as const;

type PhaseWindow = {
  phase: SessionPhase;
  phaseIndex: number;
  phaseStartMs: number;
  phaseEndMs: number;
};

function sumPhaseDurationsMs(phases: SessionPhase[], endIndex: number): number {
  let total = 0;

  for (let index = 0; index < endIndex; index += 1) {
    total += phases[index].durationSec * 1000;
  }

  return total;
}

function getPhaseWindow(session: PersistedSession, phaseIndex: number): PhaseWindow | null {
  const phase = session.phases[phaseIndex];
  if (!phase) {
    return null;
  }

  const phaseStartMs = sumPhaseDurationsMs(session.phases, phaseIndex);
  return {
    phase,
    phaseIndex,
    phaseStartMs,
    phaseEndMs: phaseStartMs + phase.durationSec * 1000,
  };
}

function shouldAnnouncePhaseStart(phase: SessionPhase, settings: VoiceSettings): boolean {
  switch (phase.type) {
    case 'prepare':
      return settings.announcePrepare;
    case 'work':
      return settings.announceWorkStart;
    case 'rest':
      return settings.announceRestStart;
    case 'setRest':
      return settings.announceSetRestStart;
    default:
      return false;
  }
}

function getPhaseStartText(phase: SessionPhase): string {
  switch (phase.type) {
    case 'prepare':
      return 'Prepare';
    case 'work':
      return 'Work';
    case 'rest':
      return 'Rest';
    case 'setRest':
      return 'Set Rest';
    default:
      return '';
  }
}

function getRoundStartText(phase: SessionPhase): string {
  return `${phase.roundIndex} round start`;
}

function getPhaseStartEventId(sessionId: string, phaseIndex: number): string {
  return `phase-start:${sessionId}:${phaseIndex}`;
}

function getRoundStartEventId(sessionId: string, phaseIndex: number): string {
  return `round-start:${sessionId}:${phaseIndex}`;
}

function getLast10EventId(sessionId: string, phaseIndex: number): string {
  return `last-10:${sessionId}:${phaseIndex}`;
}

function getCountdownEventId(sessionId: string, phaseIndex: number, second: number): string {
  return `countdown:${sessionId}:${phaseIndex}:${second}`;
}

function getCompletionEventId(sessionId: string): string {
  return `completion:${sessionId}`;
}

function addEvent(
  events: VoiceEvent[],
  completedEventIds: Set<string>,
  event: VoiceEvent,
): void {
  if (completedEventIds.has(event.id)) {
    return;
  }

  events.push(event);
}

export function scheduleVoiceEvents(
  session: PersistedSession,
  snapshot: SessionSnapshot,
  voiceSettings: VoiceSettings,
  now: number,
  lookAheadMs: number = 15_000,
  backfillMs: number = 0,
): VoiceEvent[] {
  if (snapshot.status === 'paused' || snapshot.status === 'idle') {
    return [];
  }

  const completedEventIds = new Set(session.completedEventIds);
  const events: VoiceEvent[] = [];
  const effectiveNowMs = snapshot.effectiveElapsedMs;
  const effectiveWindowStartMs = Math.max(0, effectiveNowMs - backfillMs);
  const lookAheadEndMs = effectiveNowMs + lookAheadMs;

  for (let phaseIndex = snapshot.phaseIndex; phaseIndex < session.phases.length; phaseIndex += 1) {
    const window = getPhaseWindow(session, phaseIndex);
    if (!window) {
      continue;
    }

    if (window.phaseStartMs > lookAheadEndMs) {
      break;
    }

    const startsWithinWindow = window.phaseStartMs >= effectiveWindowStartMs;
    const phaseStartTriggerAt = now + (window.phaseStartMs - effectiveNowMs);

    if (startsWithinWindow && shouldAnnouncePhaseStart(window.phase, voiceSettings)) {
      addEvent(events, completedEventIds, {
        id: getPhaseStartEventId(session.sessionId, phaseIndex),
        kind: 'phase-start',
        offsetMs: window.phaseStartMs - effectiveNowMs,
        triggerAt: phaseStartTriggerAt,
        text: getPhaseStartText(window.phase),
        priority: PRIORITY.phaseStart,
      });
    }

    if (startsWithinWindow && window.phase.type === 'work' && voiceSettings.announceRoundNumber) {
      addEvent(events, completedEventIds, {
        id: getRoundStartEventId(session.sessionId, phaseIndex),
        kind: 'round-start',
        offsetMs: window.phaseStartMs - effectiveNowMs,
        triggerAt: phaseStartTriggerAt,
        text: getRoundStartText(window.phase),
        priority: PRIORITY.roundStart,
      });
    }

    if (
      window.phase.type === 'work'
      && voiceSettings.announceLast10Seconds
      && window.phase.durationSec >= 10
    ) {
      const triggerMs = window.phaseEndMs - 10_000;
      if (triggerMs >= effectiveWindowStartMs && triggerMs <= lookAheadEndMs) {
        addEvent(events, completedEventIds, {
          id: getLast10EventId(session.sessionId, phaseIndex),
          kind: 'last-10-seconds',
          offsetMs: triggerMs - effectiveNowMs,
          triggerAt: now + (triggerMs - effectiveNowMs),
          text: '10 seconds left',
          priority: PRIORITY.last10Seconds,
        });
      }
    }

    if (window.phase.type === 'work' && voiceSettings.announceCountdown && window.phase.durationSec >= 3) {
      for (const second of [3, 2, 1]) {
        const triggerMs = window.phaseEndMs - second * 1000;
        if (triggerMs >= effectiveWindowStartMs && triggerMs <= lookAheadEndMs) {
          addEvent(events, completedEventIds, {
            id: getCountdownEventId(session.sessionId, phaseIndex, second),
            kind: 'countdown',
            offsetMs: triggerMs - effectiveNowMs,
            triggerAt: now + (triggerMs - effectiveNowMs),
            text: String(second),
            priority: PRIORITY.countdown,
          });
        }
      }
    }
  }

  if (voiceSettings.announceCompletion && !snapshot.isCompleted && snapshot.remainingTotalMs <= lookAheadMs) {
    addEvent(events, completedEventIds, {
      id: getCompletionEventId(session.sessionId),
      kind: 'completion',
      offsetMs: snapshot.remainingTotalMs,
      triggerAt: now + snapshot.remainingTotalMs,
      text: 'Complete',
      priority: PRIORITY.completion,
    });
  }

  return events.sort((left, right) => {
    if (left.offsetMs !== right.offsetMs) {
      return left.offsetMs - right.offsetMs;
    }

    return right.priority - left.priority;
  });
}
