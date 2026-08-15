import * as Phaser from 'phaser';
import { WebAudioSynthService } from '../../combat/infrastructure/WebAudioSynthService';
import { BestiaryModalPresenter } from './BestiaryModalPresenter';

export class SettingsModalPresenter {
  private container: Phaser.GameObjects.Container;
  private backdrop: Phaser.GameObjects.Rectangle;
  private modalBg: Phaser.GameObjects.Rectangle;
  private titleText: Phaser.GameObjects.Text;
  private bgmLabel: Phaser.GameObjects.Text;
  private sfxLabel: Phaser.GameObjects.Text;
  private muteBtnText: Phaser.GameObjects.Text;
  public bestiaryModal: BestiaryModalPresenter;

  public onClose?: () => void;
  public onQuit?: () => void;

  constructor(private scene: Phaser.Scene, private audioService: WebAudioSynthService) {
    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(350);
    this.container.setScrollFactor(0);
    this.container.setVisible(false);

    this.bestiaryModal = new BestiaryModalPresenter(this.scene);

    const screenWidth = 640;
    const screenHeight = 360;

    // Dark backdrop shield
    this.backdrop = this.scene.add.rectangle(0, 0, screenWidth, screenHeight, 0x000000, 0.88)
      .setOrigin(0, 0)
      .setInteractive();

    const modalWidth = 380;
    const modalHeight = 320;
    const modalX = (screenWidth - modalWidth) / 2;
    const modalY = (screenHeight - modalHeight) / 2;

    this.modalBg = this.scene.add.rectangle(modalX, modalY, modalWidth, modalHeight, 0x0c1322, 0.98)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x38bdf8)
      .setInteractive();

    // 1. Title
    this.titleText = this.scene.add.text(screenWidth / 2, modalY + 18, '⚙️ SETTINGS', {
      fontSize: '14px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#38bdf8'
    }).setOrigin(0.5, 0.5);

    // 2. Audio Sliders Section
    const bgmRowY = modalY + 44;
    const sfxRowY = modalY + 70;
    const muteRowY = modalY + 98;

    const btnMinusX = modalX + 28;
    const btnPlusX = modalX + modalWidth - 56;
    const adjustBtnW = 28;
    const adjustBtnH = 20;

