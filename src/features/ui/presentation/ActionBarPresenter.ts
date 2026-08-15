import * as Phaser from 'phaser';

export class ActionBarPresenter {
  private container: Phaser.GameObjects.Container;
  private attackBtn: Phaser.GameObjects.Rectangle;
  private attackText: Phaser.GameObjects.Text;
  private skillBtn: Phaser.GameObjects.Rectangle;
  private skillText: Phaser.GameObjects.Text;
  private itemBtn: Phaser.GameObjects.Rectangle;
  private itemText: Phaser.GameObjects.Text;
  private waitBtn: Phaser.GameObjects.Rectangle;
  private waitText: Phaser.GameObjects.Text;

  public onAttack?: () => void;
  public onSkill?: () => void;
  public onItem?: () => void;
  public onWait?: () => void;

  private canAttack: boolean = false;

  constructor(private scene: Phaser.Scene) {
    const screenWidth = this.scene.scale.width || 640;
    const barWidth = 360;
    const barHeight = 30;
    const startX = (screenWidth - barWidth) / 2;
    const startY = 284; // Docked comfortably right above Party HUD (318)

    this.container = this.scene.add.container(startX, startY);
    this.container.setScrollFactor(0);
    this.container.setDepth(85);

    // Subtle dark dock background
    const bg = this.scene.add.rectangle(barWidth / 2, barHeight / 2, barWidth, barHeight, 0x0a0e17, 0.94)
      .setStrokeStyle(1.5, 0x1e293b);
    this.container.add(bg);

    const btnW = 82;
    const btnH = 22;
    const btnCenterY = barHeight / 2;
    const spacing = 88;
    const firstBtnCenterX = 6 + btnW / 2;

    // Helper to create reliable interactive button
    const createDockButton = (centerX: number, label: string, onClick: () => void) => {
      const rect = this.scene.add.rectangle(centerX, btnCenterY, btnW, btnH, 0x1e293b)
        .setStrokeStyle(1.5, 0x475569)
        .setInteractive({ useHandCursor: true });

      const text = this.scene.add.text(centerX, btnCenterY, label, {
        fontSize: '10px',
        fontFamily: 'monospace',
        fontStyle: 'bold',
        color: '#cbd5e1'
      }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });

      const clickHandler = (pointer?: Phaser.Input.Pointer, _lx?: number, _ly?: number, event?: any) => {
        if (event && event.stopPropagation) event.stopPropagation();
        onClick();
      };

      rect.on('pointerdown', clickHandler);
      text.on('pointerdown', clickHandler);

      rect.on('pointerover', () => rect.setFillStyle(0x334155));
      rect.on('pointerout', () => this.refreshStyles());

      this.container.add([rect, text]);
      return { rect, text };
    };

    // 1. ATTACK Button
    const attack = createDockButton(firstBtnCenterX, '⚔️ ATTACK', () => {
      if (this.onAttack) this.onAttack();
    });
    this.attackBtn = attack.rect;
    this.attackText = attack.text;

    // 2. SKILL Button
    const skill = createDockButton(firstBtnCenterX + spacing, '✨ SKILL', () => {
      if (this.onSkill) this.onSkill();
    });
    this.skillBtn = skill.rect;
    this.skillText = skill.text;

    // 3. ITEM Button
    const item = createDockButton(firstBtnCenterX + spacing * 2, '🎒 ITEM', () => {
      if (this.onItem) this.onItem();
    });
    this.itemBtn = item.rect;
    this.itemText = item.text;

    // 4. WAIT Button
    const wait = createDockButton(firstBtnCenterX + spacing * 3, '⏳ WAIT', () => {
      if (this.onWait) this.onWait();
    });
    this.waitBtn = wait.rect;
    this.waitText = wait.text;
  }

  public updateState(canAttack: boolean, isCombat: boolean): void {
    this.canAttack = canAttack;
    this.refreshStyles(isCombat);
  }

  private refreshStyles(isCombat: boolean = false): void {
    if (this.canAttack) {
      this.attackBtn.setFillStyle(0x065f46); // Emerald highlight when attack available
      this.attackBtn.setStrokeStyle(1.5, 0x34d399);
      this.attackText.setColor('#34d399');
    } else {
      this.attackBtn.setFillStyle(0x1e293b);
      this.attackBtn.setStrokeStyle(1.5, 0x475569);
      this.attackText.setColor(isCombat ? '#64748b' : '#94a3b8');
    }

    this.skillBtn.setFillStyle(0x1e293b);
    this.skillBtn.setStrokeStyle(1.5, 0x475569);

    this.itemBtn.setFillStyle(0x1e293b);
    this.itemBtn.setStrokeStyle(1.5, 0x475569);

    this.waitBtn.setFillStyle(0x1e293b);
    this.waitBtn.setStrokeStyle(1.5, 0x475569);
  }

  public setVisible(visible: boolean): void {
    this.container.setVisible(visible);
  }

  public destroy(): void {
    this.container.destroy();
  }
}
