import { create } from 'zustand';
import type { Routine } from '../../routines/types';
import type { PersistedSession, SessionSnapshot } from '../types';
import {
  getSessionSnapshot,
  pauseSession,
  resumeSession,
  startSession,
  stopSession,
} from '../engine/sessionEngine';

type SessionStore = {
  activeSession: PersistedSession | null;
  snapshot: SessionSnapshot | null;
  start: (routine: Routine, now?: number) => void;
  pause: (now?: number) => void;
  resume: (now?: number) => void;
  stop: (now?: number) => void;
  refreshSnapshot: (now?: number) => void;
  markVoiceEventsCompleted: (completedEventIds: string[]) => void;
  clearCompleted: () => void;
};

export const useSessionStore = create<SessionStore>()((set, get) => ({
  activeSession: null,
  snapshot: null,
  start: (routine, now = Date.now()) => {
    const session = startSession(routine, now);

    set({
      activeSession: session,
      snapshot: getSessionSnapshot(session, now),
    });
  },
  pause: (now = Date.now()) => {
    const current = get().activeSession;
    if (!current) {
      return;
    }

    const next = pauseSession(current, now);
    set({
      activeSession: next,
      snapshot: getSessionSnapshot(next, now),
    });
  },
  resume: (now = Date.now()) => {
    const current = get().activeSession;
    if (!current) {
      return;
    }

    const next = resumeSession(current, now);
    set({
      activeSession: next,
      snapshot: getSessionSnapshot(next, now),
    });
  },
  stop: (now = Date.now()) => {
    const current = get().activeSession;
    if (!current) {
      return;
    }

    const next = stopSession(current, now);
    set({
      activeSession: next,
      snapshot: getSessionSnapshot(next, now),
    });
  },
  refreshSnapshot: (now = Date.now()) => {
    const current = get().activeSession;
    if (!current) {
      return;
    }

    set({
      snapshot: getSessionSnapshot(current, now),
    });
  },
  markVoiceEventsCompleted: (completedEventIds) => {
    const current = get().activeSession;
    if (!current) {
      return;
    }

    set({
      activeSession: {
        ...current,
        completedEventIds,
      },
    });
  },
  clearCompleted: () => {
    const snapshot = get().snapshot;
    if (!snapshot?.isCompleted) {
      return;
    }

    set({
      activeSession: null,
      snapshot: null,
    });
  },
}));
