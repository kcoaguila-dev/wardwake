export type GamepadAction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'A' | 'B' | 'X' | 'Y' | 'LB' | 'RB';

export class GamepadInputService {
  private lastButtonStates: Record<number, Record<number, boolean>> = {};
  private lastAxisStates: Record<number, Record<number, boolean>> = {};
  private activeRepeaters: Record<string, { nextTime: number; isInitial: boolean }> = {};

  private readonly axisThreshold = 0.5;
  private readonly initialRepeatDelay = 300;
  private readonly repeatInterval = 150;

  constructor(private onAction: (action: GamepadAction) => void) {}

  public isActionPressed(action: GamepadAction): boolean {
    const gamepads = typeof navigator !== 'undefined' && navigator.getGamepads ? navigator.getGamepads() : [];
    for (let i = 0; i < gamepads.length; i++) {
      const gp = gamepads[i];
      if (!gp) continue;

      if (action === 'B' && gp.buttons[1]?.pressed) return true;
      if (action === 'UP' && (gp.buttons[12]?.pressed || (gp.axes[1] !== undefined && gp.axes[1] < -this.axisThreshold))) return true;
      if (action === 'DOWN' && (gp.buttons[13]?.pressed || (gp.axes[1] !== undefined && gp.axes[1] > this.axisThreshold))) return true;
      if (action === 'LEFT' && (gp.buttons[14]?.pressed || (gp.axes[0] !== undefined && gp.axes[0] < -this.axisThreshold))) return true;
      if (action === 'RIGHT' && (gp.buttons[15]?.pressed || (gp.axes[0] !== undefined && gp.axes[0] > this.axisThreshold))) return true;
    }
    return false;
  }

  public update(time: number): void {
    const gamepads = typeof navigator !== 'undefined' && navigator.getGamepads ? navigator.getGamepads() : [];

    for (let i = 0; i < gamepads.length; i++) {
      const gp = gamepads[i];
      if (!gp) continue;

      this.lastButtonStates[i] = this.lastButtonStates[i] || {};
      this.lastAxisStates[i] = this.lastAxisStates[i] || {};

      this.checkButton(time, i, gp, 12, 'UP', true);
      this.checkButton(time, i, gp, 13, 'DOWN', true);
      this.checkButton(time, i, gp, 14, 'LEFT', true);
      this.checkButton(time, i, gp, 15, 'RIGHT', true);

      this.checkButton(time, i, gp, 0, 'A', false);
      this.checkButton(time, i, gp, 1, 'B', false);
      this.checkButton(time, i, gp, 2, 'X', false);
      this.checkButton(time, i, gp, 3, 'Y', false);
      this.checkButton(time, i, gp, 4, 'LB', false);
      this.checkButton(time, i, gp, 5, 'RB', false);

      this.checkAxis(time, i, gp, 1, -1, 'UP');
      this.checkAxis(time, i, gp, 1, 1, 'DOWN');
      this.checkAxis(time, i, gp, 0, -1, 'LEFT');
      this.checkAxis(time, i, gp, 0, 1, 'RIGHT');
    }
  }

  private checkButton(time: number, padIndex: number, gp: Gamepad, buttonIndex: number, action: GamepadAction, repeatable: boolean): void {
    if (gp.buttons.length <= buttonIndex) return;

    const pressed = gp.buttons[buttonIndex]?.pressed ?? false;
    const wasPressed = this.lastButtonStates[padIndex]![buttonIndex] ?? false;
    const key = `${padIndex}-btn-${buttonIndex}`;

    this.processInput(time, pressed, wasPressed, key, action, repeatable);
    this.lastButtonStates[padIndex]![buttonIndex] = pressed;
  }

  private checkAxis(time: number, padIndex: number, gp: Gamepad, axisIndex: number, direction: number, action: GamepadAction): void {
    if (gp.axes.length <= axisIndex) return;

    const value = gp.axes[axisIndex];
    if (value === undefined) return;

    const isActive = direction < 0 ? value < -this.axisThreshold : value > this.axisThreshold;

    const virtualIndex = 100 + axisIndex * 2 + (direction > 0 ? 1 : 0);
    const wasActive = this.lastAxisStates[padIndex]![virtualIndex] ?? false;
    const key = `${padIndex}-axis-${virtualIndex}`;

    this.processInput(time, isActive, wasActive, key, action, true);
    this.lastAxisStates[padIndex]![virtualIndex] = isActive;
  }

  private processInput(time: number, isActive: boolean, wasActive: boolean, key: string, action: GamepadAction, repeatable: boolean): void {
    if (isActive && !wasActive) {
      this.onAction(action);
      if (repeatable) {
        this.activeRepeaters[key] = { nextTime: time + this.initialRepeatDelay, isInitial: true };
      }
    } else if (isActive && wasActive && repeatable && this.activeRepeaters[key]) {
      if (time >= this.activeRepeaters[key].nextTime) {
        this.onAction(action);
        this.activeRepeaters[key] = { nextTime: time + this.repeatInterval, isInitial: false };
      }
    } else if (!isActive && wasActive) {
      delete this.activeRepeaters[key];
    }
  }
}
