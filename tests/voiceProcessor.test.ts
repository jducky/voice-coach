import { describe, expect, it } from 'vitest';
import { defaultVoiceSettings } from '../src/features/voice/defaultVoiceSettings';
import { processDueVoiceEvents } from '../src/features/voice/engine/processDueVoiceEvents';
import { getSessionSnapshot, startSession } from '../src/features/session/engine/sessionEngine';

import { sampleRoutine } from './fixtures';

describe('processDueVoiceEvents', () => {
  it('returns due events and appends them to completed ids', () => {
    const session = startSession(sampleRoutine, 0);
    const snapshot = getSessionSnapshot(session, 10_000);

    const result = processDueVoiceEvents(
      session,
      snapshot,
      defaultVoiceSettings,
      10_000,
      250,
    );

    expect(result.dueEvents.map((event) => [event.kind, event.text])).toEqual([
      ['phase-start', 'Work'],
      ['round-start', '1 round start'],
    ]);
    expect(result.nextCompletedEventIds).toEqual([
      `phase-start:${session.sessionId}:1`,
      `round-start:${session.sessionId}:1`,
    ]);
  });

  it('backfills recently missed events within the grace window', () => {
    const session = startSession(sampleRoutine, 0);
    const snapshot = getSessionSnapshot(session, 10_150);

    const result = processDueVoiceEvents(
      session,
      snapshot,
      defaultVoiceSettings,
      10_150,
      250,
    );

    expect(result.dueEvents.map((event) => event.id)).toEqual([
      `phase-start:${session.sessionId}:1`,
      `round-start:${session.sessionId}:1`,
    ]);
  });

  it('does not emit anything after the same events were marked complete', () => {
    const session = startSession(sampleRoutine, 0);
    session.completedEventIds = [
      `phase-start:${session.sessionId}:1`,
      `round-start:${session.sessionId}:1`,
    ];

    const snapshot = getSessionSnapshot(session, 10_150);
    const result = processDueVoiceEvents(
      session,
      snapshot,
      defaultVoiceSettings,
      10_150,
      250,
    );

    expect(result.dueEvents).toEqual([]);
    expect(result.nextCompletedEventIds).toEqual(session.completedEventIds);
  });
});
