import { test, expect, type Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/'); // Adjust the URL if needed
});

test.describe('Lo-Fi Work Break Reminder', () => {
  test('should have a timer that can be customized and controlled', async ({ page }) => {
    // Check if timer is visible and has initial value
    const timer = page.locator('#timer');
    await expect(timer).toBeVisible();
    await expect(timer).toHaveText('00:25:00');

    // Customize timer
    await page.fill('#custom-hours', '0');
    await page.fill('#custom-minutes', '30');
    await page.fill('#custom-seconds', '0');
    await page.click('button:has-text("Set")');
    
    // Start timer
    await page.click('#pauseResume');
    await page.waitForTimeout(2000); // Wait for 2 seconds
    await expect(timer).not.toHaveText('00:30:00'); // Timer should have changed

    // Check if the audio player is playing after starting timer (since playPauseTimer also plays music)
    const isPlaying = await page.evaluate(() => {
      const audioPlayer = window.audioPlayer;
      return audioPlayer && !audioPlayer.paused
    });
    expect(isPlaying).toBe(true);

    // Pause timer
    await page.click('#pauseResume');
    const timerValueAfterPause = await timer.textContent();
    await page.waitForTimeout(2000);
    // Check if timerValueAfterPause is not empty
    expect(timerValueAfterPause).not.toBe('');

    // Reset timer
    await page.click('button:has-text("Reset")');
    await expect(timer).toHaveText('00:25:00');
  });

  test('should show accomplishments section', async ({ page }) => {
    const accomplishmentsSection = page.locator('#accomplishments');
    await expect(accomplishmentsSection).toBeVisible();
    await expect(page.locator('#accomplishmentsList')).toBeVisible();
  });

  test('should have audio controls and master volume', async ({ page }) => {
    const audioControls = page.locator('.media-controls');
    await expect(audioControls).toBeVisible();
    await expect((page.locator('#previousTrack'))).toBeVisible();
    await expect(page.locator('.media-controls #playPause')).toBeVisible();
    await expect(page.locator('#nextTrack')).toBeVisible();

    const masterVolume = page.locator('#masterVolume');
    await expect(masterVolume).toBeVisible();
    await expect(masterVolume).toHaveAttribute('type', 'range');
    await expect(masterVolume).toHaveValue('1');
  });
});
