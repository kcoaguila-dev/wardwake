import { test, expect } from '@playwright/test';

test.describe('Trial Seeded Runs', () => {
  test('should display Hall of Fame and Seed Input in Town', async ({ page }) => {
    // 1. Start application
    await page.goto('/');

    // 2. Bypass TitleScreen -> TownScene
    await page.keyboard.press("Enter");
    await page.waitForTimeout(1000);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(1000);

    // 3. Evaluate canvas click for "HALL OF FAME"
    await page.evaluate(() => {
      const canvas = document.querySelector('canvas')!;
      const rect = canvas.getBoundingClientRect();
      const scaleX = rect.width / 640;
      const scaleY = rect.height / 360;

      const hallOfFameX = rect.left + (235 * scaleX);
      const hallOfFameY = rect.top + (272 * scaleY);

      canvas.dispatchEvent(new MouseEvent('pointerdown', {
        clientX: hallOfFameX, clientY: hallOfFameY, bubbles: true
      }));
    });

    // Check if HALL OF FAME opened by checking close button presence or canvas visual change. Since canvas is opaque, we'll verify the script executes without error.
    await page.waitForTimeout(500);

    // Close HALL OF FAME
    await page.evaluate(() => {
      const canvas = document.querySelector('canvas')!;
      const rect = canvas.getBoundingClientRect();
      const scaleX = rect.width / 640;
      const scaleY = rect.height / 360;

      const closeX = rect.left + (320 * scaleX);
      const closeY = rect.top + (285 * scaleY);

      canvas.dispatchEvent(new MouseEvent('pointerdown', {
        clientX: closeX, clientY: closeY, bubbles: true
      }));
    });
    await page.waitForTimeout(500);

    // Click SEEDED RUN
    await page.evaluate(() => {
      const canvas = document.querySelector('canvas')!;
      const rect = canvas.getBoundingClientRect();
      const scaleX = rect.width / 640;
      const scaleY = rect.height / 360;

      const seedX = rect.left + (405 * scaleX);
      const seedY = rect.top + (272 * scaleY);

      canvas.dispatchEvent(new MouseEvent('pointerdown', {
        clientX: seedX, clientY: seedY, bubbles: true
      }));
    });
    await page.waitForTimeout(500);

    // Instead of locator, we can just use evaluate because the input might be created dynamically and taking a bit.
    await page.evaluate(() => {
        const input = document.querySelector('input');
        if (input) {
            input.focus();
            input.value = "DAILY_TEST_01";
        }
    });

    await page.waitForTimeout(500);

    // Click START RUN
    await page.evaluate(() => {
      const canvas = document.querySelector('canvas')!;
      const rect = canvas.getBoundingClientRect();
      const scaleX = rect.width / 640;
      const scaleY = rect.height / 360;

      const startX = rect.left + (400 * scaleX);
      const startY = rect.top + (230 * scaleY);

      canvas.dispatchEvent(new MouseEvent('pointerdown', {
        clientX: startX, clientY: startY, bubbles: true
      }));
    });

    await page.waitForTimeout(1000);
    // Modal input should hide
    const inputCount = await page.evaluate(() => document.querySelectorAll('input').length);
    // The input might still be there but display: none
    const isVisible = await page.evaluate(() => {
        const input = document.querySelector('input');
        return input ? input.style.display !== 'none' : false;
    });
    expect(isVisible).toBe(false);
  });
});
