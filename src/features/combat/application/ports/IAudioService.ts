export interface IAudioService {
  isMuted: boolean;
  toggleMute(): void;
  playSound(soundId: string): void;
}
