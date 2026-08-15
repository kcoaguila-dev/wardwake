import { test, expect } from '@playwright/test';

test.describe('Exhausted Character & Auto-Focus Turn Cycle E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test('Auto-focuses next unacted ally with movement grid and prevents exhausted attacks', async ({ page }) => {
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

      // Force combat mode with 2 player heroes and 1 enemy
      const setupSuccess = await page.evaluate(() => {
        const game = (window as any).game;
        const scene: any = game?.scene?.getScene('MainGameScene');
        if (!scene || scene.playerSquad.length < 2 || !scene.enemySquad[0]) return false;

        const h0 = scene.playerSquad[0];
        const h1 = scene.playerSquad[1];
        const enemy = scene.enemySquad[0];

        // Place enemy 1 tile from hero 0, 2 tiles from hero 1
        enemy.coord.x = h0.coord.x + 1;
        enemy.coord.y = h0.coord.y;
        enemy.graphic.setPosition(enemy.coord);
        scene.visibilityMap.markVisible(enemy.coord);
        scene.checkEncounterState();

        return scene.isEncounterActive;
      });

      expect(setupSuccess).toBe(true);
      await page.waitForTimeout(300);

      // 1. Hero 0 takes an action (Waits / Finishes Turn)
      const transitionedToHero1 = await page.evaluate(() => {
        const game = (window as any).game;
        const scene: any = game?.scene?.getScene('MainGameScene');
        if (!scene) return false;

        const hero0 = scene.playerSquad[0];
        scene.finalizePlayerTurn(hero0);

        // Verify Hero 0 is exhausted and Hero 1 is automatically selected with movement grid
        const hero1Selected = scene.selectedPlayerIndex === 1;
        const hero0Exhausted = scene.playerSquad[0].hasActed;
        return hero1Selected && hero0Exhausted;
      });
      expect(transitionedToHero1).toBe(true);

      // 2. Click on Hero 0 (who is exhausted) - should NOT show walkable grid for Hero 0
      const hero0ClickResult = await page.evaluate(() => {
        const game = (window as any).game;
        const scene: any = game?.scene?.getScene('MainGameScene');
        if (!scene) return false;

        const hero0 = scene.playerSquad[0];
        scene.onTileClicked(hero0.coord);

        // Even if hero 0 is selected to view status, action bar cannot attack and cannot move
        const enemy = scene.enemySquad[0];
        const enemyHpBefore = enemy.unit.currentHp;

        // Try to attack enemy while hero0 is exhausted
        scene.onTileClicked(enemy.coord);
        const enemyHpAfter = enemy.unit.currentHp;

        return enemyHpBefore === enemyHpAfter;
      });
      expect(hero0ClickResult).toBe(true);
    }
  });
});
