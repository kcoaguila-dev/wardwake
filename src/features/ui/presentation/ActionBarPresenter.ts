import * as Phaser from 'phaser';

export class ActionBarPresenter {
  private bg: Phaser.GameObjects.Graphics;
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
  private isCombatMode: boolean = false;

  constructor(private scene: Phaser.Scene) {
    const width = this.scene.scale.width || 640;
    const height = this.scene.scale.height || 360;

    const barWidth = 364;
    const barHeight = 32;
    const startX = (width - barWidth) / 2;
    const startY = height - 76;

    // 1. Background Dock Bar (Depth 240)
    this.bg = this.scene.add.graphics();
    this.bg.fillStyle(0x0a0e17, 0.96);
    this.bg.fillRoundedRect(startX, startY, barWidth, barHeight, 6);
    this.bg.lineStyle(1.5, 0x1e293b, 1);
    this.bg.strokeRoundedRect(startX, startY, barWidth, barHeight, 6);
    this.bg.setScrollFactor(0);
    this.bg.setDepth(240);

    const btnW = 84;
    const btnH = 24;
    const btnY = startY + 4;
    const spacing = 88;
    const firstX = startX + 6;

    // Helper to create direct, robust interactive button
    const createBtn = (x: number, label: string, onClick: () => void) => {
      const rect = this.scene.add.rectangle(x, btnY, btnW, btnH, 0x1e293b)
        .setOrigin(0, 0)
        .setStrokeStyle(1.5, 0x475569)
        .setScrollFactor(0)
        .setDepth(250)
        .setInteractive({ useHandCursor: true });

      const text = this.scene.add.text(x + btnW / 2, btnY + btnH / 2, label, {
        fontSize: '11px',
        fontFamily: 'monospace',
        fontStyle: 'bold',
        color: '#cbd5e1'
      })
        .setOrigin(0.5, 0.5)
        .setScrollFactor(0)
        .setDepth(251)
        .setInteractive({ useHandCursor: true });

      const trigger = (pointer?: Phaser.Input.Pointer, _lx?: number, _ly?: number, event?: any) => {
        if (event && event.stopPropagation) event.stopPropagation();
        onClick();
      };

      rect.on('pointerdown', trigger);
      text.on('pointerdown', trigger);

      rect.on('pointerover', () => rect.setFillStyle(0x334155));
      rect.on('pointerout', () => this.refreshStyles());

      return { rect, text };
    };

    // 1. ATTACK Button
    const attack = createBtn(firstX, '⚔️ ATTACK', () => {
      if (this.onAttack) this.onAttack();
    });
    this.attackBtn = attack.rect;
    this.attackText = attack.text;

    // 2. SKILL Button
    const skill = createBtn(firstX + spacing, '✨ SKILL', () => {
      if (this.onSkill) this.onSkill();
    });
    this.skillBtn = skill.rect;
    this.skillText = skill.text;

    // 3. ITEM Button
    const item = createBtn(firstX + spacing * 2, '🎒 ITEM', () => {
      if (this.onItem) this.onItem();
    });
    this.itemBtn = item.rect;
    this.itemText = item.text;

    // 4. WAIT Button
    const wait = createBtn(firstX + spacing * 3, '⏳ WAIT', () => {
      if (this.onWait) this.onWait();
    });
    this.waitBtn = wait.rect;
    this.waitText = wait.text;
  }

  public updateState(canAttack: boolean, canSkill: boolean = true, isCombat: boolean = false): void {
    this.canAttack = canAttack;
    this.canSkill = canSkill;
    this.isCombatMode = isCombat;
    this.refreshStyles();
  }

  private canSkill: boolean = true;

  public resize(width: number, height: number): void {
    const barWidth = 364;
    const barHeight = 32;
    const startX = (width - barWidth) / 2;
    const startY = height - 76;

    this.bg.clear();
    this.bg.fillStyle(0x0a0e17, 0.96);
    this.bg.fillRoundedRect(startX, startY, barWidth, barHeight, 6);
    this.bg.lineStyle(1.5, 0x1e293b, 1);
    this.bg.strokeRoundedRect(startX, startY, barWidth, barHeight, 6);

    const btnW = 84;
    const btnH = 24;
    const btnY = startY + 4;
    const spacing = 88;
    const firstX = startX + 6;

    const repositionBtn = (rect: Phaser.GameObjects.Rectangle, text: Phaser.GameObjects.Text, x: number) => {
      rect.setPosition(x, btnY);
      text.setPosition(x + btnW / 2, btnY + btnH / 2);
    };

    repositionBtn(this.attackBtn, this.attackText, firstX);
    repositionBtn(this.skillBtn, this.skillText, firstX + spacing);
    repositionBtn(this.itemBtn, this.itemText, firstX + spacing * 2);
    repositionBtn(this.waitBtn, this.waitText, firstX + spacing * 3);
  }

  private refreshStyles(): void {
    if (this.canAttack) {
      this.attackBtn.setFillStyle(0x065f46); // Emerald highlight when attack available
      this.attackBtn.setStrokeStyle(1.5, 0x34d399);
      this.attackText.setColor('#34d399');
    } else {
      this.attackBtn.setFillStyle(0x0f172a);
      this.attackBtn.setStrokeStyle(1, 0x334155);
      this.attackText.setColor(this.isCombatMode ? '#64748b' : '#94a3b8');
    }

    if (this.canSkill) {
      this.skillBtn.setFillStyle(0x1e1b4b); // Violet/indigo accent
      this.skillBtn.setStrokeStyle(1.5, 0x818cf8);
      this.skillText.setColor('#c7d2fe');
    } else {
      this.skillBtn.setFillStyle(0x0f172a);
      this.skillBtn.setStrokeStyle(1, 0x334155);
      this.skillText.setColor('#64748b');
    }

    this.itemBtn.setFillStyle(0x1e293b);
    this.itemBtn.setStrokeStyle(1.5, 0x475569);
    this.itemText.setColor('#f8fafc');

    this.waitBtn.setFillStyle(0x1e293b);
    this.waitBtn.setStrokeStyle(1.5, 0x475569);
    this.waitText.setColor('#f8fafc');
  }

  public setVisible(visible: boolean): void {
    this.bg.setVisible(visible);
    this.attackBtn.setVisible(visible);
    this.attackText.setVisible(visible);
    this.skillBtn.setVisible(visible);
    this.skillText.setVisible(visible);
    this.itemBtn.setVisible(visible);
    this.itemText.setVisible(visible);
    this.waitBtn.setVisible(visible);
    this.waitText.setVisible(visible);
  }

  public destroy(): void {
    this.bg.destroy();
    this.attackBtn.destroy();
    this.attackText.destroy();
    this.skillBtn.destroy();
    this.skillText.destroy();
    this.itemBtn.destroy();
    this.itemText.destroy();
    this.waitBtn.destroy();
    this.waitText.destroy();
  }
}
