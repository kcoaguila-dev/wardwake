import * as Phaser from 'phaser';
import { TownManagerUseCase } from '../application/TownManagerUseCase';
import { TownStorageService } from '../infrastructure/TownStorageService';
import { TownUpgrades } from '../domain/TownData';

export class GuildMasterModalPresenter {
  private container: Phaser.GameObjects.Container;
  private goldText: Phaser.GameObjects.Text;
  private hpStatsText: Phaser.GameObjects.Text;
  private bellyStatsText: Phaser.GameObjects.Text;
  private atkStatsText: Phaser.GameObjects.Text;

  constructor(private scene: Phaser.Scene, private townManager: TownManagerUseCase) {
    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(300);
    this.container.setScrollFactor(0);
    this.container.setVisible(false);

    const screenWidth = 640;
    const screenHeight = 360;

    const backdrop = this.scene.add.rectangle(0, 0, screenWidth, screenHeight, 0x000000, 0.75)
      .setOrigin(0, 0)
      .setInteractive();

    const modalWidth = 340;
    const modalHeight = 260;
    const modalX = (screenWidth - modalWidth) / 2;
    const modalY = (screenHeight - modalHeight) / 2;

    const modalBg = this.scene.add.rectangle(modalX, modalY, modalWidth, modalHeight, 0x0f172a, 1)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0xd97706)
      .setInteractive();

    const titleText = this.scene.add.text(screenWidth / 2, modalY + 20, '🏛️ GUILD MASTER', {
      fontSize: '16px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#fcd34d'
    }).setOrigin(0.5, 0.5);

    this.goldText = this.scene.add.text(screenWidth / 2, modalY + 45, '', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#fbbf24',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);

    // Upgrades UI
    const startY = modalY + 80;
    const spacing = 45;

    // HP Upgrade
    this.hpStatsText = this.createUpgradeRow('maxHp', '❤️ +10 Max HP', startY);
    // Belly Upgrade
    this.bellyStatsText = this.createUpgradeRow('maxBelly', '🍖 +20 Max Belly', startY + spacing);
    // ATK Upgrade
    this.atkStatsText = this.createUpgradeRow('attack', '⚔️ +1 ATK', startY + spacing * 2);

    const closeBtnW = 100;
    const closeBtnH = 28;
    const closeBtnX = (screenWidth - closeBtnW) / 2;
    const closeBtnY = modalY + modalHeight - 40;

    const closeBtn = this.scene.add.rectangle(closeBtnX, closeBtnY, closeBtnW, closeBtnH, 0x334155)
      .setOrigin(0, 0)
      .setStrokeStyle(1.5, 0x475569)
      .setInteractive({ useHandCursor: true });

    const closeText = this.scene.add.text(screenWidth / 2, closeBtnY + closeBtnH / 2, 'CLOSE', {
      fontSize: '12px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5, 0.5);

    closeBtn.on('pointerdown', () => this.hide());
    backdrop.on('pointerdown', () => this.hide());

    this.container.add([backdrop, modalBg, titleText, this.goldText, closeBtn, closeText]);
  }

  private createUpgradeRow(upgradeKey: keyof TownUpgrades, label: string, y: number): Phaser.GameObjects.Text {
    const cost = TownManagerUseCase.UPGRADE_COSTS[upgradeKey];

    // Left: Label and Current Stats
    const statsText = this.scene.add.text(180, y, `${label}\n(Current: 0)`, {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#cbd5e1'
    }).setOrigin(0, 0.5);

    // Right: Buy Button
    const btnW = 80;
    const btnH = 24;
    const btnX = 460 - btnW;
    const btnY = y - btnH / 2;

    const btn = this.scene.add.rectangle(btnX, btnY, btnW, btnH, 0x1e3a8a)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x38bdf8)
      .setInteractive({ useHandCursor: true });

    const btnText = this.scene.add.text(btnX + btnW / 2, btnY + btnH / 2, `${cost} Gold`, {
      fontSize: '10px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5, 0.5);

    btn.on('pointerdown', () => {
      if (this.townManager.buyUpgrade(upgradeKey)) {
        // Assume WebAudioSynthService playSound will be injected or accessible,
        // for simplicity, just save and refresh.
        TownStorageService.save(this.townManager.getTownData());
        this.refresh();
      } else {
        // Can't afford visual feedback (shake/red flash)
        this.scene.tweens.add({
          targets: btnText,
          x: btnText.x + 5,
          yoyo: true,
          duration: 50,
          repeat: 3
        });
      }
    });

    btn.on('pointerover', () => btn.setFillStyle(0x2563eb));
    btn.on('pointerout', () => btn.setFillStyle(0x1e3a8a));

    this.container.add([statsText, btn, btnText]);
    return statsText;
  }

  public show(): void {
    this.refresh();
    this.container.setVisible(true);
  }

  public hide(): void {
    this.container.setVisible(false);
  }

  public isVisible(): boolean {
    return this.container.visible;
  }

  private refresh(): void {
    const data = this.townManager.getTownData();
    this.goldText.setText(`💰 Gold: ${data.gold}`);

    this.hpStatsText.setText(`❤️ +10 Max HP\n(Current: +${data.upgrades.maxHp})`);
    this.bellyStatsText.setText(`🍖 +20 Max Belly\n(Current: +${data.upgrades.maxBelly})`);
    this.atkStatsText.setText(`⚔️ +1 ATK\n(Current: +${data.upgrades.attack})`);
  }
}
