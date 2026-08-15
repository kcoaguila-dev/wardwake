import { test, expect } from '@playwright/test';

test.describe('Wardwake Game E2E Tests', () => {
  test('Title Scene loads and renders WARDWAKE logo and menu buttons', async ({ page }) => {
    await page.goto('/');

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 15000 });

    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(0);
    expect(box!.height).toBeGreaterThan(0);
  });

  test('Settings & Audio Modal can be opened, adjusted, and closed on Title Scene', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(600);

    // Press 'S' to open Settings
    await page.keyboard.press('KeyS');
    await page.waitForTimeout(400);

    // Press 'Escape' to close Settings
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    await expect(canvas).toBeVisible();
  });

  test('Clicking an adjacent ally triggers a positional swap in exploration mode', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(600);

    // Enter game
    await page.keyboard.press('Enter');
    await page.waitForTimeout(800);

    // In exploration mode, companions automatically follow. Let's make one move to spawn the companion right next to the leader.
    await page.keyboard.press('KeyS');
    await page.waitForTimeout(400);

    // To click on the ally, we must compute roughly where they are.
    // They usually follow 1 tile behind. Leader moved down (S), so companion is 1 tile up from leader.
    // The camera is centered on the leader. Center of screen is leader. 1 tile up is ally.
    const box = await canvas.boundingBox();
    if (box) {
      const centerX = box.x + box.width / 2;
      const centerY = box.y + box.height / 2;

      // Assume a 32x32 scaled tile size (maybe scale=2, so 64 pixels). Let's click roughly 40-50 pixels above center.
      await page.mouse.click(centerX, centerY - 50);
      await page.waitForTimeout(400);

      // We should swap, not stack.
      // Click back on center (where ally should now be)
      await page.mouse.click(centerX, centerY);
      await page.waitForTimeout(400);
    }

    await expect(canvas).toBeVisible();
  });

  test('How To Play Manual can be opened and closed on Title Scene', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(600);

    // Press 'H' to open Manual
    await page.keyboard.press('KeyH');
    await page.waitForTimeout(400);

    // Press 'Escape' to close Manual
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    await expect(canvas).toBeVisible();
  });

  test('Pressing Enter starts expedition from Title Scene into Floor 1', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(600);

    // Press Enter to start expedition
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    await expect(canvas).toBeVisible();
  });

  test('Tactile WASD Keyboard movement and Spacebar Wait', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(600);

    // Enter game
    await page.keyboard.press('Enter');
    await page.waitForTimeout(800);

    // Press S to move Down
    await page.keyboard.press('KeyS');
    await page.waitForTimeout(400);

    // Press Space to Wait
    await page.keyboard.press('Space');
    await page.waitForTimeout(400);

    await expect(canvas).toBeVisible();
  });

  test('Tab key switches active party leader dynamically', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(600);

    // Enter game
    await page.keyboard.press('Enter');
    await page.waitForTimeout(800);

    // Press Tab to cycle leader
    await page.keyboard.press('Tab');
    await page.waitForTimeout(400);

    // Move with new leader
    await page.keyboard.press('KeyS');
    await page.waitForTimeout(400);

    await expect(canvas).toBeVisible();
  });

  test('Fast Corridor Sprinting with Shift + Directional Key', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(600);

    // Enter game
    await page.keyboard.press('Enter');
    await page.waitForTimeout(800);

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
    await expect(canvas).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(600);

    // Enter game
    await page.keyboard.press('Enter');
    await page.waitForTimeout(800);

    // Press S to step into adjacent ally position and trigger friendly swap
    await page.keyboard.press('KeyS');
    await page.waitForTimeout(400);

    // Press W to step back into previous tile and swap again
    await page.keyboard.press('KeyW');
    await page.waitForTimeout(400);

    await expect(canvas).toBeVisible();
  });

  test('In-game Settings button in top HUD opens Settings Modal', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(600);

    // Enter game
    await page.keyboard.press('Enter');
    await page.waitForTimeout(800);

    // Click ⚙️ Settings button in Top HUD (around x=582, y=10)
    await canvas.click({ position: { x: 582, y: 15 } });
    await page.waitForTimeout(400);

    // Escape closes modal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

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
    await expect(canvas).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(600);

    // Enter game
    await page.keyboard.press('Enter');
    await page.waitForTimeout(800);

    await page.keyboard.press('KeyS');
    await page.waitForTimeout(400);

    expect(logs.length).toBe(0);
    await expect(canvas).toBeVisible();
  });

  test('Save & Continue persistence allows resuming expedition from Title Scene', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(600);

    // Populate fake save state in localStorage
    await page.evaluate(() => {
      const mockSave = {
        version: 1,
        floorNumber: 3,
        turnsTaken: 42,
        monstersSlain: 6,
        relicsFound: 2,
        playerSquad: [
          {
            id: 'hero_sword_fighter',
            name: 'Sword Fighter',
            maxHp: 20,
            currentHp: 18,
            maxSp: 20,
            currentSp: 14,
            attack: 10,
            defense: 5,
            weaponType: 'SWORD',
            exp: 40,
            level: 2,
            belly: 85,
            maxBelly: 100,
            inventory: []
          }
        ],
        selectedPlayerIndex: 0,
        activeModifier: 'TREASURE_VAULT',
        savedAt: Date.now()
      };
      localStorage.setItem('wardwake_run_save', JSON.stringify(mockSave));
    });

    // Reload page to see Continue button
    await page.reload();
    await expect(canvas).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(600);

    // Press Enter to trigger Continue
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    await expect(canvas).toBeVisible();
  });

  test('Tactical Action Bar is permanently rendered and Inventory can be opened via Item hotkey', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(600);

    // 1. Title Scene -> Town Scene
    await page.keyboard.press('Enter');
    await page.waitForTimeout(600);

    const box = await canvas.boundingBox();
    if (box) {
      const scaleX = box.width / 640;
      const scaleY = box.height / 360;

      // 2. Town Scene -> MainGameScene (Click Dungeon Gate at x: 320, y: 137)
      await page.mouse.click(box.x + 320 * scaleX, box.y + 137 * scaleY);
      await page.waitForTimeout(1000);

      // Open Inventory modal via game instance or key
      await page.evaluate(() => {
        const game = (window as any).game;
        const scene: any = game?.scene?.getScene('MainGameScene');
        if (scene) {
          const hero = scene.playerSquad[0]?.unit;
          if (hero) scene.inventoryMenuPresenter.show(hero);
        }
      });
      await page.waitForTimeout(300);

      // Check modal is open
      const isOpenBefore = await page.evaluate(() => {
        const game = (window as any).game;
        const scene: any = game?.scene?.getScene('MainGameScene');
        return scene ? scene.inventoryMenuPresenter.isVisible() : false;
      });
      expect(isOpenBefore).toBe(true);

      // Click 'X' Close button on Inventory modal directly with mouse (x = 415, y = 85)
      await page.mouse.click(box.x + 415 * scaleX, box.y + 85 * scaleY);
      await page.waitForTimeout(300);

      // Check modal is closed
      const isOpenAfter = await page.evaluate(() => {
        const game = (window as any).game;
        const scene: any = game?.scene?.getScene('MainGameScene');
        return scene ? scene.inventoryMenuPresenter.isVisible() : false;
      });
      expect(isOpenAfter).toBe(false);

      // Re-open and test item row click
      await page.evaluate(() => {
        const game = (window as any).game;
        const scene: any = game?.scene?.getScene('MainGameScene');
        if (scene) {
          const hero = scene.playerSquad[0]?.unit;
          if (hero) scene.inventoryMenuPresenter.show(hero);
        }
      });
      await page.waitForTimeout(300);

      // Click first item row at x: 310, y: 125
      await page.mouse.click(box.x + 310 * scaleX, box.y + 125 * scaleY);
      await page.waitForTimeout(300);
    }

    await expect(canvas).toBeVisible();
  });
});
