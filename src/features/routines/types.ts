export type Routine = {
  id: string;
  name: string;
  prepareSeconds: number;
  workSeconds: number;
  restSeconds: number;
  roundsPerSet: number;
  setCount: number;
  setRestSeconds: number;
  createdAt: number;
  updatedAt: number;
};

export type RecentSession = {
  routineId: string;
  startedAt: number;
  completedAt: number;
  durationSeconds: number;
};
