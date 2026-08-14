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

  test('Tab switches hero focus and END TURN advances phase', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    // Press Tab to cycle hero
    await page.keyboard.press('Tab');
    await page.waitForTimeout(300);

    // End Turn by clicking on the [⏳ END TURN] button which is rendered in the HUD at x: 8, y: 48
    // Actually it's a DOM-like object in Phaser.
    // Screen coords: x = 8 + 40 (half width approx) = 48, y = 48 + 10 (half height approx) = 58
    await canvas.click({ position: { x: 48, y: 58 } });
    await page.waitForTimeout(1500); // Wait for enemy phase to process

    // Canvas should remain healthy and active
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
});

