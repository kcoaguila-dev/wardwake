export interface IAudioService {
  isMuted: boolean;
  toggleMute(): void;
  playSound(soundId: string): void;
  startBgm?(mode: 'title' | 'explore' | 'combat' | 'town' | 'dread'): void;
  stopBgm?(): void;
  resumeAudioContext?(): Promise<void>;
}
