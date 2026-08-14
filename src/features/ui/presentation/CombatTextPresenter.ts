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
    text.setDepth(10); // Ensure it's above other elements

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

    // Center the text origin horizontally and vertically
    text.setOrigin(0.5, 0.5);
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
