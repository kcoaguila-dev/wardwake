import * as Phaser from "phaser";

export class CombatTextPresenter {
  constructor(private scene: Phaser.Scene) {}

  showHeal(x: number, y: number, amount: number): void {
    const text = this.scene.add.text(x, y, `+${amount} HP`, {
      fontSize: "14px",
      color: "#55ff55",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 3,
    });

    text.setOrigin(0.5, 0.5);
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
