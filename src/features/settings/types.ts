export type VoiceSettings = {
  voiceId: string | null;
  speechRate: number;
  speechVolume: number;
  announcePrepare: boolean;
  announceWorkStart: boolean;
  announceRestStart: boolean;
  announceSetRestStart: boolean;
  announceRoundNumber: boolean;
  announceLast10Seconds: boolean;
  announceCountdown: boolean;
  announceCompletion: boolean;
};

export type AppSettings = {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  autoPauseOnInterruption: boolean;
};
