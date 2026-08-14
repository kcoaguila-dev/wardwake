import * as Phaser from 'phaser';
import { Unit } from '../../combat/domain/Unit';

export class PartyHudPresenter {
  private container: Phaser.GameObjects.Container;
  private p1Card!: Phaser.GameObjects.Container;
  private p2Card!: Phaser.GameObjects.Container;

  private p1Bg!: Phaser.GameObjects.Rectangle;
  private p1Avatar!: Phaser.GameObjects.Sprite;
  private p1TitleText!: Phaser.GameObjects.Text;
  private p1HpText!: Phaser.GameObjects.Text;
  private p1HpBar!: Phaser.GameObjects.Graphics;
  private p1SpText!: Phaser.GameObjects.Text;
  private p1SpBar!: Phaser.GameObjects.Graphics;
  private p1StatsText!: Phaser.GameObjects.Text;
  private p1BellyText!: Phaser.GameObjects.Text;

  private p2Bg!: Phaser.GameObjects.Rectangle;
  private p2Avatar!: Phaser.GameObjects.Sprite;
  private p2TitleText!: Phaser.GameObjects.Text;
  private p2HpText!: Phaser.GameObjects.Text;
  private p2HpBar!: Phaser.GameObjects.Graphics;
  private p2SpText!: Phaser.GameObjects.Text;
  private p2SpBar!: Phaser.GameObjects.Graphics;
  private p2StatsText!: Phaser.GameObjects.Text;
  private p2BellyText!: Phaser.GameObjects.Text;

  public onSelectHero?: (index: number) => void;

  constructor(private scene: Phaser.Scene) {
    this.container = this.scene.add.container(0, 318);
    this.container.setScrollFactor(0);
    this.container.setDepth(20);

    const screenWidth = this.scene.scale.width || 640;
    const barHeight = 42;

    // Bottom Background Panel
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x0a0e17, 0.95);
    bg.fillRect(0, 0, screenWidth, barHeight);
    bg.lineStyle(1, 0x2e384d, 1);
    bg.lineBetween(0, 0, screenWidth, 0);

    this.container.add(bg);

    // Build P1 Card (Left side)
    this.createP1Card(20);

