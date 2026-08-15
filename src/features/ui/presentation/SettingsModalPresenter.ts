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
  private controlsText: Phaser.GameObjects.Text;
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
    this.backdrop = this.scene.add.rectangle(0, 0, screenWidth, screenHeight, 0x000000, 0.85)
      .setOrigin(0, 0)
      .setInteractive();

    const modalWidth = 360;
    const modalHeight = 300;
    const modalX = (screenWidth - modalWidth) / 2;
    const modalY = (screenHeight - modalHeight) / 2;

    this.modalBg = this.scene.add.rectangle(modalX, modalY, modalWidth, modalHeight, 0x0c1322, 0.98)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x38bdf8)
      .setInteractive();

    // 1. Title
    this.titleText = this.scene.add.text(screenWidth / 2, modalY + 20, '⚙️ SETTINGS', {
      fontSize: '14px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#38bdf8'
    }).setOrigin(0.5, 0.5);

    // 2. Audio Sliders Section
    const bgmRowY = modalY + 50;
    const sfxRowY = modalY + 80;
    const muteRowY = modalY + 110;

    // BGM Controls: [ - ] BGM: 80% [ + ]
    const btnMinusBgmX = modalX + 30;
    const btnPlusBgmX = modalX + modalWidth - 60;
    const bgmBtnW = 30;
    const bgmBtnH = 22;

    const bgmMinusBtn = this.scene.add.rectangle(btnMinusBgmX, bgmRowY, bgmBtnW, bgmBtnH, 0x1e293b).setOrigin(0, 0);
    this.scene.add.text(btnMinusBgmX + 10, bgmRowY + 4, '➖', { fontSize: '11px' });

    const bgmPlusBtn = this.scene.add.rectangle(btnPlusBgmX, bgmRowY, bgmBtnW, bgmBtnH, 0x1e293b).setOrigin(0, 0);
    this.scene.add.text(btnPlusBgmX + 10, bgmRowY + 4, '➕', { fontSize: '11px' });

    this.bgmLabel = this.scene.add.text(screenWidth / 2, bgmRowY + 11, `🎵 BGM Volume: ${Math.round(this.audioService.bgmVolume * 100)}%`, {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#f8fafc'
    }).setOrigin(0.5, 0.5);

    // SFX Controls: [ - ] SFX: 80% [ + ]
    const sfxMinusBtn = this.scene.add.rectangle(btnMinusBgmX, sfxRowY, bgmBtnW, bgmBtnH, 0x1e293b).setOrigin(0, 0);
    this.scene.add.text(btnMinusBgmX + 10, sfxRowY + 4, '➖', { fontSize: '11px' });

    const sfxPlusBtn = this.scene.add.rectangle(btnPlusBgmX, sfxRowY, bgmBtnW, bgmBtnH, 0x1e293b).setOrigin(0, 0);
    this.scene.add.text(btnPlusBgmX + 10, sfxRowY + 4, '➕', { fontSize: '11px' });

    this.sfxLabel = this.scene.add.text(screenWidth / 2, sfxRowY + 11, `💥 SFX Volume: ${Math.round(this.audioService.sfxVolume * 100)}%`, {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#f8fafc'
    }).setOrigin(0.5, 0.5);

    // Mute Toggle Button
    const muteBtnW = 160;
    const muteBtnH = 24;
    const muteBtnX = (screenWidth - muteBtnW) / 2;
    const muteBtn = this.scene.add.rectangle(muteBtnX, muteRowY, muteBtnW, muteBtnH, 0x1e293b).setOrigin(0, 0);

    this.muteBtnText = this.scene.add.text(screenWidth / 2, muteRowY + 12, this.audioService.isMuted ? '🔇 Sound: MUTED' : '🔊 Sound: ACTIVE', {
      fontSize: '11px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: this.audioService.isMuted ? '#f87171' : '#4ade80'
    }).setOrigin(0.5, 0.5);

    // Bestiary Button
    const bestiaryBtnY = muteRowY + 30;
    const bestiaryBtn = this.scene.add.rectangle(muteBtnX, bestiaryBtnY, muteBtnW, muteBtnH, 0x1e293b).setOrigin(0, 0)
      .setStrokeStyle(1, 0x475569);

    const bestiaryBtnText = this.scene.add.text(screenWidth / 2, bestiaryBtnY + 12, '📖 OPEN BESTIARY', {
      fontSize: '11px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#cbd5e1'
    }).setOrigin(0.5, 0.5);


    // Save & Quit Button
    const saveBtnY = bestiaryBtnY + 30;
    const saveBtn = this.scene.add.rectangle(muteBtnX, saveBtnY, muteBtnW, muteBtnH, 0xb91c1c).setOrigin(0, 0)
      .setStrokeStyle(1, 0xef4444);

    const saveBtnText = this.scene.add.text(screenWidth / 2, saveBtnY + 12, '💾 SAVE & EXIT TO TITLE', {
      fontSize: '11px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#fca5a5'
    }).setOrigin(0.5, 0.5);

    // 3. Keybindings Quick Reference Box

    const boxY = modalY + 172;
    this.scene.add.rectangle(modalX + 15, boxY, modalWidth - 30, 65, 0x090d16, 0.9)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x334155);

    const controlsLines = [
      '🎮 CONTROLS REFERENCE:',
      '• WASD / Arrows  : Move & Bump Attack',
      '• Shift + Move   : Corridor Sprint & Ally Swap',
      '• Tab / Space    : Switch Leader / Wait Turn',
      '• I / Esc        : Open Inventory / Cancel Menu'
    ];

    this.controlsText = this.scene.add.text(modalX + 25, boxY + 8, controlsLines.join('\n'), {
      fontSize: '9.5px',
      fontFamily: 'monospace',
      lineSpacing: 3,
      color: '#cbd5e1'
    });

    // 4. Close Button
    const closeBtnW = 120;
    const closeBtnH = 26;
    const closeBtnX = (screenWidth - closeBtnW) / 2;
    const closeBtnY = modalY + modalHeight - 34;

    const closeBtn = this.scene.add.rectangle(closeBtnX, closeBtnY, closeBtnW, closeBtnH, 0x334155)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x64748b);

    const closeBtnText = this.scene.add.text(screenWidth / 2, closeBtnY + 13, '❌ CLOSE (Esc)', {
      fontSize: '11px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5, 0.5);

    // Screen-space pointer listener
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.isVisible() || this.bestiaryModal.isVisible()) return;

      const px = pointer.x;
      const py = pointer.y;

      // BGM Minus
      if (px >= btnMinusBgmX && px <= btnMinusBgmX + bgmBtnW && py >= bgmRowY && py <= bgmRowY + bgmBtnH) {
        this.audioService.setBgmVolume(this.audioService.bgmVolume - 0.1);
        this.updateLabels();
      }
      // BGM Plus
      else if (px >= btnPlusBgmX && px <= btnPlusBgmX + bgmBtnW && py >= bgmRowY && py <= bgmRowY + bgmBtnH) {
        this.audioService.setBgmVolume(this.audioService.bgmVolume + 0.1);
        this.updateLabels();
      }
      // SFX Minus
      else if (px >= btnMinusBgmX && px <= btnMinusBgmX + bgmBtnW && py >= sfxRowY && py <= sfxRowY + bgmBtnH) {
        this.audioService.setSfxVolume(this.audioService.sfxVolume - 0.1);
        this.audioService.playSound('hero_step');
        this.updateLabels();
      }
      // SFX Plus
      else if (px >= btnPlusBgmX && px <= btnPlusBgmX + bgmBtnW && py >= sfxRowY && py <= sfxRowY + bgmBtnH) {
        this.audioService.setSfxVolume(this.audioService.sfxVolume + 0.1);
        this.audioService.playSound('hero_step');
        this.updateLabels();
      }
      // Mute Toggle
      else if (px >= muteBtnX && px <= muteBtnX + muteBtnW && py >= muteRowY && py <= muteRowY + muteBtnH) {
        this.audioService.toggleMute();
        this.updateLabels();
      }
      // Bestiary Button
      else if (px >= muteBtnX && px <= muteBtnX + muteBtnW && py >= bestiaryBtnY && py <= bestiaryBtnY + muteBtnH) {
        this.audioService.playSound('hero_step');
        this.bestiaryModal.show();
      }

      // Save & Quit Button
      else if (px >= muteBtnX && px <= muteBtnX + muteBtnW && py >= saveBtnY && py <= saveBtnY + muteBtnH) {
        this.audioService.playSound('hero_step');
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
      bgmPlusBtn,
      this.bgmLabel,
      sfxMinusBtn,
      sfxPlusBtn,
      this.sfxLabel,
      muteBtn,
      this.muteBtnText,
      bestiaryBtn,
      bestiaryBtnText,
      saveBtn,
      saveBtnText,
      this.controlsText,
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
