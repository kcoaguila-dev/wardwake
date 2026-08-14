import * as Phaser from 'phaser';
import { WebAudioSynthService } from '../features/combat/infrastructure/WebAudioSynthService';
import { SettingsModalPresenter } from '../features/ui/presentation/SettingsModalPresenter';
import { HowToPlayModalPresenter } from '../features/ui/presentation/HowToPlayModalPresenter';
import { BestiaryModalPresenter } from '../features/ui/presentation/BestiaryModalPresenter';

export class TitleScene extends Phaser.Scene {
  private audioService!: WebAudioSynthService;
  private settingsModal!: SettingsModalPresenter;
  private howToPlayModal!: HowToPlayModalPresenter;
  private bestiaryModal!: BestiaryModalPresenter;

  private embers: Phaser.GameObjects.Arc[] = [];

  constructor() {
    super({ key: 'TitleScene' });
  }

  create(): void {
    const screenWidth = 640;
    const screenHeight = 360;

    this.audioService = new WebAudioSynthService();
    this.settingsModal = new SettingsModalPresenter(this, this.audioService);
    this.howToPlayModal = new HowToPlayModalPresenter(this);
    this.bestiaryModal = new BestiaryModalPresenter(this);

    // Start Heroic Title Prelude Theme
    this.audioService.startBgm('title');

    // Unlock Web Audio Context on first user interaction if suspended
    const unlockAudio = () => {
      this.audioService.startBgm('title');
      this.input.off('pointerdown', unlockAudio);
    };
    this.input.on('pointerdown', unlockAudio);

    // 1. Background gradient & Dungeon Grid silhouette
    this.add.rectangle(0, 0, screenWidth, screenHeight, 0x070a12).setOrigin(0, 0);

    // Subtle grid overlay for tactical dungeon feel
    const gridGraphics = this.add.graphics();
    gridGraphics.lineStyle(1, 0x1e293b, 0.3);
    for (let x = 0; x <= screenWidth; x += 32) {
      gridGraphics.lineBetween(x, 0, x, screenHeight);
    }
    for (let y = 0; y <= screenHeight; y += 32) {
      gridGraphics.lineBetween(0, y, screenWidth, y);
    }

    // 2. Floating Amber Dungeon Embers
    for (let i = 0; i < 24; i++) {
      const ember = this.add.circle(
        Phaser.Math.Between(20, screenWidth - 20),
        Phaser.Math.Between(40, screenHeight - 20),
        Phaser.Math.Between(1, 2.5),
        0xf59e0b,
        Phaser.Math.FloatBetween(0.2, 0.7)
      );
      this.embers.push(ember);

      this.tweens.add({
        targets: ember,
        y: ember.y - Phaser.Math.Between(30, 80),
        x: ember.x + Phaser.Math.Between(-20, 20),
        alpha: { from: ember.alpha, to: 0 },
        duration: Phaser.Math.Between(2500, 5000),
        repeat: -1,
        yoyo: false,
        onRepeat: () => {
          ember.setPosition(
            Phaser.Math.Between(20, screenWidth - 20),
            screenHeight + 10
          );
          ember.setAlpha(Phaser.Math.FloatBetween(0.3, 0.8));
        }
      });
    }

    // 3. Grand Title Banner
    const titleY = 95;
    const titleText = this.add.text(screenWidth / 2, titleY, 'WARDWAKE', {
      fontSize: '38px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#ffd700',
      stroke: '#78350f',
      strokeThickness: 5
    }).setOrigin(0.5, 0.5);

    // Subtle pulsating glow tween on Title
    this.tweens.add({
      targets: titleText,
      scaleX: 1.03,
      scaleY: 1.03,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.add.text(screenWidth / 2, titleY + 38, '⚔️ TACTICAL ROGUELIKE ⚔️', {
      fontSize: '11px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#38bdf8'
    }).setOrigin(0.5, 0.5);

    // 4. Menu Options Buttons
    const btnW = 200;
    const btnH = 34;
    const btnX = (screenWidth - btnW) / 2;
    const startBtnY = 165;
    const bestiaryBtnY = 205;
    const settingsBtnY = 245;
    const manualBtnY = 285;

    // A. [ NEW GAME ] Button
    const startBtn = this.add.rectangle(btnX, startBtnY, btnW, btnH, 0x1e3a8a)
      .setOrigin(0, 0)
      .setStrokeStyle(1.5, 0x38bdf8);
    this.add.text(screenWidth / 2, startBtnY + btnH / 2, '⚔️ NEW GAME', {
      fontSize: '12px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5, 0.5);

    // B. [ BESTIARY ] Button
    const bestiaryBtn = this.add.rectangle(btnX, bestiaryBtnY, btnW, btnH, 0x1e293b)
      .setOrigin(0, 0)
      .setStrokeStyle(1.5, 0x475569);
    this.add.text(screenWidth / 2, bestiaryBtnY + btnH / 2, '📖 BESTIARY', {
      fontSize: '11px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#cbd5e1'
    }).setOrigin(0.5, 0.5);

    // C. [ SETTINGS ] Button
    const settingsBtn = this.add.rectangle(btnX, settingsBtnY, btnW, btnH, 0x1e293b)
      .setOrigin(0, 0)
      .setStrokeStyle(1.5, 0x475569);
    this.add.text(screenWidth / 2, settingsBtnY + btnH / 2, '⚙️ SETTINGS', {
      fontSize: '11px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#cbd5e1'
    }).setOrigin(0.5, 0.5);

    // D. [ HOW TO PLAY ] Button
    const manualBtn = this.add.rectangle(btnX, manualBtnY, btnW, btnH, 0x1e293b)
      .setOrigin(0, 0)
      .setStrokeStyle(1.5, 0x475569);
    this.add.text(screenWidth / 2, manualBtnY + btnH / 2, '❓ HOW TO PLAY', {
      fontSize: '11px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#cbd5e1'
    }).setOrigin(0.5, 0.5);

    // Footer instructions
    this.add.text(screenWidth / 2, screenHeight - 16, '[ENTER / SPACE] Play   [B] Bestiary   [S] Settings   [H] Help', {
      fontSize: '9px',
      fontFamily: 'monospace',
      color: '#475569'
    }).setOrigin(0.5, 0.5);

    // Start Game Transition
    const handleStartGame = () => {
      if (this.settingsModal.isVisible() || this.howToPlayModal.isVisible() || this.bestiaryModal.isVisible()) return;
      this.audioService.playSound('sword_slash');
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('TownScene');
      });
    };

    // Screen-space pointer click handling
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.settingsModal.isVisible() || this.howToPlayModal.isVisible() || this.bestiaryModal.isVisible()) return;

      const px = pointer.x;
      const py = pointer.y;

      if (px >= btnX && px <= btnX + btnW && py >= startBtnY && py <= startBtnY + btnH) {
        handleStartGame();
      } else if (px >= btnX && px <= btnX + btnW && py >= bestiaryBtnY && py <= bestiaryBtnY + btnH) {
        this.audioService.playSound('hero_step');
        this.bestiaryModal.show();
      } else if (px >= btnX && px <= btnX + btnW && py >= settingsBtnY && py <= settingsBtnY + btnH) {
        this.audioService.playSound('hero_step');
        this.settingsModal.show();
      } else if (px >= btnX && px <= btnX + btnW && py >= manualBtnY && py <= manualBtnY + btnH) {
        this.audioService.playSound('hero_step');
        this.howToPlayModal.show();
      }
    });

