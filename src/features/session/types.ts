import type { Routine } from '../routines/types';

export type SessionPhaseType = 'prepare' | 'work' | 'rest' | 'setRest';

export type SessionPhase = {
  type: SessionPhaseType;
  durationSec: number;
  setIndex: number | null;
  roundIndex: number | null;
};

export type SessionStatus =
  | 'idle'
  | 'preparing'
  | 'working'
  | 'resting'
  | 'setResting'
  | 'paused'
  | 'completed';

export type PersistedSession = {
  sessionId: string;
  routine: Routine;
  phases: SessionPhase[];
  startedAt: number;
  pausedAt: number | null;
  totalPausedMs: number;
  pausedPhaseIndex: number | null;
  completedEventIds: string[];
  stoppedAt: number | null;
};

export type SessionSnapshot = {
  sessionId: string;
  status: SessionStatus;
  phaseIndex: number;
  phase: SessionPhase | null;
  currentSet: number;
  totalSets: number;
  currentRound: number;
  totalRounds: number;
  elapsedMs: number;
  effectiveElapsedMs: number;
  phaseElapsedMs: number;
  remainingPhaseMs: number;
  remainingTotalMs: number;
  nextTransitionAt: number | null;
  isCompleted: boolean;
};