    // Build P2 Card (Right side)
    this.createP2Card(330);
  }

  private createP1Card(startX: number): void {
    this.p1Card = this.scene.add.container(startX, 4);

    this.p1Bg = this.scene.add.rectangle(0, 0, 290, 34, 0x111622, 0.9)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0xffd700)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.onSelectHero?.(0));

    this.p1Avatar = this.scene.add.sprite(16, 17, 'unit_sword').setScale(1.5);

    this.p1TitleText = this.scene.add.text(34, 3, '👑 SWORD FIGHTER (Lv. 1)', {
      fontSize: '10px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#ffd700'
    });

    this.p1HpBar = this.scene.add.graphics();

    this.p1HpText = this.scene.add.text(34, 18, 'HP 24/24', {
      fontSize: '9px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#e2e8f0'
    });

    this.p1SpBar = this.scene.add.graphics();

    this.p1SpText = this.scene.add.text(80, 18, 'SP 20/20', {
      fontSize: '9px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#c084fc'
    });

    this.p1StatsText = this.scene.add.text(135, 18, '⚔️8 🛡️2', {
      fontSize: '9px',
      fontFamily: 'monospace',
      color: '#94a3b8'
    });

    this.p1BellyText = this.scene.add.text(215, 18, '🍞 100%', {
      fontSize: '9px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#f59e0b'
    });

    this.p1Card.add([this.p1Bg, this.p1Avatar, this.p1TitleText, this.p1HpBar, this.p1HpText, this.p1SpBar, this.p1SpText, this.p1StatsText, this.p1BellyText]);
    this.container.add(this.p1Card);
  }

  private createP2Card(startX: number): void {
    this.p2Card = this.scene.add.container(startX, 4);

    this.p2Bg = this.scene.add.rectangle(0, 0, 290, 34, 0x111622, 0.9)
      .setOrigin(0, 0)
      .setStrokeStyle(1.5, 0x00d4ff)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.onSelectHero?.(1));

    this.p2Avatar = this.scene.add.sprite(16, 17, 'unit_lance').setScale(1.5);

    this.p2TitleText = this.scene.add.text(34, 3, '🔵 LANCE KNIGHT (Lv. 1)', {
      fontSize: '10px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#38bdf8'
    });

    this.p2HpBar = this.scene.add.graphics();

    this.p2HpText = this.scene.add.text(34, 18, 'HP 22/22', {
      fontSize: '9px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#e2e8f0'
    });

    this.p2SpBar = this.scene.add.graphics();

    this.p2SpText = this.scene.add.text(80, 18, 'SP 20/20', {
      fontSize: '9px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#c084fc'
    });

    this.p2StatsText = this.scene.add.text(135, 18, '🔱8 🛡️3', {
      fontSize: '9px',
      fontFamily: 'monospace',
      color: '#94a3b8'
    });

    this.p2BellyText = this.scene.add.text(215, 18, '🍞 100%', {
      fontSize: '9px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#f59e0b'
    });

    this.p2Card.add([this.p2Bg, this.p2Avatar, this.p2TitleText, this.p2HpBar, this.p2HpText, this.p2SpBar, this.p2SpText, this.p2StatsText, this.p2BellyText]);
    this.container.add(this.p2Card);
  }

  public updateParty(players: { unit: Unit }[], activeLeaderIndex: number | null = null): void {
    // 1. Update Card 1
    if (players[0]) {
      const u1 = players[0].unit;
      const isDead = u1.currentHp <= 0;
      const isLeader = !isDead && (activeLeaderIndex === 0 || (activeLeaderIndex === null && !isDead));

      if (isDead) {
        this.p1Bg.setStrokeStyle(1, 0x475569);
        this.p1Bg.setFillStyle(0x0a0d14, 0.85);
        this.p1Avatar.setTint(0x64748b);
        this.p1TitleText.setText(`💀 ${u1.name.toUpperCase()} (FALLEN)`);
        this.p1TitleText.setColor('#ef4444');
        this.p1HpText.setText('HP 0/0');
        this.p1HpText.setColor('#ef4444');
        this.p1SpText.setText('SP 0/0');
        this.p1StatsText.setText('---');
        this.p1BellyText.setText('');
        this.drawBar(this.p1HpBar, 34, 28, 40, 2, 0, 0xef4444);
        this.drawBar(this.p1SpBar, 80, 28, 40, 2, 0, 0xc084fc);
      } else {
        this.p1Avatar.clearTint();
        this.p1HpText.setColor('#e2e8f0');
        this.p1HpText.setText(`HP ${u1.currentHp}/${u1.maxHp}`);
        this.p1SpText.setText(`SP ${u1.currentSp}/${u1.maxSp}`);
        this.p1StatsText.setText(`⚔️${u1.attack} 🛡️${u1.defense}`);
        this.p1BellyText.setText(`🍞 ${u1.belly}%`);
        this.p1BellyText.setColor(u1.belly <= 20 ? '#ef4444' : '#f59e0b');

        if (isLeader) {
          this.p1Bg.setStrokeStyle(2, 0xffd700); // Radiant Gold
          this.p1Bg.setFillStyle(0x1a2333, 0.95);
          this.p1TitleText.setText(`👑 ${u1.name.toUpperCase()} (Lv. ${u1.level || 1})`);
          this.p1TitleText.setColor('#ffd700');
        } else {
          this.p1Bg.setStrokeStyle(1.5, 0x00d4ff); // Cyan Ally
          this.p1Bg.setFillStyle(0x111622, 0.9);
          this.p1TitleText.setText(`🔵 ${u1.name.toUpperCase()} (Lv. ${u1.level || 1})`);
          this.p1TitleText.setColor('#38bdf8');
        }

        let hpColor = 0x22c55e;
        if (u1.currentHp / u1.maxHp <= 0.25) hpColor = 0xef4444;
        else if (u1.currentHp / u1.maxHp <= 0.5) hpColor = 0xf59e0b;

        this.drawBar(this.p1HpBar, 34, 28, 40, 2, u1.currentHp / u1.maxHp, hpColor);
        this.drawBar(this.p1SpBar, 80, 28, 40, 2, u1.currentSp / u1.maxSp, 0xc084fc);
      }
    }

    // 2. Update Card 2
    if (players[1]) {
      const u2 = players[1].unit;
      const isDead = u2.currentHp <= 0;
      const isLeader = !isDead && (activeLeaderIndex === 1 || (activeLeaderIndex === null && (players[0]?.unit?.currentHp ?? 0) <= 0));

      if (isDead) {
        this.p2Bg.setStrokeStyle(1, 0x475569);
        this.p2Bg.setFillStyle(0x0a0d14, 0.85);
        this.p2Avatar.setTint(0x64748b);
        this.p2TitleText.setText(`💀 ${u2.name.toUpperCase()} (FALLEN)`);
        this.p2TitleText.setColor('#ef4444');
        this.p2HpText.setText('HP 0/0');
        this.p2HpText.setColor('#ef4444');
        this.p2SpText.setText('SP 0/0');
        this.p2StatsText.setText('---');
        this.p2BellyText.setText('');
        this.drawBar(this.p2HpBar, 34, 28, 40, 2, 0, 0xef4444);
        this.drawBar(this.p2SpBar, 80, 28, 40, 2, 0, 0xc084fc);
      } else {
        this.p2Avatar.clearTint();
        this.p2HpText.setColor('#e2e8f0');
        this.p2HpText.setText(`HP ${u2.currentHp}/${u2.maxHp}`);
        this.p2SpText.setText(`SP ${u2.currentSp}/${u2.maxSp}`);
        this.p2StatsText.setText(`🔱${u2.attack} 🛡️${u2.defense}`);
        this.p2BellyText.setText(`🍞 ${u2.belly}%`);
        this.p2BellyText.setColor(u2.belly <= 20 ? '#ef4444' : '#f59e0b');

        if (isLeader) {
          this.p2Bg.setStrokeStyle(2, 0xffd700); // Radiant Gold
          this.p2Bg.setFillStyle(0x1a2333, 0.95);
          this.p2TitleText.setText(`👑 ${u2.name.toUpperCase()} (Lv. ${u2.level || 1})`);
          this.p2TitleText.setColor('#ffd700');
        } else {
          this.p2Bg.setStrokeStyle(1.5, 0x00d4ff); // Cyan Ally
          this.p2Bg.setFillStyle(0x111622, 0.9);
          this.p2TitleText.setText(`🔵 ${u2.name.toUpperCase()} (Lv. ${u2.level || 1})`);
          this.p2TitleText.setColor('#38bdf8');
        }

        let hpColor = 0x22c55e;
        if (u2.currentHp / u2.maxHp <= 0.25) hpColor = 0xef4444;
        else if (u2.currentHp / u2.maxHp <= 0.5) hpColor = 0xf59e0b;

        this.drawBar(this.p2HpBar, 34, 28, 40, 2, u2.currentHp / u2.maxHp, hpColor);
        this.drawBar(this.p2SpBar, 80, 28, 40, 2, u2.currentSp / u2.maxSp, 0xc084fc);
      }
    }
  }

  private drawBar(graphics: Phaser.GameObjects.Graphics, x: number, y: number, width: number, height: number, ratio: number, color: number): void {
    graphics.clear();
    const clamped = Math.max(0, Math.min(1, ratio));
    graphics.fillStyle(0x334155, 1);
    graphics.fillRect(x, y, width, height);

    graphics.fillStyle(color, 1);
    graphics.fillRect(x, y, width * clamped, height);
  }

  public destroy(): void {
    this.container.destroy();
  }
}
