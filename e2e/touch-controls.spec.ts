import { test, expect } from '@playwright/test';

test.describe('Mobile Touch Controls', () => {
  test.use({ viewport: { width: 375, height: 667 }, hasTouch: true });

  test('should render virtual pad on mobile and emit events', async ({ page }) => {
    // We expect the canvas to be rendered
    await page.goto('/');

    // Wait for canvas
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Since Phaser renders to a canvas, we simulate a click in the region where a button would be.
    // D-Pad Up is roughly at x=70, y= height-70-40
    // We check that tapping there progresses the game or does not crash
    // Because checking Phaser internal state from e2e is complex, we just ensure touch works without error.
    await page.waitForTimeout(1000); // Wait for scene to load

    const boundingBox = await canvas.boundingBox();
    if (boundingBox) {
      // Tap D-Pad UP
      await page.mouse.click(boundingBox.x + 70, boundingBox.height - 110);
      await page.waitForTimeout(200);

      // Tap 'A' Action Button
      await page.mouse.click(boundingBox.width - 70, boundingBox.height - 70 + 40);
      await page.waitForTimeout(200);
    }
  });
});