    // Hover styling
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.settingsModal.isVisible() || this.howToPlayModal.isVisible() || this.bestiaryModal.isVisible()) return;

      const px = pointer.x;
      const py = pointer.y;

      if (px >= btnX && px <= btnX + btnW && py >= startBtnY && py <= startBtnY + btnH) {
        startBtn.setFillStyle(0x2563eb);
      } else {
        startBtn.setFillStyle(0x1e3a8a);
      }

      if (px >= btnX && px <= btnX + btnW && py >= bestiaryBtnY && py <= bestiaryBtnY + btnH) {
        bestiaryBtn.setFillStyle(0x334155);
      } else {
        bestiaryBtn.setFillStyle(0x1e293b);
      }

      if (px >= btnX && px <= btnX + btnW && py >= settingsBtnY && py <= settingsBtnY + btnH) {
        settingsBtn.setFillStyle(0x334155);
      } else {
        settingsBtn.setFillStyle(0x1e293b);
      }

      if (px >= btnX && px <= btnX + btnW && py >= manualBtnY && py <= manualBtnY + btnH) {
        manualBtn.setFillStyle(0x334155);
      } else {
        manualBtn.setFillStyle(0x1e293b);
      }
    });

    // Keyboard support
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const code = event.code;

      if (this.settingsModal.isVisible()) {
        if (key === 'escape') this.settingsModal.hide();
        return;
      }
      if (this.howToPlayModal.isVisible()) {
        if (key === 'escape') this.howToPlayModal.hide();
        return;
      }
      if (this.bestiaryModal.isVisible()) {
        if (key === 'escape') this.bestiaryModal.hide();
        return;
      }

      if (key === 'enter' || key === ' ' || code === 'Space') {
        handleStartGame();
      } else if (key === 'b') {
        this.bestiaryModal.show();
      } else if (key === 's') {
        this.settingsModal.show();
      } else if (key === 'h') {
        this.howToPlayModal.show();
      }
    });
  }
}