    // BGM Controls: [ - ] BGM: 80% [ + ]
    const bgmMinusBtn = this.scene.add.rectangle(btnMinusX, bgmRowY, adjustBtnW, adjustBtnH, 0x1e293b)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x475569)
      .setInteractive({ useHandCursor: true });
    const bgmMinusText = this.scene.add.text(btnMinusX + adjustBtnW / 2, bgmRowY + adjustBtnH / 2, '➖', {
      fontSize: '10px'
    }).setOrigin(0.5, 0.5);

    const bgmPlusBtn = this.scene.add.rectangle(btnPlusX, bgmRowY, adjustBtnW, adjustBtnH, 0x1e293b)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x475569)
      .setInteractive({ useHandCursor: true });
    const bgmPlusText = this.scene.add.text(btnPlusX + adjustBtnW / 2, bgmRowY + adjustBtnH / 2, '➕', {
      fontSize: '10px'
    }).setOrigin(0.5, 0.5);

    this.bgmLabel = this.scene.add.text(screenWidth / 2, bgmRowY + adjustBtnH / 2, `🎵 BGM Volume: ${Math.round(this.audioService.bgmVolume * 100)}%`, {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#f8fafc'
    }).setOrigin(0.5, 0.5);

    // SFX Controls: [ - ] SFX: 80% [ + ]
    const sfxMinusBtn = this.scene.add.rectangle(btnMinusX, sfxRowY, adjustBtnW, adjustBtnH, 0x1e293b)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x475569)
      .setInteractive({ useHandCursor: true });
    const sfxMinusText = this.scene.add.text(btnMinusX + adjustBtnW / 2, sfxRowY + adjustBtnH / 2, '➖', {
      fontSize: '10px'
    }).setOrigin(0.5, 0.5);

    const sfxPlusBtn = this.scene.add.rectangle(btnPlusX, sfxRowY, adjustBtnW, adjustBtnH, 0x1e293b)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x475569)
      .setInteractive({ useHandCursor: true });
    const sfxPlusText = this.scene.add.text(btnPlusX + adjustBtnW / 2, sfxRowY + adjustBtnH / 2, '➕', {
      fontSize: '10px'
    }).setOrigin(0.5, 0.5);

    this.sfxLabel = this.scene.add.text(screenWidth / 2, sfxRowY + adjustBtnH / 2, `💥 SFX Volume: ${Math.round(this.audioService.sfxVolume * 100)}%`, {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#f8fafc'
    }).setOrigin(0.5, 0.5);

    // Mute Toggle Button
    const mainBtnW = 180;
    const mainBtnH = 22;
    const mainBtnX = (screenWidth - mainBtnW) / 2;

    const muteBtn = this.scene.add.rectangle(mainBtnX, muteRowY, mainBtnW, mainBtnH, 0x1e293b)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x475569)
      .setInteractive({ useHandCursor: true });

    this.muteBtnText = this.scene.add.text(screenWidth / 2, muteRowY + mainBtnH / 2, this.audioService.isMuted ? '🔇 Sound: MUTED' : '🔊 Sound: ACTIVE', {
      fontSize: '10.5px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: this.audioService.isMuted ? '#f87171' : '#4ade80'
    }).setOrigin(0.5, 0.5);

    // Bestiary Button
    const bestiaryBtnY = muteRowY + 28;
    const bestiaryBtn = this.scene.add.rectangle(mainBtnX, bestiaryBtnY, mainBtnW, mainBtnH, 0x1e293b)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x475569)
      .setInteractive({ useHandCursor: true });

    const bestiaryBtnText = this.scene.add.text(screenWidth / 2, bestiaryBtnY + mainBtnH / 2, '📖 OPEN BESTIARY', {
      fontSize: '10.5px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#cbd5e1'
    }).setOrigin(0.5, 0.5);

    // Save & Quit Button
    const saveBtnY = bestiaryBtnY + 28;
    const saveBtn = this.scene.add.rectangle(mainBtnX, saveBtnY, mainBtnW, mainBtnH, 0xb91c1c)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0xef4444)
      .setInteractive({ useHandCursor: true });

    const saveBtnText = this.scene.add.text(screenWidth / 2, saveBtnY + mainBtnH / 2, '💾 SAVE & EXIT TO TITLE', {
      fontSize: '10.5px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#fef2f2'
    }).setOrigin(0.5, 0.5);

    // 3. Keybindings Quick Reference Box (Positioned cleanly below Save button!)
    const boxY = saveBtnY + 34;
    const boxH = 50;
    const boxW = modalWidth - 30;
    const boxBg = this.scene.add.rectangle(modalX + 15, boxY, boxW, boxH, 0x090d16, 0.95)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x334155);

    const controlsLines = [
      '🎮 CONTROLS REFERENCE:',
      '• WASD / Arrows : Move & Attack   • Shift: Sprint',
      '• Tab / Space   : Switch / Wait   • I/Esc: Items/Cancel'
    ];

    const controlsText = this.scene.add.text(modalX + 24, boxY + 6, controlsLines.join('\n'), {
      fontSize: '9px',
      fontFamily: 'monospace',
      lineSpacing: 3,
      color: '#cbd5e1'
    });

    // 4. Close Button
    const closeBtnW = 130;
    const closeBtnH = 24;
    const closeBtnX = (screenWidth - closeBtnW) / 2;
    const closeBtnY = modalY + modalHeight - 30;

    const closeBtn = this.scene.add.rectangle(closeBtnX, closeBtnY, closeBtnW, closeBtnH, 0x334155)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x64748b)
      .setInteractive({ useHandCursor: true });

    const closeBtnText = this.scene.add.text(screenWidth / 2, closeBtnY + closeBtnH / 2, '❌ CLOSE (Esc)', {
      fontSize: '10.5px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5, 0.5);

    // Button Hover Effects
    [
      { btn: bgmMinusBtn, def: 0x1e293b, hov: 0x334155 },
      { btn: bgmPlusBtn, def: 0x1e293b, hov: 0x334155 },
      { btn: sfxMinusBtn, def: 0x1e293b, hov: 0x334155 },
      { btn: sfxPlusBtn, def: 0x1e293b, hov: 0x334155 },
      { btn: muteBtn, def: 0x1e293b, hov: 0x334155 },
      { btn: bestiaryBtn, def: 0x1e293b, hov: 0x334155 },
      { btn: saveBtn, def: 0xb91c1c, hov: 0xdc2626 },
      { btn: closeBtn, def: 0x334155, hov: 0x475569 }
    ].forEach(({ btn, def, hov }) => {
      btn.on('pointerover', () => btn.setFillStyle(hov));
      btn.on('pointerout', () => btn.setFillStyle(def));
    });

    // Pointer Click Dispatcher
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.isVisible() || this.bestiaryModal.isVisible()) return;

      const px = pointer.x;
      const py = pointer.y;

      // BGM Minus
      if (px >= btnMinusX && px <= btnMinusX + adjustBtnW && py >= bgmRowY && py <= bgmRowY + adjustBtnH) {
        this.audioService.setBgmVolume(this.audioService.bgmVolume - 0.1);
        this.updateLabels();
      }
      // BGM Plus
      else if (px >= btnPlusX && px <= btnPlusX + adjustBtnW && py >= bgmRowY && py <= bgmRowY + adjustBtnH) {
        this.audioService.setBgmVolume(this.audioService.bgmVolume + 0.1);
        this.updateLabels();
      }
      // SFX Minus
      else if (px >= btnMinusX && px <= btnMinusX + adjustBtnW && py >= sfxRowY && py <= sfxRowY + adjustBtnH) {
        this.audioService.setSfxVolume(this.audioService.sfxVolume - 0.1);
        this.audioService.playSound('hero_step');
        this.updateLabels();
      }
      // SFX Plus
      else if (px >= btnPlusX && px <= btnPlusX + adjustBtnW && py >= sfxRowY && py <= sfxRowY + adjustBtnH) {
        this.audioService.setSfxVolume(this.audioService.sfxVolume + 0.1);
        this.audioService.playSound('hero_step');
        this.updateLabels();
      }
      // Mute Toggle
      else if (px >= mainBtnX && px <= mainBtnX + mainBtnW && py >= muteRowY && py <= muteRowY + mainBtnH) {
        this.audioService.toggleMute();
        this.updateLabels();
      }
      // Bestiary Button
      else if (px >= mainBtnX && px <= mainBtnX + mainBtnW && py >= bestiaryBtnY && py <= bestiaryBtnY + mainBtnH) {
        this.audioService.playSound('hero_step');
        this.bestiaryModal.show();
      }
      // Save & Quit Button
      else if (px >= mainBtnX && px <= mainBtnX + mainBtnW && py >= saveBtnY && py <= saveBtnY + mainBtnH) {
        this.audioService.playSound('hero_step');
        this.hide();
        if (this.onQuit) this.onQuit();
      }
      // Close Button
      else if (px >= closeBtnX && px <= closeBtnX + closeBtnW && py >= closeBtnY && py <= closeBtnY + closeBtnH) {
        this.hide();
        if (this.onClose) this.onClose();
      }
    });

    this.container.add([
      this.backdrop,
      this.modalBg,
      this.titleText,
      bgmMinusBtn,
      bgmMinusText,
      bgmPlusBtn,
      bgmPlusText,
      this.bgmLabel,
      sfxMinusBtn,
      sfxMinusText,
      sfxPlusBtn,
      sfxPlusText,
      this.sfxLabel,
      muteBtn,
      this.muteBtnText,
      bestiaryBtn,
      bestiaryBtnText,
      saveBtn,
      saveBtnText,
      boxBg,
      controlsText,
      closeBtn,
      closeBtnText
    ]);
  }

  private updateLabels(): void {
    this.bgmLabel.setText(`🎵 BGM Volume: ${Math.round(this.audioService.bgmVolume * 100)}%`);
    this.sfxLabel.setText(`💥 SFX Volume: ${Math.round(this.audioService.sfxVolume * 100)}%`);
    this.muteBtnText.setText(this.audioService.isMuted ? '🔇 Sound: MUTED' : '🔊 Sound: ACTIVE');
    this.muteBtnText.setColor(this.audioService.isMuted ? '#f87171' : '#4ade80');
  }

  public show(): void {
    this.updateLabels();
    this.container.setVisible(true);
  }

  public hide(): void {
    this.container.setVisible(false);
  }

  public isVisible(): boolean {
    return this.container.visible;
  }

  public destroy(): void {
    this.container.destroy();
  }
}
