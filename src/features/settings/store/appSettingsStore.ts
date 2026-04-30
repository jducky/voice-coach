import { create } from 'zustand';
import type { AppSettings } from '../types';

const defaultAppSettings: AppSettings = {
  soundEnabled: true,
  vibrationEnabled: true,
  autoPauseOnInterruption: true,
};

type AppSettingsStore = {
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
  resetSettings: () => void;
};

export const useAppSettingsStore = create<AppSettingsStore>()((set) => ({
  settings: defaultAppSettings,
  updateSettings: (patch) => {
    set((state) => ({
      settings: {
        ...state.settings,
        ...patch,
      },
    }));
  },
  resetSettings: () => {
    set({ settings: defaultAppSettings });
  },
}));
