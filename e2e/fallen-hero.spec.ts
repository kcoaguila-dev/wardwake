import { test, expect } from '@playwright/test';

test.describe('Fallen Hero & Floor Transition Persistence E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test('Fallen companion stays hidden and does not render ghost sprite on subsequent floor', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(600);

    // 1. Enter Town -> Dungeon
    await page.keyboard.press('Enter');
    await page.waitForTimeout(600);

    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      const scaleX = box.width / 640;
      const scaleY = box.height / 360;

      await page.mouse.click(box.x + 320 * scaleX, box.y + 137 * scaleY);
      await page.waitForTimeout(1000);

      // Simulate companion falling to 0 HP on Floor 1
      const isSetup = await page.evaluate(() => {
        const game = (window as any).game;
        const scene: any = game?.scene?.getScene('MainGameScene');
        if (!scene || !scene.playerSquad[1]) return false;

        // Knock out companion (Hero 1)
        scene.playerSquad[1].unit.currentHp = 0;
        scene.playerSquad[1].graphic.clear();

        // Advance to Floor 2
        scene.startFloor(2);
        return true;
      });
      expect(isSetup).toBe(true);
      await page.waitForTimeout(500);

      // Assert that Fallen Companion is NOT visible on Floor 2!
      const status = await page.evaluate(() => {
        const game = (window as any).game;
        const scene: any = game?.scene?.getScene('MainGameScene');
        if (!scene) return null;

        const p1Alive = scene.playerSquad[0].unit.currentHp > 0;
        const p1Visible = scene.playerSquad[0].graphic.container.visible;

        const p2Dead = scene.playerSquad[1].unit.currentHp <= 0;
        const p2Visible = scene.playerSquad[1].graphic.container.visible;

        return { p1Alive, p1Visible, p2Dead, p2Visible, selectedLeader: scene.selectedPlayerIndex };
      });

      expect(status).not.toBeNull();
      if (status) {
        expect(status.p1Alive).toBe(true);
        expect(status.p1Visible).toBe(true);
        expect(status.p2Dead).toBe(true);
        expect(status.p2Visible).toBe(false); // Fallen companion container MUST BE HIDDEN
        expect(status.selectedLeader).toBe(0); // Alive hero is leader
      }
    }
  });
});
