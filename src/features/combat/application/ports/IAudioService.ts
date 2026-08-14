export interface IAudioService {
  isMuted: boolean;
  toggleMute(): void;
  playSound(soundId: string): void;
  startBgm?(mode: 'title' | 'explore' | 'combat'): void;
  stopBgm?(): void;
}
