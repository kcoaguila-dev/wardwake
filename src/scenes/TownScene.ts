import * as Phaser from 'phaser';
import { WebAudioSynthService } from '../features/combat/infrastructure/WebAudioSynthService';
import { TownStorageService } from '../features/progression/infrastructure/TownStorageService';
import { TownManagerUseCase } from '../features/progression/application/TownManagerUseCase';
import { LocalStorageProfileRepository } from '../features/save/infrastructure/LocalStorageProfileRepository';
import { SaveProfileUseCase } from '../features/save/application/SaveProfileUseCase';
import { TownData, INITIAL_TOWN_DATA } from '../features/progression/domain/TownData';
import { TownStorageModalPresenter } from '../features/progression/presentation/TownStorageModalPresenter';
import { GuildMasterModalPresenter } from '../features/progression/presentation/GuildMasterModalPresenter';

export class TownScene extends Phaser.Scene {
  private audioService!: WebAudioSynthService;
  private embers: Phaser.GameObjects.Arc[] = [];

  private townManager!: TownManagerUseCase;
  private storageModal!: TownStorageModalPresenter;
  private guildMasterModal!: GuildMasterModalPresenter;

  constructor() {
    super({ key: 'TownScene' });
  }

  create(): void {
    const screenWidth = 640;
    const screenHeight = 360;

    this.audioService = new WebAudioSynthService();

    // Load Meta-Progression
    const townData = TownStorageService.load();
    this.townManager = new TownManagerUseCase(townData);

    this.storageModal = new TownStorageModalPresenter(this, this.townManager);
    this.guildMasterModal = new GuildMasterModalPresenter(this, this.townManager);

    // Start Retro Tavern BGM
    this.audioService.startBgm('town');

    // Initialize or load profile
    const activeSlot = LocalStorageProfileRepository.getActiveSlotId();
    let profile = LocalStorageProfileRepository.loadProfile(activeSlot);

    if (!profile) {
      profile = {
        schemaVersion: 1,
        profileId: activeSlot,
        lastPlayedAt: Date.now(),
        townData: { ...INITIAL_TOWN_DATA },
        activeRun: null,
        compendium: { unlockedMonsterIds: [] },
        statistics: { totalRuns: 0, totalClears: 0, totalDeaths: 0, totalGoldEarned: 0, monstersSlain: 0, floorsCleared: 0 }
      };
      SaveProfileUseCase.execute(profile);
    }


    // 1. Background gradient (Cozy night feel)
    this.add.rectangle(0, 0, screenWidth, screenHeight, 0x0f172a).setOrigin(0, 0);

    // Subtle grid overlay for tactical feel
    const gridGraphics = this.add.graphics();
    gridGraphics.lineStyle(1, 0x1e293b, 0.5);
    for (let x = 0; x <= screenWidth; x += 32) {
      gridGraphics.lineBetween(x, 0, x, screenHeight);
    }
    for (let y = 0; y <= screenHeight; y += 32) {
      gridGraphics.lineBetween(0, y, screenWidth, y);
    }

    // 2. Atmospheric Campfire Particles
    const campfireX = screenWidth / 2;
    const campfireY = screenHeight / 2 + 50;

    // Campfire Base
    this.add.circle(campfireX, campfireY, 15, 0x451a03).setOrigin(0.5, 0.5);
    this.add.circle(campfireX, campfireY, 10, 0x78350f).setOrigin(0.5, 0.5);

    for (let i = 0; i < 15; i++) {
      const ember = this.add.circle(
        campfireX + Phaser.Math.Between(-10, 10),
        campfireY + Phaser.Math.Between(-5, 5),
        Phaser.Math.Between(1, 3),
        0xf59e0b,
        Phaser.Math.FloatBetween(0.5, 1)
      );
      this.embers.push(ember);

      this.tweens.add({
        targets: ember,
        y: ember.y - Phaser.Math.Between(20, 60),
        x: ember.x + Phaser.Math.Between(-15, 15),
        alpha: { from: ember.alpha, to: 0 },
        duration: Phaser.Math.Between(1500, 3000),
        repeat: -1,
        yoyo: false,
        onRepeat: () => {
          ember.setPosition(
            campfireX + Phaser.Math.Between(-10, 10),
            campfireY + Phaser.Math.Between(-5, 5)
          );
          ember.setAlpha(Phaser.Math.FloatBetween(0.5, 1));
        }
      });
    }

    // 3. Town Header
    this.add.text(screenWidth / 2, 30, 'BASE CAMP', {
      fontSize: '24px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#fcd34d',
      stroke: '#78350f',
      strokeThickness: 4
    }).setOrigin(0.5, 0.5);

    this.add.text(screenWidth / 2, 55, 'Rest and prepare for the next expedition.', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#94a3b8'
    }).setOrigin(0.5, 0.5);

