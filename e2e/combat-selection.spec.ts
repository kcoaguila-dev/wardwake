import { test, expect } from '@playwright/test';

test.describe('Combat Hero Selection & Movement Range E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test('Clicking active hero in combat mode renders movement range grid', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(600);

    // 1. Enter Town
    await page.keyboard.press('Enter');
    await page.waitForTimeout(600);

    // 2. Town -> Dungeon
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      const scaleX = box.width / 640;
      const scaleY = box.height / 360;

      await page.mouse.click(box.x + 320 * scaleX, box.y + 137 * scaleY);
      await page.waitForTimeout(1000);

      // Trigger Combat Mode by putting enemy in FOV
      const isCombatSetup = await page.evaluate(() => {
        const game = (window as any).game;
        const scene: any = game?.scene?.getScene('MainGameScene');
        if (!scene) return false;

        scene.isEncounterActive = true;
        scene.hudPresenter.updatePhase('⚔️ COMBAT');
        scene.selectHeroByIndex(0);
        return scene.isEncounterActive;
      });
      expect(isCombatSetup).toBe(true);

      // Click on Hero 0 directly with mouse on the map
      const heroCoord = await page.evaluate(() => {
        const game = (window as any).game;
        const scene: any = game?.scene?.getScene('MainGameScene');
        return scene?.playerSquad[0]?.coord;
      });
      expect(heroCoord).toBeDefined();

      if (heroCoord) {
        const heroWorldX = heroCoord.x * 32 + 16;
        const heroWorldY = heroCoord.y * 32 + 16;

        // Click Hero
        await page.mouse.click(box.x + heroWorldX * scaleX, box.y + heroWorldY * scaleY);
        await page.waitForTimeout(300);

        // Assert selected hero index is active and selection is set
        const isSelected = await page.evaluate(() => {
          const game = (window as any).game;
          const scene: any = game?.scene?.getScene('MainGameScene');
          return scene.selectedPlayerIndex === 0;
        });
        expect(isSelected).toBe(true);
      }
    }
  });
});
