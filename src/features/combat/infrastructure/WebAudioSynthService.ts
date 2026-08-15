import { IAudioService } from '../application/ports/IAudioService';

export class WebAudioSynthService implements IAudioService {
  private static sharedCtx: AudioContext | null = null;
  private static sharedBgmGain: GainNode | null = null;
  public static globalBgmInterval: any = null;

  public isMuted: boolean = false;
  public bgmVolume: number = 0.8;
  public sfxVolume: number = 0.8;

  private bgmIntervalId: any = null;
  private currentBgmMode: 'title' | 'explore' | 'combat' | 'town' | 'dread' | null = null;
  private bgmStep: number = 0;

  constructor() {
    this.ensureContext();
    this.loadSettings();
  }

  private ensureContext(): void {
    if (!WebAudioSynthService.sharedCtx || WebAudioSynthService.sharedCtx.state === 'closed') {
      try {
        const AudioContextClass = typeof window !== 'undefined' ? (window.AudioContext || (window as any).webkitAudioContext) : null;
        if (AudioContextClass) {
          WebAudioSynthService.sharedCtx = new AudioContextClass();
        }
      } catch (e) {}
    }
    if (WebAudioSynthService.sharedCtx && WebAudioSynthService.sharedCtx.state === 'suspended') {
      WebAudioSynthService.sharedCtx.resume().catch(() => {});
    }
    if (WebAudioSynthService.sharedCtx) {
      if (!WebAudioSynthService.sharedBgmGain || WebAudioSynthService.sharedBgmGain.context !== WebAudioSynthService.sharedCtx) {
        try {
          WebAudioSynthService.sharedBgmGain = WebAudioSynthService.sharedCtx.createGain();
          WebAudioSynthService.sharedBgmGain.connect(WebAudioSynthService.sharedCtx.destination);
        } catch (e) {}
      } else {
        // Ensure it's connected even if we didn't just create it
        try {
          WebAudioSynthService.sharedBgmGain.disconnect();
          WebAudioSynthService.sharedBgmGain.connect(WebAudioSynthService.sharedCtx.destination);
        } catch (e) {}
      }
    }
  }

  public async resumeAudioContext(): Promise<void> {
    if (this.ctx && this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch (e) {}
    }
  }

  private get ctx(): AudioContext | null {
    return WebAudioSynthService.sharedCtx;
  }

  private get bgmGain(): GainNode | null {
    return WebAudioSynthService.sharedBgmGain;
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

  public startBgm(mode: 'title' | 'explore' | 'combat' | 'town' | 'dread'): void {
    if (this.currentBgmMode === mode && this.bgmIntervalId) return;
    this.stopBgm();
    this.currentBgmMode = mode;
    this.bgmStep = 0;

    this.ensureContext();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    if (this.bgmGain) {
      this.bgmGain.gain.value = this.isMuted ? 0 : 0.22 * this.bgmVolume;
    }

    const intervalMs = mode === 'combat' || mode === 'dread' ? 130 : (mode === 'title' ? 200 : 220);
    this.bgmIntervalId = setInterval(() => {
      this.tickBgm();
    }, intervalMs);
    WebAudioSynthService.globalBgmInterval = this.bgmIntervalId;
  }

  public stopBgm(): void {
    if (this.bgmIntervalId) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
    if (WebAudioSynthService.globalBgmInterval) {
      clearInterval(WebAudioSynthService.globalBgmInterval);
      WebAudioSynthService.globalBgmInterval = null;
    }
    this.currentBgmMode = null;
  }

  private tickBgm(): void {
    if (this.isMuted || !this.ctx || !this.bgmGain || this.bgmVolume <= 0) return;

    const t = this.ctx.currentTime;
    const mode = this.currentBgmMode;

    if (mode === 'title') {
      // Heroic & Atmospheric Title Prelude (D-Minor / F-Major Lyrical Theme)
      const melodyNotes = [
        293.66, 349.23, 440.00, 587.33, 523.25, 440.00, 392.00, 440.00, // D4, F4, A4, D5, C5, A4, G4, A4
        349.23, 392.00, 440.00, 523.25, 659.25, 587.33, 523.25, 440.00, // F4, G4, A4, C5, E5, D5, C5, A4
        466.16, 440.00, 392.00, 349.23, 329.63, 392.00, 349.23, 293.66, // Bb4, A4, G4, F4, E4, G4, F4, D4
        293.66, 329.63, 349.23, 440.00, 587.33, 440.00, 349.23, 293.66  // D4, E4, F4, A4, D5, A4, F4, D4
      ];

      const freq = melodyNotes[this.bgmStep % melodyNotes.length]!;
      this.playSynthPluck(freq, 'triangle', 0.35, t, 0.7);

      // Shimmering Harmony on every 4th step
      if (this.bgmStep % 4 === 0) {
        this.playSynthPluck(freq * 2, 'sine', 0.4, t, 0.35);
      }

      // Warm Sub-Bass Foundation on every 8th step
      if (this.bgmStep % 8 === 0) {
        const bassRoots = [73.42, 87.31, 58.27, 55.00]; // D2, F2, Bb1, A1
        const bassFreq = bassRoots[Math.floor((this.bgmStep % 32) / 8)]!;
        this.playSynthPluck(bassFreq, 'sine', 0.9, t, 0.85);
      }
    } else if (mode === 'explore') {
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
    } else if (mode === 'dread') {
      // Ominous Dread FOE / Boss Tension Theme (Heavy Sub-Bass & Fast Percussive Synth)
      const dreadBass = [55.00, 58.27, 55.00, 51.91, 55.00, 58.27, 65.41, 61.74]; // A1, Bb1, A1, Ab1, A1, Bb1, C2, B1
      const dreadLead = [220.00, 233.08, 220.00, 207.65, 293.66, 277.18, 246.94, 233.08];

      const bassFreq = dreadBass[this.bgmStep % dreadBass.length]!;
      this.playSynthPluck(bassFreq, 'sawtooth', 0.12, t, 0.9);

      const leadFreq = dreadLead[this.bgmStep % dreadLead.length]!;
      this.playSynthPluck(leadFreq, 'square', 0.10, t, 0.6);
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
