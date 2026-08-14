import * as Phaser from 'phaser';
import { GamepadAction } from '../infrastructure/GamepadInputService';

export class VirtualPadPresenter {
  private container: Phaser.GameObjects.Container;
  private isMobile: boolean;
  private isVisible: boolean = true;

  constructor(private scene: Phaser.Scene) {
    this.isMobile = this.scene.sys.game.device.os.android ||
                    this.scene.sys.game.device.os.iOS ||
                    this.scene.sys.game.device.input.touch;

    this.container = this.scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(90);

    if (this.isMobile) {
      this.createPad();
    }
  }

  private createPad(): void {
    const { width } = this.scene.scale;

    // 1. Virtual D-Pad (Left side, comfortably above bottom Party HUD at y: 318)
    const dpadX = 54;
    const dpadY = 230;
    const btnSize = 32;
    const offset = 34;

    this.createButton(dpadX, dpadY - offset, btnSize, btnSize, 'UP', '▲', this.container, 0x1e293b);
    this.createButton(dpadX, dpadY + offset, btnSize, btnSize, 'DOWN', '▼', this.container, 0x1e293b);
    this.createButton(dpadX - offset, dpadY, btnSize, btnSize, 'LEFT', '◀', this.container, 0x1e293b);
    this.createButton(dpadX + offset, dpadY, btnSize, btnSize, 'RIGHT', '▶', this.container, 0x1e293b);

    // 2. Action Buttons (Right side, comfortably above bottom Party HUD)
    const actionX = width - 54;
    const actionY = 230;

    this.createButton(actionX, actionY + offset, btnSize, btnSize, 'A', 'A', this.container, 0x059669); // Emerald Confirm
    this.createButton(actionX + offset, actionY, btnSize, btnSize, 'B', 'B', this.container, 0xdc2626); // Crimson Cancel/Sprint
    this.createButton(actionX - offset, actionY, btnSize, btnSize, 'X', 'X', this.container, 0x2563eb); // Cobalt Attack/Action
    this.createButton(actionX, actionY - offset, btnSize, btnSize, 'Y', 'Y', this.container, 0xd97706); // Amber Skill/Menu

    // 3. Shoulder Buttons (LB on left mid-screen, RB on right mid-screen below minimap)
    this.createButton(30, 142, 38, 24, 'LB', 'LB', this.container, 0x334155);
    this.createButton(width - 30, 142, 38, 24, 'RB', 'RB', this.container, 0x334155);
  }

  private createButton(
    x: number,
    y: number,
    w: number,
    h: number,
    action: GamepadAction,
    label: string,
    container: Phaser.GameObjects.Container,
    color: number = 0x334155
  ): void {
    const bg = this.scene.add.rectangle(x, y, w, h, color, 0.6)
      .setStrokeStyle(1.5, 0x94a3b8, 0.8);
    bg.setInteractive({ useHandCursor: true });

    const text = this.scene.add.text(x, y, label, {
      fontSize: h > 28 ? '13px' : '10px',
      fontFamily: 'monospace',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    container.add([bg, text]);

    // Touch handlers
    let isPressed = false;
    let repeatTimer: Phaser.Time.TimerEvent | null = null;

    const triggerAction = () => {
      this.scene.events.emit('VIRTUAL_PAD_ACTION', action);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate(15); } catch {}
      }
    };

    bg.on('pointerdown', () => {
      bg.setAlpha(1.0);
      bg.setScale(0.92);
      text.setScale(0.92);
      isPressed = true;
      triggerAction();

      if (['UP', 'DOWN', 'LEFT', 'RIGHT'].includes(action)) {
        repeatTimer = this.scene.time.addEvent({
          delay: 220,
          callback: () => {
            repeatTimer = this.scene.time.addEvent({
              delay: 130,
              callback: triggerAction,
              loop: true
            });
          }
        });
      } else if (action === 'B') {
        this.scene.events.emit('VIRTUAL_PAD_ACTION_DOWN', action);
      }
    });

    const release = () => {
      if (!isPressed) return;
      bg.setAlpha(0.6);
      bg.setScale(1.0);
      text.setScale(1.0);
      isPressed = false;
      if (repeatTimer) {
        repeatTimer.remove();
        repeatTimer = null;
      }
      if (action === 'B') {
        this.scene.events.emit('VIRTUAL_PAD_ACTION_UP', action);
      }
    };

    bg.on('pointerup', release);
    bg.on('pointerout', release);
  }

  public toggle(): void {
    this.isVisible = !this.isVisible;
    this.container.setVisible(this.isVisible);
  }

  public setVisible(visible: boolean): void {
    this.isVisible = visible;
    this.container.setVisible(visible);
  }

  public destroy(): void {
    this.container.destroy();
  }
}
