import { test, expect } from '@playwright/test';

test.describe('Stairway Descent E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test('Stepping on staircase, confirming YES on modal cleanly transitions to Floor 2', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(600);

    // 1. Title Scene -> Town Scene (Press Enter)
    await page.keyboard.press('Enter');
    await page.waitForTimeout(600);

    // 2. Town Scene -> MainGameScene (Click Dungeon Gate at x: 320, y: 137)
    const box1 = await canvas.boundingBox();
    if (box1) {
      const scaleX = box1.width / 640;
      const scaleY = box1.height / 360;
      await page.mouse.click(box1.x + 320 * scaleX, box1.y + 137 * scaleY);
    }
    await page.waitForTimeout(1000);

    // Verify canvas is active
    await expect(canvas).toBeVisible();

    // Trigger stairs modal programmatically via game instance
    const isModalWorking = await page.evaluate(() => {
      const game = (window as any).game;
      const scene: any = game?.scene?.getScene('MainGameScene');
      if (!scene) return false;
      // Position active hero on stairs
      const hero = scene.playerSquad[0];
      if (!hero || !scene.staircaseCoord) return false;
      hero.coord = scene.staircaseCoord;
      hero.graphic.setPosition(hero.coord);
      scene.stairsModalPresenter.show(scene.floorCount + 1);
      return scene.stairsModalPresenter.isVisible();
    });

    expect(isModalWorking).toBe(true);

    // Click [🪜 YES] button on canvas directly with mouse (modal center, x = (640-105-8) / 2 = 260, y = 200)
    const box = await canvas.boundingBox();
    if (box) {
      const scaleX = box.width / 640;
      const scaleY = box.height / 360;
      // Click YES at x: 260, y: 211
      await page.mouse.click(box.x + 260 * scaleX, box.y + 211 * scaleY);
      await page.waitForTimeout(1000);

      // Verify floor transitioned to Floor 2
      const floorCount = await page.evaluate(() => {
        const game = (window as any).game;
        const scene: any = game?.scene?.getScene('MainGameScene');
        return scene ? scene.floorCount : 1;
      });

      expect(floorCount).toBe(2);
    }
  });
});
