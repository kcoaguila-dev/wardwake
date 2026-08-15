import * as Phaser from 'phaser';

export class ActionMenuPresenter {
  private container: Phaser.GameObjects.Container;
  private bg: Phaser.GameObjects.Rectangle;
  private attackBtn: Phaser.GameObjects.Rectangle;
  private attackText: Phaser.GameObjects.Text;
  private skillBtn: Phaser.GameObjects.Rectangle;
  private skillText: Phaser.GameObjects.Text;
  private itemBtn: Phaser.GameObjects.Rectangle;
  private itemText: Phaser.GameObjects.Text;
  private waitBtn: Phaser.GameObjects.Rectangle;
  private waitText: Phaser.GameObjects.Text;
  private cancelBtn: Phaser.GameObjects.Rectangle;
  private cancelText: Phaser.GameObjects.Text;

  private skillSubmenuBg!: Phaser.GameObjects.Rectangle;
  private skillSubmenuContainer!: Phaser.GameObjects.Container;

  public onAttack?: () => void;
  public onSkill?: (skillId: string) => void;
  public onItem?: () => void;
  public onWait?: () => void;
  public onCancel?: () => void;

  private canAttack: boolean = false;

  constructor(private scene: Phaser.Scene) {
    this.container = this.scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(200);
    this.container.setVisible(false);

    const width = 120;
    const height = 170; // Increased height for SKILL button
    this.bg = this.scene.add.rectangle(0, 0, width, height, 0x111622, 0.96)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x4466aa)
      .setInteractive(); // Shield against clicking world underneath

    this.container.add(this.bg);

    const btnWidth = 100;
    const btnHeight = 26;
    const startX = 10;

    // Skill Submenu Setup
    this.skillSubmenuContainer = this.scene.add.container(125, 0);
    this.skillSubmenuContainer.setDepth(201);
    this.skillSubmenuContainer.setVisible(false);

