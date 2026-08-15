import { test, expect } from '@playwright/test';

test.describe('Rescue System E2E', () => {
  test('should open Rescue Board and import custom code', async ({ page }) => {
    await page.goto('/');

    // Proceed to Town
    await page.waitForTimeout(1000);
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    await page.mouse.click(320, 200); // Click anywhere on Title Screen
    await page.waitForTimeout(1000);

    // Open Rescue Board
    // Coordinates mapping to button in TownScene:
    // Button is at center (320), y = 255
    await page.mouse.click(320, 270);
    await page.waitForTimeout(500);

    // Ensure Rescue Board is visible by interacting with Import Passcode button
    // Coordinates: modal is at center, import button is near bottom
    // We mock prompt to supply an invalid code
    page.on('dialog', async dialog => {
      if (dialog.type() === 'prompt') {
        await dialog.accept('invalid-code');
      } else {
        await dialog.accept();
      }
    });

    await page.mouse.click(320, 260); // Import button centerish
    await page.waitForTimeout(500);
  });
});
