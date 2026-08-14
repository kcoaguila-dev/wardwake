import * as Phaser from 'phaser';
import { Trap, TrapType } from '../domain/Trap';
import { GridPresenter } from '../../grid/presentation/GridPresenter';

export class TrapPresenter {
  private graphics: Map<string, Phaser.GameObjects.Graphics> = new Map();

  constructor(private scene: Phaser.Scene) {}

  public drawRevealedTrap(trap: Trap): void {
    const key = `${trap.coord.x},${trap.coord.y}`;
    if (this.graphics.has(key)) return;

    const g = this.scene.add.graphics();
    const x = trap.coord.x * GridPresenter.TILE_SIZE;
    const y = trap.coord.y * GridPresenter.TILE_SIZE;
    const size = GridPresenter.TILE_SIZE;

    g.setDepth(1.2);

    switch (trap.type) {
      case TrapType.DAMAGE:
        // Steel Spike glyph
        g.fillStyle(0x475569, 0.9);
        g.fillRect(x + 6, y + 6, size - 12, size - 12);
        g.fillStyle(0xef4444, 1);
        // 4 metallic spikes
        g.fillTriangle(x + 10, y + 22, x + 16, y + 8, x + 22, y + 22);
        break;

      case TrapType.WARP:
        // Mystic Blue Warp Portal
        g.fillStyle(0x1e1b4b, 0.9);
        g.fillRect(x + 4, y + 4, size - 8, size - 8);
        g.lineStyle(2, 0x60a5fa, 1);
        g.strokeCircle(x + size / 2, y + size / 2, 8);
        g.fillStyle(0x38bdf8, 1);
        g.fillCircle(x + size / 2, y + size / 2, 4);
        break;

      case TrapType.BELLY:
        // Sticky Mud Swamp
        g.fillStyle(0x78350f, 0.9);
        g.fillRect(x + 4, y + 4, size - 8, size - 8);
        g.fillStyle(0xd97706, 1);
        g.fillCircle(x + 10, y + 14, 4);
        g.fillCircle(x + 22, y + 18, 5);
        break;
    }

    g.setAlpha(0);
    this.scene.tweens.add({
      targets: g,
      alpha: 1,
      duration: 250,
      ease: 'Cubic.easeOut'
    });

    this.graphics.set(key, g);
  }

  public clear(): void {
    this.graphics.forEach(g => g.destroy());
    this.graphics.clear();
  }
}
