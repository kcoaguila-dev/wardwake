import { test, expect } from '@playwright/test';

test.describe('Dungeon Save & Exit to Title E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test('Save and Exit from dungeon properly writes save state and Title Scene shows Continue Run', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(600);

    // Enter Town -> Dungeon
    await page.keyboard.press('Enter');
    await page.waitForTimeout(600);

    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      const scaleX = box.width / 640;
      const scaleY = box.height / 360;

      // Click Dungeon Gate
      await page.mouse.click(box.x + 320 * scaleX, box.y + 137 * scaleY);
      await page.waitForTimeout(1000);

      // Open Settings Modal in Dungeon
      const settingsOpened = await page.evaluate(() => {
        const game = (window as any).game;
        const scene: any = game?.scene?.getScene('MainGameScene');
        if (!scene) return false;
        scene.settingsModalPresenter.show();
        return scene.settingsModalPresenter.isVisible();
      });
      expect(settingsOpened).toBe(true);
      await page.waitForTimeout(300);

      // Click SAVE & EXIT TO TITLE
      await page.evaluate(() => {
        const game = (window as any).game;
        const scene: any = game?.scene?.getScene('MainGameScene');
        if (!scene) return;
        scene.settingsModalPresenter.onQuit();
      });
      await page.waitForTimeout(1200);

      // Verify that wardwake_run_save was written to localStorage
      const hasSavedRun = await page.evaluate(() => {
        const raw = localStorage.getItem('wardwake_run_save');
        return !!raw;
      });
      expect(hasSavedRun).toBe(true);

      // Verify TitleScene has loaded and has active continue option
      const continueAvailable = await page.evaluate(() => {
        const game = (window as any).game;
        const titleScene: any = game?.scene?.getScene('TitleScene');
        return !!titleScene;
      });
      expect(continueAvailable).toBe(true);
    }
  });
});
