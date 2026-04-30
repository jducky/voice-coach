import type { VoiceSettings } from '../../settings/types';
import type { VoiceEvent } from '../types';
import type { VoiceAdapter } from './voiceAdapter';

export type TtsEngine = {
  speak: (text: string, options?: { iosVoiceId?: string; rate?: number; volume?: number }) => void | Promise<void>;
  stop?: () => void | Promise<void>;
};

export function createTtsVoiceAdapter(tts: TtsEngine): VoiceAdapter {
  return {
    speak: (event: VoiceEvent, settings: VoiceSettings) => {
      return tts.speak(event.text, {
        iosVoiceId: settings.voiceId ?? undefined,
        rate: settings.speechRate,
        volume: settings.speechVolume,
      });
    },
    stop: () => tts.stop?.(),
  };
}
