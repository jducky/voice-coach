import { buildPhases, getTotalDurationMs } from './buildPhases';
import type {
  PersistedSession,
  SessionPhase,
  SessionSnapshot,
  SessionStatus,
} from '../types';
import type { Routine } from '../../routines/types';

function toStatus(phase: SessionPhase | null, isPaused: boolean, isCompleted: boolean): SessionStatus {
  if (isCompleted) {
    return 'completed';
  }

  if (isPaused) {
    return 'paused';
  }

  if (!phase) {
    return 'idle';
  }

  switch (phase.type) {
    case 'prepare':
      return 'preparing';
    case 'work':
      return 'working';
    case 'rest':
      return 'resting';
    case 'setRest':
      return 'setResting';
    default:
      return 'idle';
  }
}

function getEffectiveNow(session: PersistedSession, now: number): number {
  if (session.pausedAt === null) {
    return now;
  }

  return session.pausedAt;
}

function getEffectiveElapsedMs(session: PersistedSession, now: number): number {
  const effectiveNow = getEffectiveNow(session, now);
  return Math.max(0, effectiveNow - session.startedAt - session.totalPausedMs);
}

function getCurrentPhaseData(
  phases: SessionPhase[],
  effectiveElapsedMs: number,
): {
  phase: SessionPhase | null;
  phaseIndex: number;
  phaseStartedMs: number;
  phaseElapsedMs: number;
  remainingPhaseMs: number;
} {
  let consumedMs = 0;

  for (let index = 0; index < phases.length; index += 1) {
    const phase = phases[index];
    const durationMs = phase.durationSec * 1000;
    const nextConsumedMs = consumedMs + durationMs;

    if (effectiveElapsedMs < nextConsumedMs) {
      const phaseElapsedMs = effectiveElapsedMs - consumedMs;
      return {
        phase,
        phaseIndex: index,
        phaseStartedMs: consumedMs,
        phaseElapsedMs,
        remainingPhaseMs: durationMs - phaseElapsedMs,
      };
    }

    consumedMs = nextConsumedMs;
  }

  return {
    phase: null,
    phaseIndex: phases.length,
    phaseStartedMs: consumedMs,
    phaseElapsedMs: 0,
    remainingPhaseMs: 0,
  };
}

function getCurrentSetAndRound(phase: SessionPhase | null, routine: Routine): { currentSet: number; currentRound: number } {
  if (!phase) {
    return {
      currentSet: routine.setCount,
      currentRound: routine.roundsPerSet,
    };
  }

  return {
    currentSet: phase.setIndex ?? 0,
    currentRound: phase.roundIndex ?? 0,
  };
}

export function startSession(routine: Routine, startedAt: number = Date.now()): PersistedSession {
  return {
    sessionId: `${routine.id}:${startedAt}`,
    routine,
    phases: buildPhases(routine),
    startedAt,
    pausedAt: null,
    totalPausedMs: 0,
    pausedPhaseIndex: null,
    completedEventIds: [],
    stoppedAt: null,
  };
}

export function pauseSession(session: PersistedSession, pausedAt: number = Date.now()): PersistedSession {
  if (session.pausedAt !== null || session.stoppedAt !== null) {
    return session;
  }

  const snapshot = getSessionSnapshot(session, pausedAt);
  if (snapshot.isCompleted) {
    return session;
  }

  return {
    ...session,
    pausedAt,
    pausedPhaseIndex: snapshot.phaseIndex,
  };
}

export function resumeSession(session: PersistedSession, resumedAt: number = Date.now()): PersistedSession {
  if (session.pausedAt === null || session.stoppedAt !== null) {
    return session;
  }

  return {
    ...session,
    totalPausedMs: session.totalPausedMs + (resumedAt - session.pausedAt),
    pausedAt: null,
    pausedPhaseIndex: null,
  };
}

export function stopSession(session: PersistedSession, stoppedAt: number = Date.now()): PersistedSession {
  if (session.stoppedAt !== null) {
    return session;
  }

  return {
    ...session,
    stoppedAt,
  };
}

export function restoreSession(session: PersistedSession, now: number = Date.now()): SessionSnapshot {
  return getSessionSnapshot(session, now);
}

export function getSessionSnapshot(session: PersistedSession, now: number = Date.now()): SessionSnapshot {
  const elapsedMs = Math.max(0, now - session.startedAt);
  const totalDurationMs = getTotalDurationMs(session.phases);
  const effectiveElapsedMs = session.stoppedAt !== null
    ? totalDurationMs
    : getEffectiveElapsedMs(session, now);
  const completed = effectiveElapsedMs >= totalDurationMs || session.stoppedAt !== null;
  const clampedElapsedMs = Math.min(effectiveElapsedMs, totalDurationMs);
  const { phase, phaseIndex, phaseElapsedMs, remainingPhaseMs } = getCurrentPhaseData(session.phases, clampedElapsedMs);
  const { currentSet, currentRound } = getCurrentSetAndRound(phase, session.routine);
  const nextTransitionAt = session.pausedAt !== null || completed || !phase
    ? null
    : now + remainingPhaseMs;

  return {
    sessionId: session.sessionId,
    status: toStatus(phase, session.pausedAt !== null, completed),
    phaseIndex,
    phase,
    currentSet,
    totalSets: session.routine.setCount,
    currentRound,
    totalRounds: session.routine.roundsPerSet,
    elapsedMs,
    effectiveElapsedMs: clampedElapsedMs,
    phaseElapsedMs,
    remainingPhaseMs,
    remainingTotalMs: Math.max(0, totalDurationMs - clampedElapsedMs),
    nextTransitionAt,
    isCompleted: completed,
  };
}
