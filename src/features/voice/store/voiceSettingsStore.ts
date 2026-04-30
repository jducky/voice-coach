import { create } from 'zustand';
import type { VoiceSettings } from '../../settings/types';
import { defaultVoiceSettings } from '../defaultVoiceSettings';

type VoiceSettingsStore = {
  settings: VoiceSettings;
  updateSettings: (patch: Partial<VoiceSettings>) => void;
  resetSettings: () => void;
};

export const useVoiceSettingsStore = create<VoiceSettingsStore>()((set) => ({
  settings: defaultVoiceSettings,
  updateSettings: (patch) => {
    set((state) => ({
      settings: {
        ...state.settings,
        ...patch,
      },
    }));
  },
  resetSettings: () => {
    set({ settings: defaultVoiceSettings });
  },
}));
