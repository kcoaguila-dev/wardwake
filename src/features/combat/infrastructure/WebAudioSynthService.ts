import { IAudioService } from '../application/ports/IAudioService';

export class WebAudioSynthService implements IAudioService {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  constructor() {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    } catch (e) {
      console.warn('Web Audio API not supported in this environment');
    }
  }

  toggleMute(): void {
    this.isMuted = !this.isMuted;
  }

  playSound(soundId: string): void {
    if (this.isMuted || !this.ctx) return;

    // Resume AudioContext if suspended (browser autoplay policy)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    const t = this.ctx.currentTime;
    const masterGain = this.ctx.createGain();
    masterGain.connect(this.ctx.destination);
    // Base volume
    masterGain.gain.value = 0.2;

    switch (soundId) {
      case 'sword_slash':
        this.playSwordSlash(masterGain, t);
        break;
      case 'lance_pierce':
        this.playLancePierce(masterGain, t);
        break;
      case 'axe_smash':
        this.playAxeSmash(masterGain, t);
        break;
      case 'hero_step':
        this.playHeroStep(masterGain, t);
        break;
      case 'item_pickup':
        this.playItemPickup(masterGain, t);
        break;
      case 'staircase_descend':
        this.playStaircaseDescend(masterGain, t);
        break;
      default:
        console.warn(`Sound ${soundId} not recognized`);
        break;
    }
  }

  private playSwordSlash(output: GainNode, t: number): void {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';

    // High-to-low frequency sweep
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.15);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(1, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    // Mix in some noise
    const noise = this.createNoiseBuffer();
    const noiseSource = this.ctx.createBufferSource();
    if (noise) noiseSource.buffer = noise;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.5, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    osc.connect(gain);
    noiseSource.connect(noiseGain);
    gain.connect(output);
    noiseGain.connect(output);

    osc.start(t);
    noiseSource.start(t);
    osc.stop(t + 0.15);
    noiseSource.stop(t + 0.15);
  }

  private playLancePierce(output: GainNode, t: number): void {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    osc.type = 'square';

    // Sharp punchy transient
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.1);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(1, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    osc.connect(gain);
    gain.connect(output);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  private playAxeSmash(output: GainNode, t: number): void {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    osc.type = 'square';

    // Low heavy bass crunch
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.2);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(1, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    // Noise burst
    const noise = this.createNoiseBuffer();
    const noiseSource = this.ctx.createBufferSource();
    if (noise) noiseSource.buffer = noise;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(1, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    osc.connect(gain);
    noiseSource.connect(noiseGain);
    gain.connect(output);
    noiseGain.connect(output);

    osc.start(t);
    noiseSource.start(t);
    osc.stop(t + 0.2);
    noiseSource.stop(t + 0.2);
  }

  private playHeroStep(output: GainNode, t: number): void {
    if (!this.ctx) return;
    // Subtle 10ms click
    const noise = this.createNoiseBuffer();
    const noiseSource = this.ctx.createBufferSource();
    if (noise) noiseSource.buffer = noise;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.1, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.02);

    noiseSource.connect(noiseGain);
    noiseGain.connect(output);

    noiseSource.start(t);
    noiseSource.stop(t + 0.02);
  }

  private playItemPickup(output: GainNode, t: number): void {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    osc.type = 'square';

    // Uplifting 2-tone arpeggio (C5: 523.25Hz -> G5: 783.99Hz)
    osc.frequency.setValueAtTime(523.25, t);
    osc.frequency.setValueAtTime(783.99, t + 0.1);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.5, t + 0.02);
    gain.gain.setValueAtTime(0.5, t + 0.1);
    gain.gain.linearRampToValueAtTime(0, t + 0.3);

    osc.connect(gain);
    gain.connect(output);

    osc.start(t);
    osc.stop(t + 0.3);
  }

  private playStaircaseDescend(output: GainNode, t: number): void {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';

    // Mystery dungeon floor clear jingle
    // E5 (659.25), C5 (523.25), G4 (392.00), C5 (523.25)
    osc.frequency.setValueAtTime(659.25, t);
    osc.frequency.setValueAtTime(523.25, t + 0.15);
    osc.frequency.setValueAtTime(392.00, t + 0.3);
    osc.frequency.setValueAtTime(523.25, t + 0.45);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.4, t + 0.05);
    gain.gain.setValueAtTime(0.4, t + 0.45);
    gain.gain.linearRampToValueAtTime(0, t + 0.8);

    osc.connect(gain);
    gain.connect(output);

    osc.start(t);
    osc.stop(t + 0.8);
  }

  private createNoiseBuffer(): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 0.5; // 0.5 seconds of noise
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }
}
