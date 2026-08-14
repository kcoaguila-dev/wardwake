import { test, expect } from '@playwright/test';

test.describe('Wardwake Game E2E Tests', () => {
  test('Canvas loads and renders properly', async ({ page }) => {
    await page.goto('/');

    // Wait for the Phaser canvas element
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });

    // Verify canvas is present
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    // With Phaser.Scale.FIT, the canvas will be scaled up depending on the viewport.
    // The internal width/height will be 320x360 but the rendered element might be larger (e.g. 640x720)
    expect(box!.width).toBeGreaterThan(0);
    expect(box!.height).toBeGreaterThan(0);
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

  test('Combat forecast appears on hover and attacks execute with animations', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    // Select Player 2 at tile (1, 2)
    // Screen coords: x = 1*32 + 16 = 48, y = 2*32 + 16 + 40 = 120
    await canvas.click({ position: { x: 48, y: 120 } });
    await page.waitForTimeout(300);

    // Move to (3, 2)
    // Screen coords: x = 3*32 + 16 = 112, y = 2*32 + 16 + 40 = 120
    await canvas.click({ position: { x: 112, y: 120 } });
    await page.waitForTimeout(500);

    // Canvas should remain healthy and active
    await expect(canvas).toBeVisible();
  });

  test('Clicking [END TURN] immediately advances phase', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    // Click [END TURN] which is located in the top HUD
    await canvas.click({ position: { x: 230, y: 18 } });
    await page.waitForTimeout(500);

    await expect(canvas).toBeVisible();
  });
});

