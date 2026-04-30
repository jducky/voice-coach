import { describe, expect, it } from 'vitest';
import { buildPhases, getTotalDurationMs } from '../src/features/session/engine/buildPhases';
import { sampleRoutine } from './fixtures';

describe('buildPhases', () => {
  it('builds a linear timeline without a rest after the final round', () => {
    const phases = buildPhases(sampleRoutine);

    expect(phases.map((phase) => phase.type)).toEqual([
      'prepare',
      'work',
      'rest',
      'work',
      'rest',
      'work',
      'rest',
      'work',
      'setRest',
      'work',
      'rest',
      'work',
      'rest',
      'work',
      'rest',
      'work',
    ]);
  });

  it('calculates the total duration from the phase list', () => {
    const phases = buildPhases(sampleRoutine);
    expect(getTotalDurationMs(phases)).toBe(260000);
  });
});
