import type { Routine } from '../../routines/types';
import type { SessionPhase } from '../types';

function assertPositiveInteger(value: number, label: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative integer.`);
  }
}

export function validateRoutine(routine: Routine): void {
  assertPositiveInteger(routine.prepareSeconds, 'prepareSeconds');
  assertPositiveInteger(routine.workSeconds, 'workSeconds');
  assertPositiveInteger(routine.restSeconds, 'restSeconds');
  assertPositiveInteger(routine.roundsPerSet, 'roundsPerSet');
  assertPositiveInteger(routine.setCount, 'setCount');
  assertPositiveInteger(routine.setRestSeconds, 'setRestSeconds');

  if (routine.workSeconds <= 0) {
    throw new Error('workSeconds must be greater than 0.');
  }

  if (routine.roundsPerSet <= 0) {
    throw new Error('roundsPerSet must be greater than 0.');
  }

  if (routine.setCount <= 0) {
    throw new Error('setCount must be greater than 0.');
  }
}

export function buildPhases(routine: Routine): SessionPhase[] {
  validateRoutine(routine);

  const phases: SessionPhase[] = [];

  if (routine.prepareSeconds > 0) {
    phases.push({
      type: 'prepare',
      durationSec: routine.prepareSeconds,
      setIndex: null,
      roundIndex: null,
    });
  }

  for (let setIndex = 1; setIndex <= routine.setCount; setIndex += 1) {
    for (let roundIndex = 1; roundIndex <= routine.roundsPerSet; roundIndex += 1) {
      phases.push({
        type: 'work',
        durationSec: routine.workSeconds,
        setIndex,
        roundIndex,
      });

      const isLastRoundInSet = roundIndex === routine.roundsPerSet;
      const isLastSet = setIndex === routine.setCount;

      if (!isLastRoundInSet && routine.restSeconds > 0) {
        phases.push({
          type: 'rest',
          durationSec: routine.restSeconds,
          setIndex,
          roundIndex,
        });
      }

      if (isLastRoundInSet && !isLastSet && routine.setRestSeconds > 0) {
        phases.push({
          type: 'setRest',
          durationSec: routine.setRestSeconds,
          setIndex,
          roundIndex: null,
        });
      }
    }
  }

  return phases;
}

export function getTotalDurationMs(phases: SessionPhase[]): number {
  return phases.reduce((sum, phase) => sum + phase.durationSec * 1000, 0);
}
