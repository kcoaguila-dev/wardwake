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
    const bg = this.scene.add.rectangle(0, 0, barWidth, barHeight, 0x0a0e17, 0.92)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x1e293b);
    this.container.add(bg);

    const btnW = 82;
    const btnH = 22;
    const btnY = 4;
    const spacing = 88;

    // 1. ATTACK Button
    this.attackBtn = this.scene.add.rectangle(6, btnY, btnW, btnH, 0x1e293b)
      .setOrigin(0, 0)
      .setStrokeStyle(1.5, 0x475569)
      .setInteractive({ useHandCursor: true });

    this.attackText = this.scene.add.text(6 + btnW / 2, btnY + btnH / 2, '⚔️ ATTACK', {
      fontSize: '10px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#94a3b8'
    }).setOrigin(0.5, 0.5);

    const triggerAttack = () => {
      if (this.onAttack) this.onAttack();
    };
    this.attackBtn.on('pointerdown', triggerAttack);
    this.attackText.on('pointerdown', triggerAttack);

    // 2. SKILL Button
    this.skillBtn = this.scene.add.rectangle(6 + spacing, btnY, btnW, btnH, 0x1e293b)
      .setOrigin(0, 0)
      .setStrokeStyle(1.5, 0x475569)
      .setInteractive({ useHandCursor: true });

    this.skillText = this.scene.add.text(6 + spacing + btnW / 2, btnY + btnH / 2, '✨ SKILL', {
      fontSize: '10px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#cbd5e1'
    }).setOrigin(0.5, 0.5);

    const triggerSkill = () => {
      if (this.onSkill) this.onSkill();
    };
    this.skillBtn.on('pointerdown', triggerSkill);
    this.skillText.on('pointerdown', triggerSkill);

    // 3. ITEM Button
    this.itemBtn = this.scene.add.rectangle(6 + spacing * 2, btnY, btnW, btnH, 0x1e293b)
      .setOrigin(0, 0)
      .setStrokeStyle(1.5, 0x475569)
      .setInteractive({ useHandCursor: true });

    this.itemText = this.scene.add.text(6 + spacing * 2 + btnW / 2, btnY + btnH / 2, '🎒 ITEM', {
      fontSize: '10px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#cbd5e1'
    }).setOrigin(0.5, 0.5);

    const triggerItem = () => {
      if (this.onItem) this.onItem();
    };
    this.itemBtn.on('pointerdown', triggerItem);
    this.itemText.on('pointerdown', triggerItem);

    // 4. WAIT Button
    this.waitBtn = this.scene.add.rectangle(6 + spacing * 3, btnY, btnW, btnH, 0x1e293b)
      .setOrigin(0, 0)
      .setStrokeStyle(1.5, 0x475569)
      .setInteractive({ useHandCursor: true });

    this.waitText = this.scene.add.text(6 + spacing * 3 + btnW / 2, btnY + btnH / 2, '⏳ WAIT', {
      fontSize: '10px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#cbd5e1'
    }).setOrigin(0.5, 0.5);

    const triggerWait = () => {
      if (this.onWait) this.onWait();
    };
    this.waitBtn.on('pointerdown', triggerWait);
    this.waitText.on('pointerdown', triggerWait);

    this.container.add([
      this.attackBtn, this.attackText,
      this.skillBtn, this.skillText,
      this.itemBtn, this.itemText,
      this.waitBtn, this.waitText
    ]);

    // Hover styling
    const setupHover = (btn: Phaser.GameObjects.Rectangle) => {
      btn.on('pointerover', () => btn.setFillStyle(0x334155));
      btn.on('pointerout', () => this.refreshStyles());
    };
    setupHover(this.attackBtn);
    setupHover(this.skillBtn);
    setupHover(this.itemBtn);
    setupHover(this.waitBtn);
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
