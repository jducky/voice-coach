import type { Routine } from '../types';

const now = Date.now();

export const defaultRoutines: Routine[] = [
  {
    id: 'beginner-tabata',
    name: 'Beginner Tabata',
    prepareSeconds: 10,
    workSeconds: 20,
    restSeconds: 10,
    roundsPerSet: 8,
    setCount: 1,
    setRestSeconds: 30,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'core-blast',
    name: 'Core Blast',
    prepareSeconds: 10,
    workSeconds: 30,
    restSeconds: 15,
    roundsPerSet: 6,
    setCount: 2,
    setRestSeconds: 45,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'jump-rope-hiit',
    name: 'Jump Rope HIIT',
    prepareSeconds: 5,
    workSeconds: 45,
    restSeconds: 15,
    roundsPerSet: 5,
    setCount: 2,
    setRestSeconds: 60,
    createdAt: now,
    updatedAt: now,
  },
];
