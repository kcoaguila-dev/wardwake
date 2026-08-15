import { test, expect } from '@playwright/test';

test.describe('First-Click Direct Movement & Actions E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test('Reachable movement grid executes movement on first click in combat mode', async ({ page }) => {
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

      // Force combat mode
      const readyForCombat = await page.evaluate(() => {
        const game = (window as any).game;
        const scene: any = game?.scene?.getScene('MainGameScene');
        if (!scene || !scene.enemySquad[0]) return false;

        const hero = scene.playerSquad[0];
        const enemy = scene.enemySquad[0];

        // Enemy placed 2 tiles away to engage combat
        enemy.coord.x = hero.coord.x;
        enemy.coord.y = hero.coord.y - 2;
        enemy.graphic.setPosition(enemy.coord);
        scene.visibilityMap.markVisible(enemy.coord);
        scene.checkEncounterState();

        return scene.isEncounterActive && scene.selectedPlayerIndex === 0;
      });
      expect(readyForCombat).toBe(true);
      await page.waitForTimeout(300);

      // Test FIRST CLICK on reachable tile
      const moveExecuted = await page.evaluate(async () => {
        const game = (window as any).game;
        const scene: any = game?.scene?.getScene('MainGameScene');
        if (!scene) return false;

        const hero = scene.playerSquad[0];
        const startX = hero.coord.x;
        const startY = hero.coord.y;

        // Click tile (startX + 1, startY) if walkable
        const targetCoord = { x: startX + 1, y: startY };
        await scene.onTileClicked(targetCoord);

        // Verify hero moved to new tile on first click
        return hero.coord.x === startX + 1 && hero.coord.y === startY;
      });
      expect(moveExecuted).toBe(true);
    }
  });
});
