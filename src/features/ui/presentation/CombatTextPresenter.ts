import * as Phaser from "phaser";

export class CombatTextPresenter {
  constructor(private scene: Phaser.Scene) {}

  showLevelUp(x: number, y: number, stats: { hpIncrease: number, attackIncrease: number, defenseIncrease: number }): void {
    const parts = ["LEVEL UP!"];
    if (stats.hpIncrease > 0) parts.push(`HP+${stats.hpIncrease}`);
    if (stats.attackIncrease > 0) parts.push(`ATK+${stats.attackIncrease}`);
    if (stats.defenseIncrease > 0) parts.push(`DEF+${stats.defenseIncrease}`);

    const bannerText = parts.join(" ");

    const text = this.scene.add.text(x, y, bannerText, {
      fontSize: "14px",
      color: "#ffd700", // Gold
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 4,
    });

    text.setOrigin(0.5, 0.5);
    text.setDepth(100);

    this.scene.tweens.add({
      targets: text,
      y: y - 40,
      alpha: 0,
      duration: 1500,
      ease: 'Sine.easeOut',
      onComplete: () => {
        text.destroy();
      }
    });
  }

  showBanner(x: number, y: number, message: string): void {
    const text = this.scene.add.text(x, y, message, {
      fontSize: "13px",
      color: "#00ff00", // Bright Green for item pickups
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 3,
    });

    text.setOrigin(0.5, 0.5);
    text.setDepth(100);

    this.scene.tweens.add({
      targets: text,
      y: y - 35,
      alpha: { from: 1, to: 0 },
      duration: 1200,
      ease: 'Sine.easeOut',
      onComplete: () => {
        text.destroy();
      }
    });
  }

  showHeal(x: number, y: number, amount: number): void {
    const text = this.scene.add.text(x, y, `+${amount} HP`, {
      fontSize: "14px",
      color: "#55ff55",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 3,
    });

    text.setOrigin(0.5, 0.5);
    text.setDepth(100);
    text.setScale(1.2);

    this.scene.tweens.add({
      targets: text,
      y: y - 25,
      scale: 1.0,
      alpha: 0,
      duration: 1000,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        text.destroy();
      }
    });
  }

  showDamage(x: number, y: number, amount: number, isAdvantage: boolean = false, isDisadvantage: boolean = false): void {
    let color = "#ff4444"; // Normal Red
    if (isAdvantage) {
      color = "#ffff00"; // Gold
    } else if (isDisadvantage) {
      color = "#888888"; // Blue/Gray
    }

    const text = this.scene.add.text(x, y, amount.toString(), {
      fontSize: "16px",
      color: color,
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 3,
    });

    text.setOrigin(0.5, 0.5);
    text.setDepth(100);
    text.setScale(1.3);

    this.scene.tweens.add({
      targets: text,
      y: y - 30,
      scale: 1.0,
      alpha: 0,
      duration: 800,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        text.destroy();
      }
    });
  }
}
