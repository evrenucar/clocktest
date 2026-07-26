const { test, expect } = require('@playwright/test');

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Settings button has correct aria-label and is reachable by role', async ({ page }) => {
    const settingsButton = page.getByRole('button', { name: 'Settings' });
    await expect(settingsButton).toHaveCount(1);
    await expect(settingsButton).toHaveAttribute('aria-label', 'Settings');
  });

  test('Four test buttons are reachable by distinct accessible names', async ({ page }) => {
    // The panel is display:none until opened, which removes its contents from the
    // accessibility tree entirely, so role queries find nothing until it is open.
    await page.click('#settings-button');

    const hourlyButton = page.getByRole('button', { name: 'Test hour sound' });
    const quarterButton = page.getByRole('button', { name: 'Test 15 minute sound' });
    const minuteButton = page.getByRole('button', { name: 'Test minute sound' });
    const tickTockButton = page.getByRole('button', { name: 'Test second tick-tock' });

    await expect(hourlyButton).toHaveCount(1);
    await expect(quarterButton).toHaveCount(1);
    await expect(minuteButton).toHaveCount(1);
    await expect(tickTockButton).toHaveCount(1);
  });

  test('Four test buttons have distinct aria-labels', async ({ page }) => {
    const hourlyButton = page.locator('#test-hourly');
    const quarterButton = page.locator('#test-quarter');
    const minuteButton = page.locator('#test-minute');
    const tickTockButton = page.locator('#test-tick-tock');

    const hourlyLabel = await hourlyButton.getAttribute('aria-label');
    const quarterLabel = await quarterButton.getAttribute('aria-label');
    const minuteLabel = await minuteButton.getAttribute('aria-label');
    const tickTockLabel = await tickTockButton.getAttribute('aria-label');

    const labels = [hourlyLabel, quarterLabel, minuteLabel, tickTockLabel];
    const uniqueLabels = new Set(labels);

    expect(uniqueLabels.size).toBe(4);
  });

  test('HTML has lang="en" and page has non-empty title', async ({ page }) => {
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBe('en');

    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('Every input inside settings panel has non-empty accessible name', async ({ page }) => {
    // Open the settings panel
    await page.getByRole('button', { name: 'Settings' }).click();

    // For each input, verify it has an accessible name via label or aria-label
    const inputs = page.locator('#settings-panel input');
    const inputCount = await inputs.count();

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);

      const hasAccessibleName = await input.evaluate((el) => {
        const ariaLabel = el.getAttribute('aria-label');
        if (ariaLabel && ariaLabel.trim()) return true;

        const label = el.closest('label');
        if (label && label.textContent.trim()) return true;

        return false;
      });

      expect(hasAccessibleName).toBe(true);
    }
  });

  test('Settings button can receive focus and is a button element', async ({ page }) => {
    const settingsButton = page.getByRole('button', { name: 'Settings' });

    // Focus the button
    await settingsButton.focus();

    // Verify focus was applied
    const isFocused = await settingsButton.evaluate((el) => el === document.activeElement);
    expect(isFocused).toBe(true);

    // Check that it's a button element
    const tagName = await settingsButton.evaluate((el) => el.tagName);
    expect(tagName).toBe('BUTTON');
  });

  test('No element on page has empty aria-label', async ({ page }) => {
    const elementsWithAriaLabel = page.locator('[aria-label]');
    const count = await elementsWithAriaLabel.count();

    for (let i = 0; i < count; i++) {
      const element = elementsWithAriaLabel.nth(i);
      const ariaLabel = await element.getAttribute('aria-label');
      expect(ariaLabel).not.toBe('');
      expect(ariaLabel).toBeTruthy();
    }
  });
});
