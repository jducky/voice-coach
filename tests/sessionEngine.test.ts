import { describe, expect, it } from 'vitest';
import {
  getSessionSnapshot,
  pauseSession,
  resumeSession,
  startSession,
  stopSession,
} from '../src/features/session/engine/sessionEngine';
import { sampleRoutine } from './fixtures';

describe('sessionEngine', () => {
  it('starts in prepare and transitions into work based on absolute time', () => {
    const session = startSession(sampleRoutine, 1_000);

    const preparing = getSessionSnapshot(session, 6_000);
    expect(preparing.status).toBe('preparing');
    expect(preparing.remainingPhaseMs).toBe(5_000);

    const working = getSessionSnapshot(session, 12_000);
    expect(working.status).toBe('working');
    expect(working.currentSet).toBe(1);
    expect(working.currentRound).toBe(1);
    expect(working.remainingPhaseMs).toBe(19_000);
  });

  it('enters set rest after the last round of a non-final set', () => {
    const session = startSession(sampleRoutine, 0);
    const snapshot = getSessionSnapshot(session, 120_000);

    expect(snapshot.status).toBe('setResting');
    expect(snapshot.currentSet).toBe(1);
    expect(snapshot.currentRound).toBe(0);
    expect(snapshot.remainingPhaseMs).toBe(30_000);
  });

  it('keeps effective elapsed time frozen while paused', () => {
    const session = startSession(sampleRoutine, 0);
    const paused = pauseSession(session, 15_000);

    const duringPause = getSessionSnapshot(paused, 25_000);
    expect(duringPause.status).toBe('paused');
    expect(duringPause.effectiveElapsedMs).toBe(15_000);

    const resumed = resumeSession(paused, 35_000);
    const afterResume = getSessionSnapshot(resumed, 40_000);
    expect(afterResume.status).toBe('working');
    expect(afterResume.effectiveElapsedMs).toBe(20_000);
  });

  it('marks the session completed once the total duration is consumed', () => {
    const session = startSession(sampleRoutine, 0);
    const snapshot = getSessionSnapshot(session, 260_000);

    expect(snapshot.status).toBe('completed');
    expect(snapshot.isCompleted).toBe(true);
    expect(snapshot.remainingTotalMs).toBe(0);
  });

  it('can be explicitly stopped', () => {
    const session = startSession(sampleRoutine, 0);
    const stopped = stopSession(session, 50_000);
    const snapshot = getSessionSnapshot(stopped, 50_000);

    expect(snapshot.status).toBe('completed');
    expect(snapshot.isCompleted).toBe(true);
  });
});
