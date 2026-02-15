import * as Tone from 'tone';

export async function ensureAudioContext(): Promise<boolean> {
  try {
    if (Tone.getContext().state !== 'running') {
      await Tone.start();
    }
    return true;
  } catch (e) {
    console.error('Failed to start AudioContext:', e);
    return false;
  }
}

export function isAudioContextSuspended(): boolean {
  return Tone.getContext().state === 'suspended';
}
