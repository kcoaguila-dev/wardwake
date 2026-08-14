import { GamepadInputService } from '../../../src/features/ui/infrastructure/GamepadInputService';

describe('GamepadInputService', () => {
  let actionsReceived: string[];
  let service: GamepadInputService;

  beforeEach(() => {
    actionsReceived = [];
    service = new GamepadInputService((action) => actionsReceived.push(action));

    // Mock navigator.getGamepads
    Object.defineProperty(global, 'navigator', {
      value: {
        getGamepads: jest.fn()
      },
      writable: true,
      configurable: true
    });
  });

  const createMockGamepad = (buttonsPressed: number[], axesValues: number[]) => {
    const buttons = Array(20).fill(null).map((_, i) => ({ pressed: buttonsPressed.includes(i) }));
    return {
      buttons,
      axes: axesValues
    } as any as Gamepad;
  };

  it('detects button A press', () => {
    (global.navigator.getGamepads as jest.Mock).mockReturnValue([createMockGamepad([0], [0, 0])]);
    service.update(100);
    expect(actionsReceived).toEqual(['A']);
  });

  it('detects button B press and release', () => {
    (global.navigator.getGamepads as jest.Mock).mockReturnValue([createMockGamepad([1], [0, 0])]);
    service.update(100);
    expect(actionsReceived).toEqual(['B']);

    // Release
    (global.navigator.getGamepads as jest.Mock).mockReturnValue([createMockGamepad([], [0, 0])]);
    service.update(150);
    expect(actionsReceived).toEqual(['B']); // No new action

    // Press again
    (global.navigator.getGamepads as jest.Mock).mockReturnValue([createMockGamepad([1], [0, 0])]);
    service.update(200);
    expect(actionsReceived).toEqual(['B', 'B']);
  });

  it('detects D-Pad UP press (button 12)', () => {
    (global.navigator.getGamepads as jest.Mock).mockReturnValue([createMockGamepad([12], [0, 0])]);
    service.update(100);
    expect(actionsReceived).toEqual(['UP']);
  });

  it('detects Left Stick LEFT (axis 0)', () => {
    (global.navigator.getGamepads as jest.Mock).mockReturnValue([createMockGamepad([], [-0.8, 0])]);
    service.update(100);
    expect(actionsReceived).toEqual(['LEFT']);
  });

  it('detects repeat for directional inputs', () => {
    (global.navigator.getGamepads as jest.Mock).mockReturnValue([createMockGamepad([12], [0, 0])]);

    service.update(100); // Initial press
    expect(actionsReceived).toEqual(['UP']);

    service.update(300); // Before initial repeat delay (100 + 300 = 400 needed)
    expect(actionsReceived).toEqual(['UP']);

    service.update(450); // After initial repeat delay
    expect(actionsReceived).toEqual(['UP', 'UP']);

    service.update(550); // Before next repeat interval (450 + 150 = 600 needed)
    expect(actionsReceived).toEqual(['UP', 'UP']);

    service.update(650); // After next repeat interval
    expect(actionsReceived).toEqual(['UP', 'UP', 'UP']);
  });

  it('does not repeat action buttons (e.g. A)', () => {
    (global.navigator.getGamepads as jest.Mock).mockReturnValue([createMockGamepad([0], [0, 0])]);

    service.update(100); // Initial press
    expect(actionsReceived).toEqual(['A']);

    service.update(1000); // Hold for a long time
    expect(actionsReceived).toEqual(['A']);
  });
});
