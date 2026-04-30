import { create } from 'zustand';
import { defaultRoutines } from '../data/defaultRoutines';
import type { Routine } from '../types';

type RoutineDraft = Omit<Routine, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: string;
};

type RoutineStore = {
  routines: Routine[];
  recentRoutineId: string | null;
  createRoutine: (draft: RoutineDraft) => Routine;
  updateRoutine: (routineId: string, patch: Partial<Routine>) => void;
  deleteRoutine: (routineId: string) => void;
  markRoutineStarted: (routineId: string) => void;
  getRoutineById: (routineId: string) => Routine | undefined;
};

function createRoutineId(name: string): string {
  const base = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return `${base || 'routine'}-${Date.now()}`;
}

export const useRoutineStore = create<RoutineStore>()((set, get) => ({
  routines: defaultRoutines,
  recentRoutineId: defaultRoutines[0]?.id ?? null,
  createRoutine: (draft) => {
    const now = Date.now();
    const routine: Routine = {
      ...draft,
      id: draft.id ?? createRoutineId(draft.name),
      createdAt: now,
      updatedAt: now,
    };

    set((state) => ({
      routines: [routine, ...state.routines],
      recentRoutineId: routine.id,
    }));

    return routine;
  },
  updateRoutine: (routineId, patch) => {
    set((state) => ({
      routines: state.routines.map((routine) => {
        if (routine.id !== routineId) {
          return routine;
        }

        return {
          ...routine,
          ...patch,
          id: routine.id,
          updatedAt: Date.now(),
        };
      }),
    }));
  },
  deleteRoutine: (routineId) => {
    set((state) => {
      const routines = state.routines.filter((routine) => routine.id !== routineId);
      const recentRoutineId = state.recentRoutineId === routineId ? routines[0]?.id ?? null : state.recentRoutineId;

      return {
        routines,
        recentRoutineId,
      };
    });
  },
  markRoutineStarted: (routineId) => {
    set({ recentRoutineId: routineId });
  },
  getRoutineById: (routineId) => get().routines.find((routine) => routine.id === routineId),
}));
