import type { VoiceSettings } from '../../settings/types';
import type { VoiceEvent } from '../types';

export type VoiceAdapter = {
  speak: (event: VoiceEvent, settings: VoiceSettings) => void | Promise<void>;
  stop?: () => void | Promise<void>;
};

export const noopVoiceAdapter: VoiceAdapter = {
  speak: () => undefined,
  stop: () => undefined,
};
