import * as Phaser from 'phaser';

export class StairsModalPresenter {
  private elements: (Phaser.GameObjects.Rectangle | Phaser.GameObjects.Text)[] = [];
  private backdrop: Phaser.GameObjects.Rectangle;
  private modalBg: Phaser.GameObjects.Rectangle;
  private titleText: Phaser.GameObjects.Text;
  private descText: Phaser.GameObjects.Text;

  private descendBtn: Phaser.GameObjects.Rectangle;
  private descendText: Phaser.GameObjects.Text;
  private stayBtn: Phaser.GameObjects.Rectangle;
  private stayText: Phaser.GameObjects.Text;

  private visible: boolean = false;
  public onDescend?: () => void;
  public onStay?: () => void;

  constructor(private scene: Phaser.Scene) {
    const screenWidth = this.scene.scale.width || 640;
    const screenHeight = this.scene.scale.height || 360;

    // 1. Semi-transparent backdrop shield
    this.backdrop = this.scene.add.rectangle(0, 0, screenWidth, screenHeight, 0x000000, 0.7)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(260)
      .setInteractive();

    const modalWidth = 260;
    const modalHeight = 135;
    const modalX = (screenWidth - modalWidth) / 2;
    const modalY = (screenHeight - modalHeight) / 2;

    // 2. Modal Background Window
    this.modalBg = this.scene.add.rectangle(modalX, modalY, modalWidth, modalHeight, 0x0f172a, 0.98)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(261)
      .setStrokeStyle(2, 0xffd700)
      .setInteractive();

    // 3. Title
    this.titleText = this.scene.add.text(screenWidth / 2, modalY + 22, '🪜 STAIRWAY', {
      fontSize: '14px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#ffd700'
    }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(262);

    // 4. Subtitle / Prompt
    this.descText = this.scene.add.text(screenWidth / 2, modalY + 52, 'Go to the next floor (Floor 2)?', {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#f8fafc'
    }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(262);

    // 5. YES / PROCEED Button
    const btnWidth = 105;
    const btnHeight = 30;
    const btnY = modalY + 84;

    const descendBtnX = screenWidth / 2 - btnWidth - 8;
    this.descendBtn = this.scene.add.rectangle(descendBtnX, btnY, btnWidth, btnHeight, 0x1e3a8a)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(263)
      .setStrokeStyle(1.5, 0x38bdf8)
      .setInteractive({ useHandCursor: true });

    this.descendText = this.scene.add.text(descendBtnX + btnWidth / 2, btnY + btnHeight / 2, '🪜 YES', {
      fontSize: '11px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(264).setInteractive({ useHandCursor: true });

    const handleDescend = (pointer?: Phaser.Input.Pointer, _lx?: number, _ly?: number, event?: any) => {
      if (event && event.stopPropagation) event.stopPropagation();
      if (this.visible && this.onDescend) {
        this.onDescend();
      }
    };
    this.descendBtn.on('pointerdown', handleDescend);
    this.descendText.on('pointerdown', handleDescend);
    this.descendBtn.on('pointerover', () => this.descendBtn.setFillStyle(0x2563eb));
    this.descendBtn.on('pointerout', () => this.descendBtn.setFillStyle(0x1e3a8a));

    // 6. NO / STAY Button
    const stayBtnX = screenWidth / 2 + 8;
    this.stayBtn = this.scene.add.rectangle(stayBtnX, btnY, btnWidth, btnHeight, 0x334155)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(263)
      .setStrokeStyle(1.5, 0x64748b)
      .setInteractive({ useHandCursor: true });

    this.stayText = this.scene.add.text(stayBtnX + btnWidth / 2, btnY + btnHeight / 2, '❌ NO', {
      fontSize: '11px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#cbd5e1'
    }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(264).setInteractive({ useHandCursor: true });

    const handleStay = (pointer?: Phaser.Input.Pointer, _lx?: number, _ly?: number, event?: any) => {
      if (event && event.stopPropagation) event.stopPropagation();
      if (this.visible && this.onStay) {
        this.onStay();
      }
    };
    this.stayBtn.on('pointerdown', handleStay);
    this.stayText.on('pointerdown', handleStay);
    this.stayBtn.on('pointerover', () => this.stayBtn.setFillStyle(0x475569));
    this.stayBtn.on('pointerout', () => this.stayBtn.setFillStyle(0x334155));

    this.elements = [
      this.backdrop,
      this.modalBg,
      this.titleText,
      this.descText,
      this.descendBtn,
      this.descendText,
      this.stayBtn,
      this.stayText
    ];

    // Hide by default
    this.setVisible(false);

    // Keyboard bindings
    this.scene.input.keyboard?.on('keydown-Y', () => {
      if (this.visible && this.onDescend) this.onDescend();
    });
    this.scene.input.keyboard?.on('keydown-N', () => {
      if (this.visible && this.onStay) this.onStay();
    });
  }

  private setVisible(state: boolean): void {
    this.visible = state;
    this.elements.forEach(el => el.setVisible(state));
  }

  public show(nextFloor: number): void {
    this.descText.setText(`Go to the next floor (Floor ${nextFloor})?`);
    this.setVisible(true);
  }

  public hide(): void {
    this.setVisible(false);
  }

  public isVisible(): boolean {
    return this.visible;
  }

  public destroy(): void {
    this.elements.forEach(el => el.destroy());
    this.elements = [];
  }
}
