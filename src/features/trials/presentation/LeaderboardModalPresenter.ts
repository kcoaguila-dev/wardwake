import * as Phaser from 'phaser';
import { TrialRecord } from '../domain/TrialRecord';
import { TrialRecordRepository } from '../infrastructure/TrialRecordRepository';

export class LeaderboardModalPresenter {
  private container: Phaser.GameObjects.Container;
  private isVisible: boolean = false;

  constructor(private scene: Phaser.Scene) {
    this.container = this.scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(100);
    this.container.setVisible(false);

    this.createUI();
  }

  private createUI(): void {
    const screenWidth = this.scene.cameras.main.width;
    const screenHeight = this.scene.cameras.main.height;

    // Dim Background
    const bgOverlay = this.scene.add.rectangle(0, 0, screenWidth, screenHeight, 0x000000, 0.7).setOrigin(0, 0);
    bgOverlay.setInteractive(); // Block clicks

    // Modal Background
    const modalW = 400;
    const modalH = 260;
    const modalX = (screenWidth - modalW) / 2;
    const modalY = (screenHeight - modalH) / 2;

    const modalBg = this.scene.add.rectangle(modalX, modalY, modalW, modalH, 0x1e293b).setOrigin(0, 0);
    modalBg.setStrokeStyle(2, 0xd4af37);

    // Title
    const titleText = this.scene.add.text(screenWidth / 2, modalY + 20, '🏆 HALL OF FAME 🏆', {
      fontSize: '16px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#fbbf24'
    }).setOrigin(0.5, 0.5);

    // List Container
    this.container.add([bgOverlay, modalBg, titleText]);

    // Close Button
    const closeBtnW = 100;
    const closeBtnH = 30;
    const closeBtnX = (screenWidth - closeBtnW) / 2;
    const closeBtnY = modalY + modalH - 40;

    const closeBtnBg = this.scene.add.rectangle(closeBtnX, closeBtnY, closeBtnW, closeBtnH, 0xef4444).setOrigin(0, 0);
    closeBtnBg.setInteractive({ useHandCursor: true });
    closeBtnBg.on('pointerdown', () => this.hide());

    const closeBtnText = this.scene.add.text(closeBtnX + closeBtnW / 2, closeBtnY + closeBtnH / 2, 'CLOSE', {
      fontSize: '12px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5, 0.5);

    this.container.add([closeBtnBg, closeBtnText]);
  }

  public show(): void {
    if (this.isVisible) return;
    this.isVisible = true;

    // Refresh data
    this.refreshList();

    this.container.setVisible(true);
    this.container.setAlpha(0);
    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      duration: 200
    });
  }

  public hide(): void {
    if (!this.isVisible) return;
    this.isVisible = false;
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        this.container.setVisible(false);
      }
    });
  }

  private recordTexts: Phaser.GameObjects.Text[] = [];

  private refreshList(): void {
    // Clear old list
    for (const txt of this.recordTexts) {
      txt.destroy();
    }
    this.recordTexts = [];

    const records = TrialRecordRepository.getTopRecords(5);

    const screenWidth = this.scene.cameras.main.width;
    const screenHeight = this.scene.cameras.main.height;
    const modalH = 260;
    const modalY = (screenHeight - modalH) / 2;

    let startY = modalY + 50;

    if (records.length === 0) {
      const emptyText = this.scene.add.text(screenWidth / 2, modalY + modalH / 2 - 20, 'No records found.', {
        fontSize: '12px',
        fontFamily: 'monospace',
        color: '#94a3b8'
      }).setOrigin(0.5, 0.5);
      this.recordTexts.push(emptyText);
      this.container.add(emptyText);
      return;
    }

    // Header
    const headerStr = `Seed     | Score  | Flr | Clear Time`;
    const headerText = this.scene.add.text(screenWidth / 2, startY, headerStr, {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#cbd5e1'
    }).setOrigin(0.5, 0.5);
    this.recordTexts.push(headerText);
    this.container.add(headerText);
    startY += 20;

    for (let i = 0; i < records.length; i++) {
      const r = records[i]!;
      const timeSecs = Math.floor(r.clearTimeMs / 1000);
      const mins = Math.floor(timeSecs / 60).toString().padStart(2, '0');
      const secs = (timeSecs % 60).toString().padStart(2, '0');
      const timeStr = `${mins}:${secs}`;
      const seedStr = r.seed.substring(0, 8).padEnd(8, ' ');
      const scoreStr = r.score.toString().padStart(6, ' ');
      const floorStr = r.floor.toString().padStart(3, ' ');

      const rowStr = `${seedStr} | ${scoreStr} | ${floorStr} | ${timeStr}`;

      const color = i === 0 ? '#fbbf24' : i === 1 ? '#e2e8f0' : i === 2 ? '#b45309' : '#94a3b8';

      const rowText = this.scene.add.text(screenWidth / 2, startY, rowStr, {
        fontSize: '12px',
        fontFamily: 'monospace',
        color: color
      }).setOrigin(0.5, 0.5);

      this.recordTexts.push(rowText);
      this.container.add(rowText);

      startY += 25;
    }
  }

  public isShowing(): boolean {
    return this.isVisible;
  }
}
