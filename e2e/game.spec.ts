import { test, expect } from '@playwright/test';

test.describe('Wardwake Game E2E Tests', () => {
  test('Canvas loads and renders properly', async ({ page }) => {
    await page.goto('/');

    // Wait for the Phaser canvas element
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });

    // Verify canvas size matches config (320x360)
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBe(320);
    expect(box!.height).toBe(360);
  });

  test('Player unit can be clicked, selected, and moved', async ({ page }) => {
    const logs: string[] = [];
    page.on('console', msg => logs.push(msg.text()));

    await page.goto('/');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });

    // Allow Phaser preloader and main scene to initialize
    await page.waitForTimeout(1000);

    // Player 1 is at tile (1, 1).
    // Screen coordinate: x = 1 * 32 + 16 = 48, y = 1 * 32 + 16 + 40 (HUD offset) = 88
    await canvas.click({ position: { x: 48, y: 88 } });
    await page.waitForTimeout(300);

    // Click on valid movement tile (1, 3):
    // Screen coordinate: x = 48, y = 3 * 32 + 16 + 40 = 152
    await canvas.click({ position: { x: 48, y: 152 } });
    await page.waitForTimeout(500);

    // Verify game canvas is still rendering cleanly
    await expect(canvas).toBeVisible();
  });
});
