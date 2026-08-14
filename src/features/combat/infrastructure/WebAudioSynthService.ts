import { IAudioService } from '../application/ports/IAudioService';

export class WebAudioSynthService implements IAudioService {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  public bgmVolume: number = 0.8;
  public sfxVolume: number = 0.8;

  private bgmIntervalId: any = null;
  private currentBgmMode: 'explore' | 'combat' | null = null;
  private bgmStep: number = 0;
  private bgmGain: GainNode | null = null;

  constructor() {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    } catch (e) {
      console.warn('Web Audio API not supported in this environment');
    }

    this.loadSettings();
  }

  private loadSettings(): void {
    try {
      const saved = localStorage.getItem('wardwake_audio_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.bgmVolume === 'number') this.bgmVolume = parsed.bgmVolume;
        if (typeof parsed.sfxVolume === 'number') this.sfxVolume = parsed.sfxVolume;
        if (typeof parsed.isMuted === 'boolean') this.isMuted = parsed.isMuted;
      }
    } catch (e) {}
  }

  private saveSettings(): void {
    try {
      localStorage.setItem('wardwake_audio_settings', JSON.stringify({
        bgmVolume: this.bgmVolume,
        sfxVolume: this.sfxVolume,
        isMuted: this.isMuted
      }));
    } catch (e) {}
  }

  public setBgmVolume(volume: number): void {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
    if (this.bgmGain) {
      this.bgmGain.gain.value = this.isMuted ? 0 : 0.22 * this.bgmVolume;
    }
    this.saveSettings();
  }

  public setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  public toggleMute(): void {
    this.isMuted = !this.isMuted;
    if (this.bgmGain) {
      this.bgmGain.gain.value = this.isMuted ? 0 : 0.22 * this.bgmVolume;
    }
    this.saveSettings();
  }

  public startBgm(mode: 'explore' | 'combat'): void {
    if (this.currentBgmMode === mode && this.bgmIntervalId) return;
    this.stopBgm();
    this.currentBgmMode = mode;
    this.bgmStep = 0;

    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    if (!this.bgmGain) {
      this.bgmGain = this.ctx.createGain();
      this.bgmGain.connect(this.ctx.destination);
    }
    this.bgmGain.gain.value = this.isMuted ? 0 : 0.22 * this.bgmVolume;

    const intervalMs = mode === 'combat' ? 140 : 220;
    this.bgmIntervalId = setInterval(() => {
      this.tickBgm();
    }, intervalMs);
  }

  public stopBgm(): void {
    if (this.bgmIntervalId) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
    this.currentBgmMode = null;
  }

  private tickBgm(): void {
    if (this.isMuted || !this.ctx || !this.bgmGain || this.bgmVolume <= 0) return;

    const t = this.ctx.currentTime;
    const mode = this.currentBgmMode;

    if (mode === 'explore') {
      // Atmospheric Dungeon Exploration Arpeggios (D Minor)
      const notes = [
        146.83, 220.00, 261.63, 293.66, 349.23, 293.66, 261.63, 220.00, // D3, A3, C4, D4, F4, D4, C4, A3
        130.81, 196.00, 261.63, 293.66, 329.63, 293.66, 261.63, 196.00  // C3, G3, C4, D4, E4, D4, C4, G3
      ];
      const freq = notes[this.bgmStep % notes.length]!;
      this.playSynthPluck(freq, 'triangle', 0.22, t, 0.6);

      // Soft bass drone on every 8th step
      if (this.bgmStep % 8 === 0) {
        const root = (this.bgmStep % 16 === 0) ? 73.42 : 65.41; // D2 or C2
        this.playSynthPluck(root, 'sine', 0.8, t, 0.9);
      }
    } else if (mode === 'combat') {
      // Driving Battle Bassline & Tension Lead
      const bassNotes = [73.42, 73.42, 87.31, 73.42, 98.00, 73.42, 110.00, 98.00]; // D2, D2, F2, D2, G2, D2, A2, G2
      const leadNotes = [293.66, 0, 349.23, 0, 440.00, 392.00, 349.23, 329.63];

      const bassFreq = bassNotes[this.bgmStep % bassNotes.length]!;
      this.playSynthPluck(bassFreq, 'square', 0.14, t, 0.7);

      const leadFreq = leadNotes[this.bgmStep % leadNotes.length]!;
      if (leadFreq > 0) {
        this.playSynthPluck(leadFreq, 'sawtooth', 0.16, t, 0.45);
      }
    }

    this.bgmStep++;
  }

  private playSynthPluck(freq: number, type: OscillatorType, duration: number, t: number, volScale: number = 1.0): void {
    if (!this.ctx || !this.bgmGain) return;
    try {
      const osc = this.ctx.createOscillator();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);

      const noteGain = this.ctx.createGain();
      noteGain.gain.setValueAtTime(0.02 * volScale, t);
      noteGain.gain.linearRampToValueAtTime(0.25 * volScale, t + 0.02);
      noteGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      osc.connect(noteGain);
      noteGain.connect(this.bgmGain);

      osc.start(t);
      osc.stop(t + duration);
    } catch (e) {}
  }

  public playSound(soundId: string): void {
    if (this.isMuted || !this.ctx || this.sfxVolume <= 0) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    const t = this.ctx.currentTime;
    const masterGain = this.ctx.createGain();
    masterGain.connect(this.ctx.destination);
    masterGain.gain.value = 0.28 * this.sfxVolume;

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
      case 'trap_spring':
        this.playTrapSpring(masterGain, t);
        break;
      case 'boss_roar':
        this.playBossRoar(masterGain, t);
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

    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.15);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(1, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

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

    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.2);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(1, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

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

  private playTrapSpring(output: GainNode, t: number): void {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(900, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.12);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

    osc.connect(gain);
    gain.connect(output);

    osc.start(t);
    osc.stop(t + 0.12);
  }

  private playBossRoar(output: GainNode, t: number): void {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, t);
    osc.frequency.linearRampToValueAtTime(60, t + 0.4);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);

    osc.connect(gain);
    gain.connect(output);

    osc.start(t);
    osc.stop(t + 0.5);
  }

  private createNoiseBuffer(): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 0.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }
}
