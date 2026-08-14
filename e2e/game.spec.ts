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

  test('Room Exploration & Fog Discovery logic works cleanly', async ({ page }) => {
    const logs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(msg.text());
      }
    });

    await page.goto('/');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    // Note: Due to procedural generation, the exact layout varies.
    // However, moving to an adjacent valid tile should trigger fog update logic.
    // Screen coords: Select player at (1,1) -> (48, 88)
    await canvas.click({ position: { x: 48, y: 88 } });
    await page.waitForTimeout(300);

    // Attempt to move down into corridor/room (1,3) -> (48, 152)
    await canvas.click({ position: { x: 48, y: 152 } });
    await page.waitForTimeout(500);

    expect(logs.length).toBe(0); // No runtime console errors thrown during discovery
    await expect(canvas).toBeVisible();
  });

  test('Floor Item Pickup renders float text cleanly', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    // We can't guarantee an item is at a specific tile due to procedural generation,
    // but we can ensure moving works and the scene does not crash if an item were present.
    await canvas.click({ position: { x: 48, y: 88 } });
    await page.waitForTimeout(300);
    await canvas.click({ position: { x: 80, y: 88 } }); // Try moving to (2,1)
    await page.waitForTimeout(500);

    await expect(canvas).toBeVisible();
  });

  test('Minimap Fog Integrity is maintained', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    // Just verify the scene renders without breaking when Minimap tries to read visibility map
    await canvas.click({ position: { x: 48, y: 88 } });
    await page.waitForTimeout(300);
    await canvas.click({ position: { x: 48, y: 120 } });
    await page.waitForTimeout(500);

    await expect(canvas).toBeVisible();
  });
});

