import { test, expect } from '@playwright/test';

test.describe('Skill Menu & Skill Casting E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test('Clicking SKILL on Action Dock opens Skill Modal, lists skills with SP, and close button works', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(600);

    // 1. Title -> Town
    await page.keyboard.press('Enter');
    await page.waitForTimeout(600);

    // 2. Town -> Dungeon (Click Dungeon Gate at x: 320, y: 137)
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      const scaleX = box.width / 640;
      const scaleY = box.height / 360;

      await page.mouse.click(box.x + 320 * scaleX, box.y + 137 * scaleY);
      await page.waitForTimeout(1000);

      // 3. Click [✨ SKILL] button on the Action Bar (x = 320 - 44 = 276, y = 295)
      await page.mouse.click(box.x + 276 * scaleX, box.y + 295 * scaleY);
      await page.waitForTimeout(400);

      // 4. Assert Skill Modal is open
      const isOpen = await page.evaluate(() => {
        const game = (window as any).game;
        const scene: any = game?.scene?.getScene('MainGameScene');
        return scene ? scene.skillMenuPresenter.isVisible() : false;
      });
      expect(isOpen).toBe(true);

      // 5. Click [✖] Close button on Skill Modal (modalX = (640-280)/2 = 180, closeX = 180 + 280 - 20 = 440, closeY = (360-240)/2 + 20 = 80)
      await page.mouse.click(box.x + 440 * scaleX, box.y + 80 * scaleY);
      await page.waitForTimeout(400);

      // 6. Assert Skill Modal is closed
      const isClosed = await page.evaluate(() => {
        const game = (window as any).game;
        const scene: any = game?.scene?.getScene('MainGameScene');
        return scene ? scene.skillMenuPresenter.isVisible() : false;
      });
      expect(isClosed).toBe(false);

      // 7. Re-open and cast Spin Slash (click skill row at x: 320, y: 135)
      await page.mouse.click(box.x + 276 * scaleX, box.y + 295 * scaleY);
      await page.waitForTimeout(400);
      await page.mouse.click(box.x + 320 * scaleX, box.y + 135 * scaleY);
      await page.waitForTimeout(500);

      // 8. Assert SP decreased from 20 to 14 (Spin Slash costs 6 SP)
      const currentSp = await page.evaluate(() => {
        const game = (window as any).game;
        const scene: any = game?.scene?.getScene('MainGameScene');
        return scene ? scene.playerSquad[0].unit.currentSp : 20;
      });
      expect(currentSp).toBe(14);
    }
  });
});
