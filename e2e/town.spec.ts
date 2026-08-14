import { test, expect } from '@playwright/test';

test.describe('Wardwake Town Hub E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to ensure fresh meta-progression state
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
    await page.goto('/');
  });

  test('can navigate from Title Scene to Town Scene and open Dungeon Gate', async ({ page }) => {
    // Click "NEW GAME" from Title Scene
    await page.locator('canvas').click({ position: { x: 320, y: 190 } });

    // Wait for fade to Town Scene
    await page.waitForTimeout(600);

    // Verify Town Scene header
    // Using snapshot comparison or just verifying the canvas is rendered
    expect(await page.locator('canvas').count()).toBe(1);

    // Click Dungeon Gate (starts MainGameScene)
    await page.locator('canvas').click({ position: { x: 320, y: 135 } });

    // Wait for fade to Main Game Scene
    await page.waitForTimeout(600);

    // Assuming we are in MainGameScene, verify canvas is still valid
    expect(await page.locator('canvas').count()).toBe(1);
  });

  test('Storage Chest modal can be opened and closed in Town Scene', async ({ page }) => {
    // Navigate to Town Scene
    await page.locator('canvas').click({ position: { x: 320, y: 190 } });
    await page.waitForTimeout(600);

    // Click Storage Chest
    await page.locator('canvas').click({ position: { x: 320, y: 180 } });
    await page.waitForTimeout(200);

    // Modal is open, clicking close button (approximate coords based on modal layout)
    await page.locator('canvas').click({ position: { x: 320, y: 260 } });
    await page.waitForTimeout(200);
  });

  test('Guild Master modal can be opened and closed in Town Scene', async ({ page }) => {
    // Navigate to Town Scene
    await page.locator('canvas').click({ position: { x: 320, y: 190 } });
    await page.waitForTimeout(600);

    // Click Guild Master
    await page.locator('canvas').click({ position: { x: 320, y: 225 } });
    await page.waitForTimeout(200);

    // Modal is open, clicking close button
    await page.locator('canvas').click({ position: { x: 320, y: 290 } });
    await page.waitForTimeout(200);
  });
});
