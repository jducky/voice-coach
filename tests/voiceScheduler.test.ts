import { describe, expect, it } from 'vitest';
import { startSession, getSessionSnapshot } from '../src/features/session/engine/sessionEngine';
import { scheduleVoiceEvents } from '../src/features/voice/engine/scheduleVoiceEvents';
import type { VoiceSettings } from '../src/features/settings/types';
import { sampleRoutine } from './fixtures';

const voiceSettings: VoiceSettings = {
  voiceId: 'test-voice',
  speechRate: 0.5,
  speechVolume: 1,
  announcePrepare: true,
  announceWorkStart: true,
  announceRestStart: true,
  announceSetRestStart: true,
  announceRoundNumber: true,
  announceLast10Seconds: true,
  announceCountdown: true,
  announceCompletion: true,
};

describe('scheduleVoiceEvents', () => {
  it('schedules immediate and near-future work announcements inside the look-ahead window', () => {
    const session = startSession(sampleRoutine, 0);
    const snapshot = getSessionSnapshot(session, 9_000);
    const events = scheduleVoiceEvents(session, snapshot, voiceSettings, 9_000, 15_000);

    expect(events.map((event) => [event.kind, event.text, event.offsetMs])).toEqual([
      ['phase-start', 'Work', 1_000],
      ['round-start', '1 round start', 1_000],
      ['last-10-seconds', '10 seconds left', 11_000],
    ]);
  });

  it('does not return events that were already marked complete', () => {
    const session = startSession(sampleRoutine, 0);
    session.completedEventIds.push(
      `phase-start:${session.sessionId}:1`,
      `round-start:${session.sessionId}:1`,
      `last-10:${session.sessionId}:1`,
    );

    const snapshot = getSessionSnapshot(session, 9_000);
    const events = scheduleVoiceEvents(session, snapshot, voiceSettings, 9_000, 15_000);

    expect(events).toEqual([]);
  });

  it('schedules the 3-2-1 countdown when the end of a work phase is within range', () => {
    const session = startSession(sampleRoutine, 0);
    const snapshot = getSessionSnapshot(session, 25_000);
    const events = scheduleVoiceEvents(session, snapshot, voiceSettings, 25_000, 5_000);

    expect(events.map((event) => [event.kind, event.text, event.offsetMs])).toEqual([
      ['countdown', '3', 2_000],
      ['countdown', '2', 3_000],
      ['countdown', '1', 4_000],
      ['phase-start', 'Rest', 5_000],
    ]);
  });

  it('returns no events while paused', () => {
    const session = startSession(sampleRoutine, 0);
    session.pausedAt = 5_000;
    session.pausedPhaseIndex = 0;

    const snapshot = getSessionSnapshot(session, 10_000);
    const events = scheduleVoiceEvents(session, snapshot, voiceSettings, 10_000, 15_000);

    expect(snapshot.status).toBe('paused');
    expect(events).toEqual([]);
  });

  it('schedules completion when the session is close to ending', () => {
    const session = startSession(sampleRoutine, 0);
    const snapshot = getSessionSnapshot(session, 248_000);
    const events = scheduleVoiceEvents(session, snapshot, voiceSettings, 248_000, 15_000);

    expect(snapshot.remainingTotalMs).toBe(12_000);
    expect(events.at(-1)).toMatchObject({
      kind: 'completion',
      text: 'Complete',
      offsetMs: 12_000,
    });
  });
});
