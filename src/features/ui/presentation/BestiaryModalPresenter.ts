import * as Phaser from 'phaser';
import rawMonstersData from '../../../data/monsters.json';

export interface MonsterData {
  id: string;
  name: string;
  weaponType: string;
  baseHp: number;
  baseAttack: number;
  baseDefense: number;
  expYield: number;
  floorTier: number;
  isElite?: boolean;
  isBoss?: boolean;
  lore?: string;
  attackRange?: number;
  moveRange?: number;
  isExplosive?: boolean;
}

export class BestiaryModalPresenter {
  private backdrop: Phaser.GameObjects.Rectangle;
  private modalBg: Phaser.GameObjects.Rectangle;
  private titleText: Phaser.GameObjects.Text;
  private closeBtn: Phaser.GameObjects.Rectangle;
  private closeBtnText: Phaser.GameObjects.Text;

  private monstersData: MonsterData[];
  private gridElements: (Phaser.GameObjects.GameObject)[] = [];
  private detailElements: (Phaser.GameObjects.GameObject)[] = [];
  private activeMonsterSprite?: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite;
  private visible: boolean = false;

  private modalX: number;
  private modalY: number;

  public onClose?: () => void;

  constructor(private scene: Phaser.Scene) {
    this.monstersData = (Array.isArray(rawMonstersData)
      ? rawMonstersData
      : (rawMonstersData as any).default || []) as MonsterData[];

    const screenWidth = 640;
    const screenHeight = 360;

    const modalWidth = 560;
    const modalHeight = 320;
    this.modalX = (screenWidth - modalWidth) / 2;
    this.modalY = (screenHeight - modalHeight) / 2;

    // 1. Dark backdrop shield (depth: 350)
    this.backdrop = this.scene.add.rectangle(0, 0, screenWidth, screenHeight, 0x000000, 0.9)
      .setOrigin(0, 0)
      .setDepth(350)
      .setScrollFactor(0)
      .setVisible(false)
      .setInteractive();

    // 2. Modal Frame (depth: 351)
    this.modalBg = this.scene.add.rectangle(this.modalX, this.modalY, modalWidth, modalHeight, 0x0f172a, 0.98)
      .setOrigin(0, 0)
      .setDepth(351)
      .setScrollFactor(0)
      .setStrokeStyle(2, 0x8b5cf6)
      .setVisible(false)
      .setInteractive();

    // 3. Title (depth: 352)
    this.titleText = this.scene.add.text(screenWidth / 2, this.modalY + 20, '📖 BESTIARY COMPENDIUM', {
      fontSize: '16px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#c4b5fd'
    }).setOrigin(0.5, 0.5)
      .setDepth(352)
      .setScrollFactor(0)
      .setVisible(false);

    // 4. Close Button (depth: 352, 353)
    const closeBtnW = 140;
    const closeBtnH = 28;
    const closeBtnX = (screenWidth - closeBtnW) / 2;
    const closeBtnY = this.modalY + modalHeight - 34;

    this.closeBtn = this.scene.add.rectangle(closeBtnX, closeBtnY, closeBtnW, closeBtnH, 0x334155)
      .setOrigin(0, 0)
      .setDepth(352)
      .setScrollFactor(0)
      .setStrokeStyle(1.5, 0x64748b)
      .setVisible(false)
      .setInteractive({ useHandCursor: true });

    this.closeBtnText = this.scene.add.text(screenWidth / 2, closeBtnY + closeBtnH / 2, '❌ CLOSE (Esc)', {
      fontSize: '11px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5, 0.5)
      .setDepth(353)
      .setScrollFactor(0)
      .setVisible(false)
      .setInteractive({ useHandCursor: true });

    const triggerClose = () => {
      if (this.visible) {
        this.hide();
        if (this.onClose) this.onClose();
      }
    };

    this.closeBtn.on('pointerdown', triggerClose);
    this.closeBtnText.on('pointerdown', triggerClose);
    this.closeBtn.on('pointerover', () => this.closeBtn.setFillStyle(0x475569));
    this.closeBtn.on('pointerout', () => this.closeBtn.setFillStyle(0x334155));

    this.scene.input.keyboard?.on('keydown-ESC', triggerClose);

    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.visible) return;
      const px = pointer.x;
      const py = pointer.y;
      if (px >= closeBtnX && px <= closeBtnX + closeBtnW && py >= closeBtnY && py <= closeBtnY + closeBtnH) {
        triggerClose();
      }
    });
  }

  private getUnlockedMonsterIds(): string[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const data = localStorage.getItem('wardwake_bestiary');
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {}
    return [];
  }

  private getTextureForMonster(monster: MonsterData): string {
    if (monster.isBoss) {
      if (this.scene.textures.exists(monster.id)) return monster.id;
      return 'enemy_dread_minotaur';
    }
    if (monster.isElite || monster.name.includes('💀') || monster.name.includes('FOE')) {
      return 'enemy_dread_minotaur';
    }
    if (monster.isExplosive || monster.name.includes('Cinder Imp')) {
      return 'enemy_cinder_imp';
    }
    if (this.scene.textures.exists(monster.id)) {
      return monster.id;
    }
    switch (monster.weaponType.toUpperCase()) {
      case 'SWORD': return 'enemy_goblin_sword';
      case 'AXE': return 'enemy_orc_axe';
      case 'LANCE': return 'enemy_skeleton_lance';
      case 'BOW': return 'enemy_goblin_archer';
      case 'MAGIC': return 'enemy_dark_cultist';
      default: return 'enemy_goblin_sword';
    }
  }

  private buildGrid(): void {
    // Clear old elements
    this.gridElements.forEach(el => el.destroy());
    this.gridElements = [];
    this.detailElements.forEach(el => el.destroy());
    this.detailElements = [];

    const unlockedIds = this.getUnlockedMonsterIds();
    const columns = 4;
    const padding = 10;
    const slotW = 52;
    const slotH = 52;
    const gridStartX = this.modalX + 24;
    const gridStartY = this.modalY + 50;

    // Draw detail panel placeholder (depth: 352)
    const detailBg = this.scene.add.rectangle(this.modalX + 280, this.modalY + 50, 260, 218, 0x1e293b, 0.9)
      .setOrigin(0, 0)
      .setDepth(352)
      .setScrollFactor(0)
      .setStrokeStyle(1.5, 0x475569);
    this.detailElements.push(detailBg);

    const placeholder = this.scene.add.text(this.modalX + 410, this.modalY + 150, 'Select an encountered monster\nto inspect lore & weaknesses.', {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#94a3b8',
      align: 'center'
    }).setOrigin(0.5, 0.5)
      .setDepth(353)
      .setScrollFactor(0);
    this.detailElements.push(placeholder);

    this.monstersData.forEach((monster, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);

      const x = gridStartX + col * (slotW + padding);
      const y = gridStartY + row * (slotH + padding);

      const isUnlocked = unlockedIds.includes(monster.id);
      const textureKey = this.getTextureForMonster(monster);

      const slotBg = this.scene.add.rectangle(x, y, slotW, slotH, isUnlocked ? 0x1e1e38 : 0x181824, 1)
        .setOrigin(0, 0)
        .setDepth(352)
        .setScrollFactor(0)
        .setStrokeStyle(1.5, isUnlocked ? 0x8b5cf6 : 0x334155)
        .setInteractive({ useHandCursor: isUnlocked });
      this.gridElements.push(slotBg);

      if (isUnlocked) {
        const sprite = this.scene.add.sprite(x + slotW / 2, y + slotH / 2, textureKey)
          .setDepth(353)
          .setScrollFactor(0)
          .setScale(2.2);
        this.gridElements.push(sprite);

        slotBg.on('pointerdown', () => this.showMonsterDetails(monster));
        slotBg.on('pointerover', () => slotBg.setStrokeStyle(2.5, 0xc4b5fd));
        slotBg.on('pointerout', () => slotBg.setStrokeStyle(1.5, 0x8b5cf6));
      } else {
        const text = this.scene.add.text(x + slotW / 2, y + slotH / 2, '???', {
          fontSize: '14px',
          fontFamily: 'monospace',
          fontStyle: 'bold',
          color: '#475569'
        }).setOrigin(0.5, 0.5)
          .setDepth(353)
          .setScrollFactor(0);
        this.gridElements.push(text);
      }
    });
  }

  private showMonsterDetails(monster: MonsterData): void {
    this.detailElements.forEach(el => el.destroy());
    this.detailElements = [];

    const detailX = this.modalX + 280;
    const detailY = this.modalY + 50;
    const textureKey = this.getTextureForMonster(monster);

    const detailBg = this.scene.add.rectangle(detailX, detailY, 260, 218, 0x1e293b, 0.95)
      .setOrigin(0, 0)
      .setDepth(352)
      .setScrollFactor(0)
      .setStrokeStyle(2, 0x8b5cf6);
    this.detailElements.push(detailBg);

    // Name
    const nameText = this.scene.add.text(detailX + 130, detailY + 12, monster.name, {
      fontSize: '14px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: monster.isBoss ? '#f87171' : (monster.isElite ? '#fbbf24' : '#c4b5fd')
    }).setOrigin(0.5, 0)
      .setDepth(353)
      .setScrollFactor(0);
    this.detailElements.push(nameText);

    // Sprite
    const sprite = this.scene.add.sprite(detailX + 130, detailY + 52, textureKey)
      .setDepth(353)
      .setScrollFactor(0)
      .setScale(2.8);
    this.detailElements.push(sprite);

    // Stats
    const statsText = `HP: ${monster.baseHp}  ATK: ${monster.baseAttack}  DEF: ${monster.baseDefense}\nMOVE: ${monster.moveRange ?? 2}  RANGE: ${monster.attackRange ?? 1}  EXP: +${monster.expYield}`;
    const statsLabel = this.scene.add.text(detailX + 130, detailY + 84, statsText, {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#e2e8f0',
      align: 'center',
      lineSpacing: 4
    }).setOrigin(0.5, 0)
      .setDepth(353)
      .setScrollFactor(0);
    this.detailElements.push(statsLabel);

    // Weakness & Counter
    let counterInfo = '';
    let counterColor = '#38bdf8';
    if (monster.weaponType === 'SWORD') { counterInfo = '⚔️ SWORD (Weak to LANCE 🔱)'; counterColor = '#60a5fa'; }
    else if (monster.weaponType === 'AXE') { counterInfo = '🪓 AXE (Weak to SWORD ⚔️)'; counterColor = '#f87171'; }
    else if (monster.weaponType === 'LANCE') { counterInfo = '🔱 LANCE (Weak to AXE 🪓)'; counterColor = '#4ade80'; }
    else if (monster.weaponType === 'BOW') { counterInfo = '🏹 BOW (Close gap to melee)'; counterColor = '#fbbf24'; }
    else if (monster.weaponType === 'MAGIC') { counterInfo = '🔮 MAGIC (Burst down quickly)'; counterColor = '#c084fc'; }

    const counterLabel = this.scene.add.text(detailX + 130, detailY + 120, counterInfo, {
      fontSize: '10px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: counterColor
    }).setOrigin(0.5, 0)
      .setDepth(353)
      .setScrollFactor(0);
    this.detailElements.push(counterLabel);

    // Lore
    const lore = monster.lore || "A dangerous denizen of the dungeon depths.";
    const loreLabel = this.scene.add.text(detailX + 130, detailY + 142, lore, {
      fontSize: '9px',
      fontFamily: 'monospace',
      color: '#94a3b8',
      align: 'center',
      wordWrap: { width: 240, useAdvancedWrap: true }
    }).setOrigin(0.5, 0)
      .setDepth(353)
      .setScrollFactor(0);
    this.detailElements.push(loreLabel);
  }

  public show(): void {
    this.visible = true;
    this.buildGrid();
    this.backdrop.setVisible(true);
    this.modalBg.setVisible(true);
    this.titleText.setVisible(true);
    this.closeBtn.setVisible(true);
    this.closeBtnText.setVisible(true);
  }

  public hide(): void {
    this.visible = false;
    this.backdrop.setVisible(false);
    this.modalBg.setVisible(false);
    this.titleText.setVisible(false);
    this.closeBtn.setVisible(false);
    this.closeBtnText.setVisible(false);
    this.gridElements.forEach(el => el.destroy());
    this.gridElements = [];
    this.detailElements.forEach(el => el.destroy());
    this.detailElements = [];
  }

  public isVisible(): boolean {
    return this.visible;
  }

  public destroy(): void {
    this.backdrop.destroy();
    this.modalBg.destroy();
    this.titleText.destroy();
    this.closeBtn.destroy();
    this.closeBtnText.destroy();
    this.gridElements.forEach(el => el.destroy());
    this.detailElements.forEach(el => el.destroy());
  }
}
