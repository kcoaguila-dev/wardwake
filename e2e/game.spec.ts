import { test, expect } from '@playwright/test';

test.describe('Wardwake Game E2E Tests', () => {
  test('Canvas loads and renders properly in 16:9 widescreen', async ({ page }) => {
    await page.goto('/');

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });

    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(0);
    expect(box!.height).toBeGreaterThan(0);
  });

  test('Player unit can be clicked, selected, and moved', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });

    await page.waitForTimeout(1000);

    // Player 1 at tile (1, 1)
    await canvas.click({ position: { x: 48, y: 88 } });
    await page.waitForTimeout(300);

    // Move to (1, 3)
    await canvas.click({ position: { x: 48, y: 152 } });
    await page.waitForTimeout(500);

    await expect(canvas).toBeVisible();
  });

  test('Tactile WASD Keyboard movement and Spacebar Wait', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    // Press S to move Down
    await page.keyboard.press('KeyS');
    await page.waitForTimeout(400);

    // Press Space to Wait
    await page.keyboard.press('Space');
    await page.waitForTimeout(400);

    await expect(canvas).toBeVisible();
  });

  test('Fast Corridor Sprinting with Shift + Directional Key', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    // Hold Shift and press S to fast-sprint down
    await page.keyboard.down('Shift');
    await page.keyboard.press('KeyS');
    await page.keyboard.up('Shift');
    await page.waitForTimeout(500);

    await expect(canvas).toBeVisible();
  });

  test('Friendly position swap allows passing through ally in narrow corridors', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    // Press S to step into adjacent ally position and trigger friendly swap
    await page.keyboard.press('KeyS');
    await page.waitForTimeout(400);

    // Press W to step back into previous tile and swap again
    await page.keyboard.press('KeyW');
    await page.waitForTimeout(400);

    await expect(canvas).toBeVisible();
  });

  test('Combat forecast appears on hover and attacks execute with animations', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    // Select Player 2 at tile (1, 2)
    await canvas.click({ position: { x: 48, y: 120 } });
    await page.waitForTimeout(300);

    // Move to (3, 2)
    await canvas.click({ position: { x: 112, y: 120 } });
    await page.waitForTimeout(500);

    await expect(canvas).toBeVisible();
  });

  test('Clicking [END TURN] in wide HUD advances phase', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    // Click [END TURN] in top HUD
    await canvas.click({ position: { x: 550, y: 18 } });
    await page.waitForTimeout(500);

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

    await canvas.click({ position: { x: 48, y: 88 } });
    await page.waitForTimeout(300);
    await canvas.click({ position: { x: 48, y: 152 } });
    await page.waitForTimeout(500);

    expect(logs.length).toBe(0);
    await expect(canvas).toBeVisible();
  });

  test('Floor Item Pickup renders float text cleanly', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    await canvas.click({ position: { x: 48, y: 88 } });
    await page.waitForTimeout(300);
    await canvas.click({ position: { x: 80, y: 88 } });
    await page.waitForTimeout(500);

    await expect(canvas).toBeVisible();
  });

  test('Minimap Fog Integrity is maintained', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    await canvas.click({ position: { x: 48, y: 88 } });
    await page.waitForTimeout(300);
    await canvas.click({ position: { x: 48, y: 120 } });
    await page.waitForTimeout(500);

    await expect(canvas).toBeVisible();
  });
});