    // 4. Dungeon Gate
    const gateBtnW = 160;
    const gateBtnH = 34;
    const gateBtnX = (screenWidth - gateBtnW) / 2;
    const gateBtnY = 120;

    const gateBtn = this.add.rectangle(gateBtnX, gateBtnY, gateBtnW, gateBtnH, 0x1e3a8a)
      .setOrigin(0, 0)
      .setStrokeStyle(1.5, 0x38bdf8)
      .setInteractive({ useHandCursor: true });

    const gateText = this.add.text(screenWidth / 2, gateBtnY + gateBtnH / 2, '🚪 DUNGEON GATE', {
      fontSize: '12px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5, 0.5);

    gateBtn.on('pointerover', () => gateBtn.setFillStyle(0x2563eb));
    gateBtn.on('pointerout', () => gateBtn.setFillStyle(0x1e3a8a));
    gateBtn.on('pointerdown', () => {
      if (this.storageModal.isVisible() || this.guildMasterModal.isVisible()) return;
      this.audioService.playSound('sword_slash');
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MainGameScene');
      });
    });

    // 5. Storage Chest Button
    const chestBtnW = 160;
    const chestBtnH = 34;
    const chestBtnX = (screenWidth - chestBtnW) / 2;
    const chestBtnY = 165;

    const chestBtn = this.add.rectangle(chestBtnX, chestBtnY, chestBtnW, chestBtnH, 0x1e293b)
      .setOrigin(0, 0)
      .setStrokeStyle(1.5, 0x475569)
      .setInteractive({ useHandCursor: true });

    const chestText = this.add.text(screenWidth / 2, chestBtnY + chestBtnH / 2, '📦 STORAGE CHEST', {
      fontSize: '12px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#cbd5e1'
    }).setOrigin(0.5, 0.5);

    chestBtn.on('pointerover', () => chestBtn.setFillStyle(0x334155));
    chestBtn.on('pointerout', () => chestBtn.setFillStyle(0x1e293b));
    chestBtn.on('pointerdown', () => {
      if (this.storageModal.isVisible() || this.guildMasterModal.isVisible()) return;
      this.audioService.playSound('hero_step');
      this.storageModal.show();
    });

    // 6. Guild Master Button
    const guildBtnW = 160;
    const guildBtnH = 34;
    const guildBtnX = (screenWidth - guildBtnW) / 2;
    const guildBtnY = 210;

    const guildBtn = this.add.rectangle(guildBtnX, guildBtnY, guildBtnW, guildBtnH, 0x1e293b)
      .setOrigin(0, 0)
      .setStrokeStyle(1.5, 0x475569)
      .setInteractive({ useHandCursor: true });

    const guildText = this.add.text(screenWidth / 2, guildBtnY + guildBtnH / 2, '🏛️ GUILD MASTER', {
      fontSize: '12px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#cbd5e1'
    }).setOrigin(0.5, 0.5);

    guildBtn.on('pointerover', () => guildBtn.setFillStyle(0x334155));
    guildBtn.on('pointerout', () => guildBtn.setFillStyle(0x1e293b));
    guildBtn.on('pointerdown', () => {
      if (this.storageModal.isVisible() || this.guildMasterModal.isVisible()) return;
      this.audioService.playSound('hero_step');
      this.guildMasterModal.show();
    });
  }
}
