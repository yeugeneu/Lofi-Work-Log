import { test, expect } from '@playwright/test';

test.describe('Break Time Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Disable HTTP errors for easier testing
    await page.route('**/*', (route) => {
        if (route.request().url().includes('pixabay.com') || route.request().url().includes('uppbeat.io')) {
            route.abort();
        } else {
            route.continue();
        }
    });
  });

  test('should transition to break time after focus session', async ({ page }) => {
    // Set work timer to 1 second
    await page.fill('#custom-hours', '0');
    await page.fill('#custom-minutes', '0');
    await page.fill('#custom-seconds', '1');
    await page.click('button:has-text("Set")');

    // Start timer
    await page.click('#pauseResume');

    // Wait for popup
    const popup = page.locator('#reminderPopup');
    await expect(popup).toBeVisible({ timeout: 5000 });

    // Fill accomplishment
    await page.fill('#accomplishmentInput', 'Finished my task');

    // Click "Save & Break"
    await page.click('button:has-text("Save & Break")');

    // Verify popup is hidden
    await expect(popup).not.toBeVisible();

    // Verify timer is set to 5 minutes
    const timer = page.locator('#timer');
    await expect(timer).toHaveText('00:05:00');

    // Verify main controls are hidden
    await expect(page.locator('.timer-config')).not.toBeVisible();
    await expect(page.locator('#previousTrack')).not.toBeVisible();
    await expect(page.locator('#nextTrack')).not.toBeVisible();
    
    // We can't easily set the timer to 1s via UI anymore because it's hidden
    // For the test, we will use the exposed window functions to speed it up
    await page.evaluate(() => {
        window.setTimerSeconds(1);
        window.setIsPaused(false);
    });

    // Wait for break to end (should reset to 25:00)
    await expect(timer).toHaveText('00:25:00', { timeout: 10000 });

    // Check if "Break" was added to accomplishments
    const lastAccomplishment = page.locator('#accomplishmentsList li').last();
    await expect(lastAccomplishment).toContainText('Break');
  });

  test('should allow skipping the break', async ({ page }) => {
    // Start work session and finish it
    await page.evaluate(() => {
        window.setTimerSeconds(1);
        window.setIsPaused(false);
    });

    // Wait for popup and click "Save & Break"
    await page.click('button:has-text("Save & Break")');

    // Verify we are in break mode
    await expect(page.locator('#timer')).toHaveText('00:05:00');
    await expect(page.locator('#skipBreak')).toBeVisible();

    // Click Skip Break
    await page.click('#skipBreak');

    // Verify we are back in focus mode
    await expect(page.locator('#timer')).toHaveText('00:25:00');
    await expect(page.locator('#skipBreak')).not.toBeVisible();
    await expect(page.locator('.timer-config')).toBeVisible();
  });
});