    this.skillSubmenuBg = this.scene.add.rectangle(0, 0, 150, 100, 0x111622, 0.96)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x9333ea) // Purple hue for skills
      .setInteractive();
    this.skillSubmenuContainer.add(this.skillSubmenuBg);

    this.container.add(this.skillSubmenuContainer);

    // 1. ATTACK Button (y = 10)
    const attackY = 10;
    this.attackBtn = this.scene.add.rectangle(startX, attackY, btnWidth, btnHeight, 0x2a3b5c)
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true });

    this.attackText = this.scene.add.text(startX + 10, attackY + 5, '⚔️ ATTACK', {
      fontSize: '13px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setInteractive({ useHandCursor: true });

    const handleAttack = () => {
      if (this.canAttack && this.onAttack) this.onAttack();
    };
    this.attackBtn.on('pointerdown', handleAttack);
    this.attackText.on('pointerdown', handleAttack);
    this.attackBtn.on('pointerover', () => { if (this.canAttack) this.attackBtn.setFillStyle(0x3f5b8a); });
    this.attackBtn.on('pointerout', () => { if (this.canAttack) this.attackBtn.setFillStyle(0x2a3b5c); });

    // 2. SKILL Button (y = 42)
    const skillY = 42;
    this.skillBtn = this.scene.add.rectangle(startX, skillY, btnWidth, btnHeight, 0x2a3b5c)
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true });

    this.skillText = this.scene.add.text(startX + 10, skillY + 5, '✨ SKILL', {
      fontSize: '13px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setInteractive({ useHandCursor: true });

    const handleSkill = () => {
      this.skillSubmenuContainer.setVisible(!this.skillSubmenuContainer.visible);
    };
    this.skillBtn.on('pointerdown', handleSkill);
    this.skillText.on('pointerdown', handleSkill);
    this.skillBtn.on('pointerover', () => this.skillBtn.setFillStyle(0x4c2b6b));
    this.skillBtn.on('pointerout', () => this.skillBtn.setFillStyle(0x2a3b5c));

    // 3. ITEM Button (y = 74)
    const itemY = 74;
    this.itemBtn = this.scene.add.rectangle(startX, itemY, btnWidth, btnHeight, 0x2a3b5c)
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true });

    this.itemText = this.scene.add.text(startX + 10, itemY + 5, '🎒 ITEM', {
      fontSize: '13px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setInteractive({ useHandCursor: true });

    const handleItem = () => {
      if (this.onItem) this.onItem();
    };
    this.itemBtn.on('pointerdown', handleItem);
    this.itemText.on('pointerdown', handleItem);
    this.itemBtn.on('pointerover', () => this.itemBtn.setFillStyle(0x3f5b8a));
    this.itemBtn.on('pointerout', () => this.itemBtn.setFillStyle(0x2a3b5c));

    // 4. WAIT Button (y = 106)
    const waitY = 106;
    this.waitBtn = this.scene.add.rectangle(startX, waitY, btnWidth, btnHeight, 0x2a3b5c)
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true });

    this.waitText = this.scene.add.text(startX + 10, waitY + 5, '⏳ WAIT', {
      fontSize: '13px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setInteractive({ useHandCursor: true });

    const handleWait = () => {
      if (this.onWait) this.onWait();
    };
    this.waitBtn.on('pointerdown', handleWait);
    this.waitText.on('pointerdown', handleWait);
    this.waitBtn.on('pointerover', () => this.waitBtn.setFillStyle(0x3f5b8a));
    this.waitBtn.on('pointerout', () => this.waitBtn.setFillStyle(0x2a3b5c));

    // 5. CANCEL Button (y = 138)
    const cancelY = 138;
    this.cancelBtn = this.scene.add.rectangle(startX, cancelY, btnWidth, btnHeight, 0x3d1c24)
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true });

    this.cancelText = this.scene.add.text(startX + 10, cancelY + 5, '❌ CANCEL', {
      fontSize: '13px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#f87171'
    }).setInteractive({ useHandCursor: true });

    const handleCancel = () => {
      if (this.onCancel) this.onCancel();
    };
    this.cancelBtn.on('pointerdown', handleCancel);
    this.cancelText.on('pointerdown', handleCancel);
    this.cancelBtn.on('pointerover', () => this.cancelBtn.setFillStyle(0x5c222c));
    this.cancelBtn.on('pointerout', () => this.cancelBtn.setFillStyle(0x3d1c24));

    this.container.add([
      this.attackBtn, this.attackText,
      this.skillBtn, this.skillText,
      this.itemBtn, this.itemText,
      this.waitBtn, this.waitText,
      this.cancelBtn, this.cancelText
    ]);
  }

  private dynamicSkillItems: (Phaser.GameObjects.Rectangle | Phaser.GameObjects.Text)[] = [];

  public updateSkills(unitSkills: { id: string, name: string, cost: number }[], currentSp: number): void {
    // Clear old skill buttons safely without destroying background container or bg
    this.dynamicSkillItems.forEach(item => item.destroy());
    this.dynamicSkillItems = [];

    if (unitSkills.length === 0) {
      this.skillBtn.setFillStyle(0x1a2436);
      this.skillText.setColor('#556677');
      this.skillSubmenuBg.height = 36;
      const noSkillText = this.scene.add.text(10, 10, 'No Skills', {
        fontSize: '11px',
        fontFamily: 'monospace',
        color: '#556677'
      });
      this.dynamicSkillItems.push(noSkillText);
      this.skillSubmenuContainer.add(noSkillText);
      return;
    }

    this.skillBtn.setFillStyle(0x2a3b5c);
    this.skillText.setColor('#ffffff');

    let currentY = 10;
    this.skillSubmenuBg.height = unitSkills.length * 32 + 20;

    for (const skill of unitSkills) {
      const canAfford = currentSp >= skill.cost;

      const btn = this.scene.add.rectangle(10, currentY, 130, 26, canAfford ? 0x2a3b5c : 0x1a2436)
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: canAfford });

      const text = this.scene.add.text(20, currentY + 6, `${skill.name} (${skill.cost}SP)`, {
        fontSize: '11px',
        fontFamily: 'monospace',
        fontStyle: 'bold',
        color: canAfford ? '#ffffff' : '#556677'
      }).setInteractive({ useHandCursor: canAfford });

      const handleSelect = () => {
        if (canAfford && this.onSkill) {
          this.skillSubmenuContainer.setVisible(false);
          this.onSkill(skill.id);
        }
      };

      btn.on('pointerdown', handleSelect);
      text.on('pointerdown', handleSelect);
      if (canAfford) {
        btn.on('pointerover', () => btn.setFillStyle(0x4c2b6b));
        btn.on('pointerout', () => btn.setFillStyle(0x2a3b5c));
      }

      this.dynamicSkillItems.push(btn, text);
      this.skillSubmenuContainer.add([btn, text]);
      currentY += 32;
    }
  }

  public show(worldX: number, worldY: number, canAttack: boolean): void {
    this.skillSubmenuContainer.setVisible(false);
    this.canAttack = canAttack;
    if (this.canAttack) {
      this.attackBtn.setFillStyle(0x2a3b5c);
      this.attackText.setColor('#ffffff');
    } else {
      this.attackBtn.setFillStyle(0x1a2436);
      this.attackText.setColor('#556677');
    }

    // Convert world coordinates to camera viewport screen coordinates
    const camera = this.scene.cameras.main;
    const screenX = worldX - camera.scrollX;
    const screenY = worldY - camera.scrollY;

    let finalX = screenX + 16;
    let finalY = screenY - 20;

    // Keep menu inside screen viewport boundaries (avoiding top HUD and bottom Party HUD)
    if (finalX + 130 > 630) finalX = screenX - 130;
    if (finalY + 175 > 315) finalY = 315 - 175;
    if (finalX < 10) finalX = 10;
    if (finalY < 45) finalY = 45;

    this.container.setPosition(finalX, finalY);
    this.container.setVisible(true);
  }

  public hide(): void {
    this.container.setVisible(false);
  }

  public destroy(): void {
    this.container.destroy();
  }
}
