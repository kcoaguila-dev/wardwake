import { test, expect } from '@playwright/test';

test.describe('Single Move Per Turn Limit E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test('Hero moves once per turn in combat mode and cannot move repeatedly on subsequent tile clicks', async ({ page }) => {
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

        // Enemy placed 1 tile right, 1 tile down so distance is 2 initially, and distance <= 2 after move
        enemy.coord.x = hero.coord.x + 1;
        enemy.coord.y = hero.coord.y + 1;
        enemy.graphic.setPosition(enemy.coord);
        scene.visibilityMap.markVisible(enemy.coord);
        scene.checkEncounterState();

        return scene.isEncounterActive && scene.selectedPlayerIndex === 0;
      });
      expect(readyForCombat).toBe(true);
      await page.waitForTimeout(300);

      // 1. Move hero to reachable move tile
      const moveResult = await page.evaluate(async () => {
        const game = (window as any).game;
        const scene: any = game?.scene?.getScene('MainGameScene');
        if (!scene) return { error: 'No scene' };

        const hero = scene.playerSquad[0];
        const obstacles = [
          ...scene.playerSquad.filter((p: any, i: number) => i !== 0 && p.unit.currentHp > 0).map((p: any) => p.coord),
          ...scene.enemySquad.filter((e: any) => e.unit.currentHp > 0).map((e: any) => e.coord)
        ];
        const validMoves = scene.getValidMovesUseCase.execute(hero.coord, 3, obstacles);
        if (!validMoves || validMoves.length === 0) return { error: 'No valid moves' };

        // Pick a reachable move that is NOT the hero's current tile and keeps enemy close
        const target = validMoves.find((m: any) => !m.equals(hero.coord) && Math.abs(m.x - scene.enemySquad[0].coord.x) + Math.abs(m.y - scene.enemySquad[0].coord.y) <= 2) || validMoves.find((m: any) => !m.equals(hero.coord));
        if (!target) return { error: 'No move target' };
        const targetObj = { x: target.x, y: target.y };
        await scene.onTileClicked(targetObj);

        return {
          heroCoord: { x: hero.coord.x, y: hero.coord.y },
          target: targetObj,
          hasMoved: hero.hasMoved,
          isEncounterActive: scene.isEncounterActive,
          selectedPlayerIndex: scene.selectedPlayerIndex
        };
      });

      expect(moveResult.heroCoord.x).toBe(moveResult.target.x);
      expect(moveResult.heroCoord.y).toBe(moveResult.target.y);
      expect(moveResult.hasMoved).toBe(true);

      // 2. Attempt to move hero again to another tile in the same turn
      const secondMoveBlocked = await page.evaluate(async () => {
        const game = (window as any).game;
        const scene: any = game?.scene?.getScene('MainGameScene');
        if (!scene) return false;

        const hero = scene.playerSquad[0];
        const currentX = hero.coord.x;
        const currentY = hero.coord.y;

        // Try to move to any adjacent tile
        const secondTarget = { x: currentX + 1, y: currentY };
        await scene.onTileClicked(secondTarget);

        // Position MUST NOT change because movement has already been spent
        return hero.coord.x === currentX && hero.coord.y === currentY;
      });
      expect(secondMoveBlocked).toBe(true);
    }
  });
});
