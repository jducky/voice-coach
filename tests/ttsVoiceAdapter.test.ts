import { describe, expect, it, vi } from 'vitest';
import { createTtsVoiceAdapter } from '../src/features/voice/engine/createTtsVoiceAdapter';
import { defaultVoiceSettings } from '../src/features/voice/defaultVoiceSettings';

describe('createTtsVoiceAdapter', () => {
  it('maps voice settings into TTS engine options', async () => {
    const speak = vi.fn();
    const stop = vi.fn();
    const adapter = createTtsVoiceAdapter({ speak, stop });

    await adapter.speak(
      {
        id: 'event-1',
        kind: 'phase-start',
        offsetMs: 0,
        triggerAt: 1000,
        text: 'Work',
        priority: 80,
      },
      {
        ...defaultVoiceSettings,
        voiceId: 'ko-KR-voice-1',
        speechRate: 0.7,
        speechVolume: 0.8,
      },
    );

    expect(speak).toHaveBeenCalledWith('Work', {
      iosVoiceId: 'ko-KR-voice-1',
      rate: 0.7,
      volume: 0.8,
    });

    await adapter.stop?.();
    expect(stop).toHaveBeenCalled();
  });
});
