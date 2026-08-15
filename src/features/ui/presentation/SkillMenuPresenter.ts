import * as Phaser from 'phaser';
import { Unit } from '../../combat/domain/Unit';
import skillsData from '../../../data/skills.json';

export interface SkillDefinition {
  id: string;
  name: string;
  cost: number;
  description: string;
  heroId: string;
}

export class SkillMenuPresenter {
  private baseElements: (Phaser.GameObjects.Rectangle | Phaser.GameObjects.Text)[] = [];
  private backdrop: Phaser.GameObjects.Rectangle;
  private bg: Phaser.GameObjects.Rectangle;
  private titleText: Phaser.GameObjects.Text;
  private spText: Phaser.GameObjects.Text;
  private closeBtnBg: Phaser.GameObjects.Rectangle;
  private closeBtnText: Phaser.GameObjects.Text;
  private skillGameObjects: (Phaser.GameObjects.Rectangle | Phaser.GameObjects.Text)[] = [];

  private visible: boolean = false;
  public onSelectSkill?: (skillId: string) => void;
  public onClose?: () => void;

  constructor(private scene: Phaser.Scene) {
    const screenWidth = this.scene.scale.width || 640;
    const screenHeight = this.scene.scale.height || 360;
    const width = 280;
    const height = 240;
    const modalX = (screenWidth - width) / 2;
    const modalY = (screenHeight - height) / 2;

    // 1. Full-screen backdrop shield (Depth 240)
    this.backdrop = this.scene.add.rectangle(0, 0, screenWidth, screenHeight, 0x000000, 0.7)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(240)
      .setInteractive();

    this.backdrop.on('pointerdown', (_pointer: Phaser.Input.Pointer, _lx: number, _ly: number, event: any) => {
      if (event && event.stopPropagation) event.stopPropagation();
      this.hide();
      if (this.onClose) this.onClose();
    });

    // 2. Modal Background Window (Depth 241)
    this.bg = this.scene.add.rectangle(modalX, modalY, width, height, 0x0f172a, 0.98)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(241)
      .setStrokeStyle(2, 0xa855f7) // Purple border for skills
      .setInteractive();

    // 3. Title (Depth 242)
    this.titleText = this.scene.add.text(modalX + 16, modalY + 16, '✨ COMBAT SKILLS', {
      fontSize: '13px',
      fontFamily: 'monospace',
      color: '#c084fc',
      fontStyle: 'bold'
    }).setScrollFactor(0).setDepth(242);

    // SP Pool Indicator
    this.spText = this.scene.add.text(modalX + 160, modalY + 18, 'SP: 20/20', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#a855f7',
      fontStyle: 'bold'
    }).setScrollFactor(0).setDepth(242);

    // 4. Dedicated Close Button (Depth 243-244)
    const closeX = modalX + width - 20;
    const closeY = modalY + 20;
    this.closeBtnBg = this.scene.add.rectangle(closeX, closeY, 26, 26, 0x1e293b)
      .setScrollFactor(0)
      .setDepth(243)
      .setStrokeStyle(1.5, 0xef4444)
      .setInteractive({ useHandCursor: true });

    this.closeBtnText = this.scene.add.text(closeX, closeY, '✖', {
      fontSize: '13px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#f87171'
    }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(244).setInteractive({ useHandCursor: true });

    const triggerClose = (_pointer?: Phaser.Input.Pointer, _lx?: number, _ly?: number, event?: any) => {
      if (event && event.stopPropagation) event.stopPropagation();
      this.hide();
      if (this.onClose) this.onClose();
    };

    this.closeBtnBg.on('pointerdown', triggerClose);
    this.closeBtnText.on('pointerdown', triggerClose);
    this.closeBtnBg.on('pointerover', () => this.closeBtnBg.setFillStyle(0x7f1d1d));
    this.closeBtnBg.on('pointerout', () => this.closeBtnBg.setFillStyle(0x1e293b));

    this.baseElements = [this.backdrop, this.bg, this.titleText, this.spText, this.closeBtnBg, this.closeBtnText];

    // Hide by default
    this.setVisible(false);

    // Keyboard shortcut to close
    this.scene.input.keyboard?.on('keydown-ESC', () => {
      if (this.visible) {
        this.hide();
        if (this.onClose) this.onClose();
      }
    });
  }

