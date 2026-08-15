import { test, expect } from '@playwright/test';

test.describe('Save Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Clear localStorage to ensure a clean slate
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('creates new save slot, opens settings, saves and quits to title', async ({ page }) => {
    // Wait for the title scene to fully load
    await page.waitForTimeout(1000);

    // 1. Click on PROFILES / SLOTS (Centered roughly at y=155 based on TitleScene startY + btnH/2)
    // Canvas interaction wrapper
    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');

    // Click "PROFILES / SLOTS" at center X, y = startY (140) + btnH/2 (15) = 155
    const scaleX = box.width / 640;
    const scaleY = box.height / 360;
    await page.mouse.click(box.x + 320 * scaleX, box.y + 155 * scaleY);

    await page.waitForTimeout(500); // Modal animates in

    // 2. Click "NEW GAME" on SLOT 1
    await page.mouse.click(box.x + 430 * scaleX, box.y + 115 * scaleY); // Adjusted based on modal coords

    // Wait for fadeout and TownScene to load
    await page.waitForTimeout(1500);

    // 3. We are in TownScene. We want to open SETTINGS. Press 's'
    await page.keyboard.press('s');
    await page.waitForTimeout(500);

    // 4. Click SAVE & EXIT TO TITLE.
    // In SettingsModalPresenter: saveBtnY = bestiaryBtnY (110+30=140) + 30 = 170. modalY = 45. Screen Y = 215. Screen X = 320.
    // modal height 300, modalY = 30. saveBtnY = 170 + 30 = 200. Screen X = 320.
    await page.mouse.click(box.x + 320 * scaleX, box.y + 200 * scaleY);
    await page.waitForTimeout(1000);

    // Verify localStorage has slot_1 data
    const slot1Data = await page.evaluate(() => localStorage.getItem('wardwake_profile_slot_1'));
    expect(slot1Data).toBeTruthy();
  });
});
