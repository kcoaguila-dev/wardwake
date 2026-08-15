import * as Phaser from 'phaser';

export class SeedInputModalPresenter {
  private container: Phaser.GameObjects.Container;
  private isVisible: boolean = false;
  private inputElement: HTMLInputElement | null = null;
  private onStartCallback?: (seed: string) => void;

  constructor(private scene: Phaser.Scene) {
    this.container = this.scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(100);
    this.container.setVisible(false);

    this.createUI();
  }

  public setOnStart(callback: (seed: string) => void): void {
    this.onStartCallback = callback;
  }

  private createUI(): void {
    const screenWidth = this.scene.cameras.main.width;
    const screenHeight = this.scene.cameras.main.height;

    // Dim Background
    const bgOverlay = this.scene.add.rectangle(0, 0, screenWidth, screenHeight, 0x000000, 0.7).setOrigin(0, 0);
    bgOverlay.setInteractive();

    // Modal Background
    const modalW = 300;
    const modalH = 150;
    const modalX = (screenWidth - modalW) / 2;
    const modalY = (screenHeight - modalH) / 2;

    const modalBg = this.scene.add.rectangle(modalX, modalY, modalW, modalH, 0x1e293b).setOrigin(0, 0);
    modalBg.setStrokeStyle(2, 0x10b981);

    // Title
    const titleText = this.scene.add.text(screenWidth / 2, modalY + 20, 'ENTER DUNGEON SEED', {
      fontSize: '14px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#34d399'
    }).setOrigin(0.5, 0.5);

    this.container.add([bgOverlay, modalBg, titleText]);

    // DOM Input Element for actual text typing (Phaser text input is tricky)
    this.createDOMInput(modalX + modalW / 2, modalY + 60);

    // Buttons
    const btnW = 100;
    const btnH = 30;
    const cancelBtnX = modalX + 20;
    const startBtnX = modalX + modalW - btnW - 20;
    const btnY = modalY + modalH - 40;

    // Cancel Button
    const cancelBtnBg = this.scene.add.rectangle(cancelBtnX, btnY, btnW, btnH, 0x475569).setOrigin(0, 0);
    cancelBtnBg.setInteractive({ useHandCursor: true });
    cancelBtnBg.on('pointerdown', () => this.hide());
    const cancelBtnText = this.scene.add.text(cancelBtnX + btnW / 2, btnY + btnH / 2, 'CANCEL', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#ffffff'
    }).setOrigin(0.5, 0.5);

    // Start Button
    const startBtnBg = this.scene.add.rectangle(startBtnX, btnY, btnW, btnH, 0x10b981).setOrigin(0, 0);
    startBtnBg.setInteractive({ useHandCursor: true });
    startBtnBg.on('pointerdown', () => {
      if (this.inputElement && this.inputElement.value.trim().length > 0) {
        if (this.onStartCallback) {
          this.onStartCallback(this.inputElement.value.trim());
        }
        this.hide();
      }
    });
    const startBtnText = this.scene.add.text(startBtnX + btnW / 2, btnY + btnH / 2, 'START RUN', {
      fontSize: '12px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5, 0.5);

    this.container.add([cancelBtnBg, cancelBtnText, startBtnBg, startBtnText]);
  }

  private createDOMInput(x: number, y: number): void {
    // Only create in browser environment
    if (typeof document === 'undefined') return;

    const gameCanvas = this.scene.game.canvas;
    const rect = gameCanvas.getBoundingClientRect();

    // Scale coordinates based on actual canvas size vs internal resolution
    const scaleX = rect.width / this.scene.cameras.main.width;
    const scaleY = rect.height / this.scene.cameras.main.height;

    this.inputElement = document.createElement('input');
    this.inputElement.type = 'text';
    this.inputElement.placeholder = 'e.g. DAILY_123';
    this.inputElement.style.position = 'absolute';
    this.inputElement.style.width = `${160 * scaleX}px`;
    this.inputElement.style.height = `${24 * scaleY}px`;
    // Center it horizontally at x
    this.inputElement.style.left = `${rect.left + (x - 80) * scaleX}px`;
    this.inputElement.style.top = `${rect.top + (y - 12) * scaleY}px`;
    this.inputElement.style.fontSize = `${12 * scaleY}px`;
    this.inputElement.style.textAlign = 'center';
    this.inputElement.style.display = 'none'; // Hidden initially
    this.inputElement.style.zIndex = '10';

    // Prevent phaser keys when typing
    this.inputElement.addEventListener('keydown', (e) => e.stopPropagation());

    document.body.appendChild(this.inputElement);
  }

  public show(): void {
    if (this.isVisible) return;
    this.isVisible = true;

    if (this.inputElement) {
       // Update position in case canvas moved
       const gameCanvas = this.scene.game.canvas;
       const rect = gameCanvas.getBoundingClientRect();
       const scaleX = rect.width / this.scene.cameras.main.width;
       const scaleY = rect.height / this.scene.cameras.main.height;
       const screenWidth = this.scene.cameras.main.width;
       const screenHeight = this.scene.cameras.main.height;
       const modalW = 300;
       const modalH = 150;
       const modalX = (screenWidth - modalW) / 2;
       const modalY = (screenHeight - modalH) / 2;
       const x = modalX + modalW / 2;
       const y = modalY + 60;

       this.inputElement.style.left = `${rect.left + (x - 80) * scaleX}px`;
       this.inputElement.style.top = `${rect.top + (y - 12) * scaleY}px`;
       this.inputElement.style.width = `${160 * scaleX}px`;
       this.inputElement.style.height = `${30 * scaleY}px`;
       this.inputElement.style.fontSize = `${14 * scaleY}px`;

       this.inputElement.style.display = 'block';
       this.inputElement.value = '';
       this.inputElement.focus();
    }

    this.container.setVisible(true);
    this.container.setAlpha(0);
    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      duration: 200
    });
  }

  public hide(): void {
    if (!this.isVisible) return;
    this.isVisible = false;
    if (this.inputElement) {
      this.inputElement.style.display = 'none';
    }
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        this.container.setVisible(false);
      }
    });
  }

  public isShowing(): boolean {
    return this.isVisible;
  }
}
