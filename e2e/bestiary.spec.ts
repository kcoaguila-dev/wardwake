import { test, expect } from '@playwright/test';

test.describe('Bestiary Compendium Auto-Unlock E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test('Defeating or sighting an enemy unlocks it in the Bestiary Compendium', async ({ page }) => {
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

      await page.mouse.click(box.x + 320 * scaleX, box.y + 137 * scaleY);
      await page.waitForTimeout(1000);

      // Verify that defeating or sighting enemy unlocks in localStorage
      const bestiaryList = await page.evaluate(() => {
        const game = (window as any).game;
        const scene: any = game?.scene?.getScene('MainGameScene');
        if (!scene) return [];

        if (scene.enemySquad[0]) {
          const enemy = scene.enemySquad[0];
          // Execute lethal strike (roll 0.0 guarantees hit)
          scene.attackUnitUseCase.execute(scene.playerSquad[0].unit, enemy.unit, 0.0, 0.0);
        }
        const raw = localStorage.getItem('wardwake_bestiary');
        return raw ? JSON.parse(raw) : [];
      });

      expect(Array.isArray(bestiaryList)).toBe(true);
      expect(bestiaryList.length).toBeGreaterThan(0);

      // Open Settings Modal -> Bestiary
      const isBestiaryVisible = await page.evaluate(() => {
        const game = (window as any).game;
        const scene: any = game?.scene?.getScene('MainGameScene');
        if (!scene) return false;
        scene.settingsModalPresenter.bestiaryModal.show();
        return scene.settingsModalPresenter.bestiaryModal.isVisible();
      });
      expect(isBestiaryVisible).toBe(true);
      await page.waitForTimeout(300);

      // Assert unlocked count
      const unlockedIds = await page.evaluate(() => {
        const raw = localStorage.getItem('wardwake_bestiary');
        return raw ? JSON.parse(raw) : [];
      });
      expect(unlockedIds.length).toBeGreaterThan(0);
    }
  });
});
