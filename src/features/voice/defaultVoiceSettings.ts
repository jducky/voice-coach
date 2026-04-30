import type { VoiceSettings } from '../settings/types';

export const defaultVoiceSettings: VoiceSettings = {
  voiceId: null,
  speechRate: 0.5,
  speechVolume: 1,
  announcePrepare: true,
  announceWorkStart: true,
  announceRestStart: true,
  announceSetRestStart: true,
  announceRoundNumber: true,
  announceLast10Seconds: true,
  announceCountdown: true,
  announceCompletion: true,
};
