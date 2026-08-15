import { test, expect } from '@playwright/test';

test.describe('Audio BGM Integration', () => {
  test('entering dungeon starts exploration BGM and resumes AudioContext', async ({ page }) => {
    await page.goto('/');

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 15000 });

    // Wait for the game and scene to initialize completely
    await page.waitForFunction(() => {
      const game = (window as any).game;
      return game && game.scene && game.scene.getScene('TownScene');
    });

    // Check audio context initially
    const initialAudioState = await page.evaluate(() => {
        const game = (window as any).game;
        const townScene = game?.scene?.getScene('TownScene');
        if (!townScene) return null;
        return townScene.audioService?.ctx?.state;
    });

    // We can't guarantee AudioContext exists or is initialized until interaction on some browsers

    // Enter Town -> Dungeon by pressing Enter (triggering user interaction)
    await page.keyboard.press('Enter');
    await page.waitForTimeout(600);

    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      const scaleX = box.width / 640;
      const scaleY = box.height / 360;

      // Click Dungeon Gate to enter MainGameScene (another user interaction)
      await page.mouse.click(box.x + 320 * scaleX, box.y + 137 * scaleY);
      await page.waitForTimeout(1000);

      // Verify BGM state in MainGameScene
      const bgmState = await page.evaluate(() => {
        const game = (window as any).game;
        const scene: any = game?.scene?.getScene('MainGameScene');
        if (!scene || !scene.audioService) return null;

        const service = scene.audioService;
        return {
          contextState: service.ctx?.state,
          currentMode: service.currentBgmMode,
          hasInterval: service.bgmIntervalId !== null
        };
      });

      expect(bgmState).not.toBeNull();
      expect(bgmState?.contextState).toBe('running');
      expect(bgmState?.currentMode).toBe('explore');
      expect(bgmState?.hasInterval).toBe(true);
    }
  });
});
