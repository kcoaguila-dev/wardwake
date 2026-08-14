import * as Phaser from 'phaser';

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
}

export class BestiaryModalPresenter {
  private container: Phaser.GameObjects.Container;
  private backdrop: Phaser.GameObjects.Rectangle;
  private modalBg: Phaser.GameObjects.Rectangle;
  private titleText: Phaser.GameObjects.Text;

  private monstersData: MonsterData[] = [];
  private gridContainer: Phaser.GameObjects.Container;
  private detailContainer: Phaser.GameObjects.Container;

  private activeMonsterSprite?: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image;
  private closeBtn!: Phaser.GameObjects.Rectangle;

  public onClose?: () => void;

  constructor(private scene: Phaser.Scene) {
    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(400); // Above Settings modal
    this.container.setScrollFactor(0);
    this.container.setVisible(false);

    const screenWidth = 640;
    const screenHeight = 360;

    // Dark backdrop shield
    this.backdrop = this.scene.add.rectangle(0, 0, screenWidth, screenHeight, 0x000000, 0.9)
      .setOrigin(0, 0)
      .setInteractive();

    const modalWidth = 560;
    const modalHeight = 320;
    const modalX = (screenWidth - modalWidth) / 2;
    const modalY = (screenHeight - modalHeight) / 2;

    this.modalBg = this.scene.add.rectangle(modalX, modalY, modalWidth, modalHeight, 0x0f172a, 1)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x8b5cf6)
      .setInteractive();

    this.titleText = this.scene.add.text(screenWidth / 2, modalY + 20, '📖 BESTIARY COMPENDIUM', {
      fontSize: '16px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#c4b5fd'
    }).setOrigin(0.5, 0.5);

    this.gridContainer = this.scene.add.container(modalX + 20, modalY + 50);
    this.detailContainer = this.scene.add.container(modalX + 280, modalY + 50);

