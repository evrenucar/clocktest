const { test, expect } = require('@playwright/test');

test.describe('Settings Persistence', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Open settings panel
    await page.click('#settings-button');
    await page.waitForSelector('#settings-panel.visible');
  });

  test('REGRESSION: hour-bar-toggle should not overwrite hour-numbers-toggle', async ({ page }) => {
    const hourBarToggle = page.locator('#hour-bar-toggle');
    const hourNumbersToggle = page.locator('#hour-numbers-toggle');

    // Uncheck hour-numbers-toggle (hour-bar-toggle is ON by default)
    await hourNumbersToggle.uncheck();

    // Uncheck and recheck hour-bar-toggle
    await hourBarToggle.uncheck();
    await hourBarToggle.check();

    // Assert hour-numbers-toggle is still unchecked
    await expect(hourNumbersToggle).not.toBeChecked();

    // Assert localStorage showHourNumbers is still 'false'
    const storageValue = await page.evaluate(() => window.localStorage.getItem('showHourNumbers'));
    expect(storageValue).toBe('false');
  });

  test('REGRESSION: progress-bar-toggle should not overwrite numbers-toggle', async ({ page }) => {
    const progressBarToggle = page.locator('#progress-bar-toggle');
    const numbersToggle = page.locator('#numbers-toggle');

    // Uncheck numbers-toggle (progress-bar-toggle is ON by default)
    await numbersToggle.uncheck();

    // Uncheck and recheck progress-bar-toggle
    await progressBarToggle.uncheck();
    await progressBarToggle.check();

    // Assert numbers-toggle is still unchecked
    await expect(numbersToggle).not.toBeChecked();

    // Assert localStorage showNumbers is still 'false'
    const storageValue = await page.evaluate(() => window.localStorage.getItem('showNumbers'));
    expect(storageValue).toBe('false');
  });

  test('Checking a sound checkbox writes true to localStorage', async ({ page }) => {
    const tickTockCheckbox = page.locator('#tick-tock');

    // Check the tick-tock checkbox
    await tickTockCheckbox.check();

    // Assert localStorage secondTickTock is 'true'
    const storageValue = await page.evaluate(() => window.localStorage.getItem('secondTickTock'));
    expect(storageValue).toBe('true');
  });

  test('Settings survive a reload', async ({ page }) => {
    const digitalClockToggle = page.locator('#digital-clock-toggle');

    // Uncheck digital-clock-toggle
    await digitalClockToggle.uncheck();

    // Reload the page
    await page.reload();

    // Assert digital-clock-toggle is still unchecked
    await expect(digitalClockToggle).not.toBeChecked();

    // Assert #time-display still has .hidden-toggle class
    const timeDisplay = page.locator('#time-display');
    await expect(timeDisplay).toHaveClass(/hidden-toggle/);
  });

  test('Volume persists after reload', async ({ page }) => {
    const volumeInput = page.locator('#volume');

    // Set volume to 0.25
    await volumeInput.fill('0.25');

    // Reload the page
    await page.reload();

    // Assert localStorage volume is '0.25'
    const storageValue = await page.evaluate(() => window.localStorage.getItem('volume'));
    expect(storageValue).toBe('0.25');

    // Assert the input value is '0.25'
    await expect(volumeInput).toHaveValue('0.25');
  });

  test('Pre-seeded settings are honored on load', async ({ page }) => {
    // Add init script to set localStorage before navigation
    await page.addInitScript(() => {
      window.localStorage.setItem('lightMode', 'true');
      window.localStorage.setItem('showDigitalClock', 'false');
    });

    // Reload the page to apply the pre-seeded settings
    await page.reload();

    // Assert body has .light-mode class
    const body = page.locator('body');
    await expect(body).toHaveClass(/light-mode/);

    // Assert #digital-clock-toggle is unchecked
    const digitalClockToggle = page.locator('#digital-clock-toggle');
    await expect(digitalClockToggle).not.toBeChecked();
  });
});