  private setVisible(state: boolean): void {
    this.visible = state;
    this.baseElements.forEach(el => el.setVisible(state));
    this.skillGameObjects.forEach(el => el.setVisible(state));
  }

  public show(unit: Unit): void {
    // Clear previous skill rows
    this.skillGameObjects.forEach(obj => obj.destroy());
    this.skillGameObjects = [];

    const screenWidth = this.scene.scale.width || 640;
    const screenHeight = this.scene.scale.height || 360;
    const width = 280;
    const modalX = (screenWidth - width) / 2;
    const modalY = (screenHeight - 240) / 2;
    const startY = 46;

    this.spText.setText(`SP: ${unit.currentSp}/${unit.maxSp}`);

    // Filter skills matching unit
    const unitSkills = (skillsData as SkillDefinition[]).filter(s => {
      if (unit.name.includes('Sword')) return s.heroId === 'hero_sword_fighter';
      if (unit.name.includes('Lance')) return s.heroId === 'hero_lance_knight';
      return false;
    });

    if (unitSkills.length === 0) {
      const emptyText = this.scene.add.text(modalX + width / 2, modalY + startY + 40, '(No skills available)', {
        fontSize: '11px',
        fontFamily: 'monospace',
        color: '#64748b'
      }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(242);
      this.skillGameObjects.push(emptyText);
    } else {
      unitSkills.forEach((skill, index) => {
        const canAfford = unit.currentSp >= skill.cost;
        const btnX = modalX + 12;
        const btnY = modalY + startY + (index * 68);
        const btnW = width - 24;
        const btnH = 58;

        const btnBg = this.scene.add.rectangle(btnX, btnY, btnW, btnH, canAfford ? 0x1e1b4b : 0x18181b)
          .setOrigin(0, 0)
          .setScrollFactor(0)
          .setDepth(243)
          .setStrokeStyle(1.5, canAfford ? 0x9333ea : 0x3f3f46)
          .setInteractive({ useHandCursor: canAfford });

        // Skill Name & Cost
        let icon = '⚡';
        if (skill.id === 'spin_slash') icon = '🌀';
        else if (skill.id === 'iron_bulwark') icon = '🛡️';
        else if (skill.id === 'pierce_thrust') icon = '🔱';

        const nameText = this.scene.add.text(btnX + 8, btnY + 7, `${icon} ${skill.name}`, {
          fontSize: '12px',
          fontFamily: 'monospace',
          fontStyle: 'bold',
          color: canAfford ? '#ffffff' : '#71717a'
        }).setScrollFactor(0).setDepth(244).setInteractive({ useHandCursor: canAfford });

        const costText = this.scene.add.text(btnX + btnW - 10, btnY + 7, `${skill.cost} SP`, {
          fontSize: '11px',
          fontFamily: 'monospace',
          fontStyle: 'bold',
          color: canAfford ? '#c084fc' : '#52525b'
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(244);

        // Description
        const descText = this.scene.add.text(btnX + 8, btnY + 26, skill.description, {
          fontSize: '9.5px',
          fontFamily: 'monospace',
          color: canAfford ? '#cbd5e1' : '#52525b',
          wordWrap: { width: btnW - 16 }
        }).setScrollFactor(0).setDepth(244);

        const selectSkill = (_pointer?: Phaser.Input.Pointer, _lx?: number, _ly?: number, event?: any) => {
          if (event && event.stopPropagation) event.stopPropagation();
          if (canAfford && this.visible && this.onSelectSkill) {
            this.hide();
            this.onSelectSkill(skill.id);
          }
        };

        if (canAfford) {
          btnBg.on('pointerdown', selectSkill);
          nameText.on('pointerdown', selectSkill);
          btnBg.on('pointerover', () => btnBg.setFillStyle(0x312e81));
          btnBg.on('pointerout', () => btnBg.setFillStyle(0x1e1b4b));
        }

        this.skillGameObjects.push(btnBg, nameText, costText, descText);
      });
    }

    this.setVisible(true);
  }

  public hide(): void {
    this.setVisible(false);
  }

  public isVisible(): boolean {
    return this.visible;
  }

  public destroy(): void {
    this.baseElements.forEach(el => el.destroy());
    this.skillGameObjects.forEach(el => el.destroy());
    this.baseElements = [];
    this.skillGameObjects = [];
  }
}
