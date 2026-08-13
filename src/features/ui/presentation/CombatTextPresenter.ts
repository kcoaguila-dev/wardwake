import * as Phaser from "phaser";

export class CombatTextPresenter {
  constructor(private scene: Phaser.Scene) {}

  showDamage(x: number, y: number, amount: number): void {
    const text = this.scene.add.text(x, y, amount.toString(), {
      fontSize: "16px",
      color: "#ff0000",
      fontStyle: "bold",
    });

    // Center the text origin horizontally and vertically
    text.setOrigin(0.5, 0.5);

    this.scene.tweens.add({
      targets: text,
      y: y - 20,
      alpha: 0,
      duration: 800,
      ease: 'Linear',
      onComplete: () => {
        text.destroy();
      }
    });
  }
}