    // Initial detail instructions
    const detailBg = this.scene.add.rectangle(0, 0, 260, 210, 0x1e293b, 0.8)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x475569);
    this.detailContainer.add(detailBg);

    const placeholderText = this.scene.add.text(130, 105, 'Select a monster to view details', {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#94a3b8',
      align: 'center',
      wordWrap: { width: 200 }
    }).setOrigin(0.5, 0.5);
    this.detailContainer.add(placeholderText);

    // Close Button
    const closeBtnW = 120;
    const closeBtnH = 26;
    const closeBtnX = (screenWidth - closeBtnW) / 2;
    const closeBtnY = modalY + modalHeight - 34;

    this.closeBtn = this.scene.add.rectangle(closeBtnX, closeBtnY, closeBtnW, closeBtnH, 0x334155)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x64748b);

    const closeBtnText = this.scene.add.text(screenWidth / 2, closeBtnY + 13, '❌ CLOSE (Esc)', {
      fontSize: '11px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5, 0.5);

    // Keyboard support
    this.scene.input.keyboard?.on('keydown-ESC', () => {
      if (this.isVisible()) {
        this.hide();
        if (this.onClose) this.onClose();
      }
    });

    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.isVisible()) return;

      const px = pointer.x;
      const py = pointer.y;

      if (px >= closeBtnX && px <= closeBtnX + closeBtnW && py >= closeBtnY && py <= closeBtnY + closeBtnH) {
        this.hide();
        if (this.onClose) this.onClose();
      }
    });

    this.container.add([
      this.backdrop,
      this.modalBg,
      this.titleText,
      this.gridContainer,
      this.detailContainer,
      this.closeBtn,
      closeBtnText
    ]);

    this.loadMonsters();
  }

  private loadMonsters(): void {
    // We load from monsters.json directly (assume loaded in cache, or just use hardcoded require if possible. Since it's vite, we can import it)
    // To keep it simple and clean architecturally, we will load it via fetch or import.
    // In this codebase, src/data/monsters.json exists.
    import('../../../data/monsters.json').then((data) => {
      this.monstersData = data.default as MonsterData[];
      this.buildGrid();
    }).catch(err => console.error('Failed to load monsters.json', err));
  }

  private getUnlockedMonsterIds(): string[] {
    const data = localStorage.getItem('wardwake_bestiary');
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        return [];
      }
    }
    return [];
  }

  private buildGrid(): void {
    this.gridContainer.removeAll(true);

    const unlockedIds = this.getUnlockedMonsterIds();
    const columns = 4;
    const padding = 10;
    const slotW = 50;
    const slotH = 50;

    this.monstersData.forEach((monster, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);

      const x = col * (slotW + padding);
      const y = row * (slotH + padding);

      const isUnlocked = unlockedIds.includes(monster.id);

      const slotBg = this.scene.add.rectangle(x, y, slotW, slotH, 0x1e293b, 1)
        .setOrigin(0, 0)
        .setStrokeStyle(1, isUnlocked ? 0x8b5cf6 : 0x334155)
        .setInteractive();

      this.gridContainer.add(slotBg);

      if (isUnlocked) {
        // Show actual sprite, scaled to fit
        const sprite = this.scene.add.image(x + slotW / 2, y + slotH / 2, monster.id);
        if (sprite.width > 0) {
            const scale = Math.min(40 / sprite.width, 40 / sprite.height);
            sprite.setScale(scale);
        }
        this.gridContainer.add(sprite);

        slotBg.on('pointerdown', () => {
          this.showMonsterDetails(monster);
        });

        // Hover effect
        slotBg.on('pointerover', () => slotBg.setStrokeStyle(2, 0xc4b5fd));
        slotBg.on('pointerout', () => slotBg.setStrokeStyle(1, 0x8b5cf6));

      } else {
        // Show silhouette / ???
        const text = this.scene.add.text(x + slotW / 2, y + slotH / 2, '???', {
          fontSize: '14px',
          fontFamily: 'monospace',
          fontStyle: 'bold',
          color: '#475569'
        }).setOrigin(0.5, 0.5);
        this.gridContainer.add(text);
      }
    });
  }

  private showMonsterDetails(monster: MonsterData): void {
    this.detailContainer.removeAll(true);

    const detailBg = this.scene.add.rectangle(0, 0, 260, 210, 0x1e293b, 0.8)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x8b5cf6);
    this.detailContainer.add(detailBg);

    // Name
    const nameText = this.scene.add.text(130, 15, monster.name, {
      fontSize: '14px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: monster.isBoss ? '#f87171' : (monster.isElite ? '#fbbf24' : '#e2e8f0')
    }).setOrigin(0.5, 0);
    this.detailContainer.add(nameText);

    // Sprite (Animated if it's a spritesheet, but here it's likely an image. Let's just add it with a gentle bobbing tween)
    this.activeMonsterSprite = this.scene.add.image(130, 60, monster.id);
    this.activeMonsterSprite.setScale(2.5);
    this.detailContainer.add(this.activeMonsterSprite);

    this.scene.tweens.add({
      targets: this.activeMonsterSprite,
      y: 55,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Stats
    const statsY = 95;
    const statsText = `HP: ${monster.baseHp} | ATK: ${monster.baseAttack} | DEF: ${monster.baseDefense}\nEXP: ${monster.expYield} | TIER: ${monster.floorTier}`;
    const statsLabel = this.scene.add.text(130, statsY, statsText, {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#cbd5e1',
      align: 'center'
    }).setOrigin(0.5, 0);
    this.detailContainer.add(statsLabel);

    // Weapon & Weakness
    const weaponY = statsY + 30;
    let weakness = '';
    let weaknessColor = '';
    if (monster.weaponType === 'SWORD') { weakness = 'LANCE'; weaknessColor = '#60a5fa'; } // Blue
    else if (monster.weaponType === 'LANCE') { weakness = 'AXE'; weaknessColor = '#4ade80'; } // Green
    else if (monster.weaponType === 'AXE') { weakness = 'SWORD'; weaknessColor = '#f87171'; } // Red

    const wepText = this.scene.add.text(130, weaponY, `Weapon: ${monster.weaponType}`, {
      fontSize: '11px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#e2e8f0'
    }).setOrigin(0.5, 0);

    const weakText = this.scene.add.text(130, weaponY + 15, `Weakness: ${weakness}`, {
      fontSize: '11px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: weaknessColor
    }).setOrigin(0.5, 0);
    this.detailContainer.add(wepText);
    this.detailContainer.add(weakText);

    // Lore
    const loreY = weaponY + 35;
    const lore = monster.lore || "A terrifying creature of the dungeon.";
    const loreLabel = this.scene.add.text(130, loreY, lore, {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#94a3b8',
      align: 'center',
      wordWrap: { width: 240, useAdvancedWrap: true }
    }).setOrigin(0.5, 0);
    this.detailContainer.add(loreLabel);
  }

  public show(): void {
    this.buildGrid();
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
