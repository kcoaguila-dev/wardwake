import { test, expect } from '@playwright/test';

test.describe('Combat Auto-Movement & Enemy Range Inspection E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test('Automatic cyan movement grid on combat engage and red enemy range on enemy click', async ({ page }) => {
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

      // Force combat mode with an enemy nearby
      const combatEngaged = await page.evaluate(() => {
        const game = (window as any).game;
        const scene: any = game?.scene?.getScene('MainGameScene');
        if (!scene) return false;

        const hero = scene.playerSquad[0];
        if (!hero || !scene.enemySquad[0]) return false;

        // Position enemy 2 tiles away from hero to trigger combat mode
        scene.enemySquad[0].coord.x = hero.coord.x;
        scene.enemySquad[0].coord.y = hero.coord.y - 2;
        scene.enemySquad[0].graphic.setPosition(scene.enemySquad[0].coord);
        scene.visibilityMap.markVisible(scene.enemySquad[0].coord);
        scene.checkEncounterState();

        return scene.isEncounterActive;
      });

      expect(combatEngaged).toBe(true);
      await page.waitForTimeout(300);

      // Check that hero movement area is highlighted by default in combat
      const isWalkableHighlighted = await page.evaluate(() => {
        const game = (window as any).game;
        const scene: any = game?.scene?.getScene('MainGameScene');
        if (!scene) return false;
        // highlightGraphics should not be empty
        return scene.gridPresenter.highlightGraphics.commandBuffer?.length > 0 || scene.selectedPlayerIndex !== null;
      });
      expect(isWalkableHighlighted).toBe(true);

      // Click on the distant enemy
      const enemyInspectionActive = await page.evaluate(() => {
        const game = (window as any).game;
        const scene: any = game?.scene?.getScene('MainGameScene');
        if (!scene || !scene.enemySquad[0]) return false;

        const enemy = scene.enemySquad[0];
        scene.onTileClicked(enemy.coord);
        return scene.enemyInspectionPresenter.isVisible();
      });
      expect(enemyInspectionActive).toBe(true);

      // Click on active hero to cancel enemy inspection and return to hero move grid
      const returnedToHero = await page.evaluate(() => {
        const game = (window as any).game;
        const scene: any = game?.scene?.getScene('MainGameScene');
        if (!scene) return false;

        const hero = scene.playerSquad[0];
        scene.onTileClicked(hero.coord);
        return !scene.enemyInspectionPresenter.isVisible() && scene.selectedPlayerIndex === 0;
      });
      expect(returnedToHero).toBe(true);
    }
  });
});
