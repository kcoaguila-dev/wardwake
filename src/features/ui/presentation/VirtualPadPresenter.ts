import * as Phaser from 'phaser';
import { GamepadAction } from '../infrastructure/GamepadInputService';

export class VirtualPadPresenter {
  private container: Phaser.GameObjects.Container;
  private isMobile: boolean;

  constructor(private scene: Phaser.Scene) {
    this.isMobile = this.scene.sys.game.device.os.android ||
                    this.scene.sys.game.device.os.iOS ||
                    this.scene.sys.game.device.input.touch;

    this.container = this.scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(100);

    if (this.isMobile) {
      this.createPad();
    }
  }

  private createPad(): void {
    const { width, height } = this.scene.scale;

    // Virtual D-Pad (Bottom Left)
    const dpadX = 70;
    const dpadY = height - 70;
    const btnSize = 40;

    this.createButton(dpadX, dpadY - btnSize, btnSize, btnSize, 'UP', '▲', this.container);
    this.createButton(dpadX, dpadY + btnSize, btnSize, btnSize, 'DOWN', '▼', this.container);
    this.createButton(dpadX - btnSize, dpadY, btnSize, btnSize, 'LEFT', '◀', this.container);
    this.createButton(dpadX + btnSize, dpadY, btnSize, btnSize, 'RIGHT', '▶', this.container);

    // Action Buttons (Bottom Right)
    const actionX = width - 70;
    const actionY = height - 70;

    this.createButton(actionX, actionY + btnSize, btnSize, btnSize, 'A', 'A', this.container, 0x00aa00);
    this.createButton(actionX + btnSize, actionY, btnSize, btnSize, 'B', 'B', this.container, 0xaa0000);
    this.createButton(actionX - btnSize, actionY, btnSize, btnSize, 'X', 'X', this.container, 0x0000aa);
    this.createButton(actionX, actionY - btnSize, btnSize, btnSize, 'Y', 'Y', this.container, 0xaaaa00);

    // LB / RB (Top Right of Action area or Top left/right)
    this.createButton(width - 50, 50, 40, 30, 'RB', 'RB', this.container, 0x444444);
    this.createButton(50, 50, 40, 30, 'LB', 'LB', this.container, 0x444444);
  }

  private createButton(x: number, y: number, w: number, h: number, action: GamepadAction, label: string, container: Phaser.GameObjects.Container, color: number = 0x555555): void {
    const bg = this.scene.add.rectangle(x, y, w - 4, h - 4, color, 0.75); // Increased opacity for better visibility
    bg.setInteractive({ useHandCursor: true });

    const text = this.scene.add.text(x, y, label, {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    container.add([bg, text]);

    // Handle touch/click
    let isPressed = false;
    let repeatTimer: Phaser.Time.TimerEvent | null = null;

    const triggerAction = () => {
      this.scene.events.emit('VIRTUAL_PAD_ACTION', action);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(20);
      }
    };

    bg.on('pointerdown', () => {
      bg.setAlpha(1.0);
      isPressed = true;
      triggerAction();

      if (['UP', 'DOWN', 'LEFT', 'RIGHT'].includes(action)) {
        repeatTimer = this.scene.time.addEvent({
          delay: 200, // wait a bit before repeating
          callback: () => {
            repeatTimer = this.scene.time.addEvent({
              delay: 150,
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
      bg.setAlpha(0.75);
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

  public destroy(): void {
    this.container.destroy();
  }
}
