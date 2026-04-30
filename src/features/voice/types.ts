export type VoiceEventKind =
  | 'phase-start'
  | 'round-start'
  | 'last-10-seconds'
  | 'countdown'
  | 'completion';

export type VoiceEvent = {
  id: string;
  kind: VoiceEventKind;
  offsetMs: number;
  triggerAt: number;
  text: string;
  priority: number;
};
