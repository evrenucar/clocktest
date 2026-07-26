const { test, expect } = require('@playwright/test');

test.describe('Keyboard Navigation', () => {
  test('settings button is keyboard focusable', async ({ page }) => {
    await page.goto('/');
    const settingsButton = page.locator('#settings-button');
    await settingsButton.focus();

    const activeId = await page.evaluate(() => document.activeElement.id);
    expect(activeId).toBe('settings-button');
  });

  test('pressing Enter or Space on settings button opens panel', async ({ page }) => {
    await page.goto('/');
    const settingsButton = page.locator('#settings-button');
    const panel = page.locator('#settings-panel');

    // Test Enter
    await settingsButton.focus();
    await page.keyboard.press('Enter');
    await expect(panel).toHaveClass(/visible/);

    // Close panel and test Space
    await page.keyboard.press('Enter');
    await settingsButton.focus();
    await page.keyboard.press('Space');
    await expect(panel).toHaveClass(/visible/);
  });

  test('panel inputs are not visible when panel is closed', async ({ page }) => {
    await page.goto('/');
    const themeToggle = page.locator('#theme-toggle');
    await expect(themeToggle).toBeHidden();
  });

  test('theme toggle can be focused and toggled with Space when panel is open', async ({ page }) => {
    await page.goto('/');
    const settingsButton = page.locator('#settings-button');
    await settingsButton.focus();
    await page.keyboard.press('Space');

    const themeToggle = page.locator('#theme-toggle');
    await themeToggle.focus();
    await page.keyboard.press('Space');

    await expect(themeToggle).toBeChecked();
    const body = page.locator('body');
    await expect(body).toHaveClass(/light-mode/);
  });

  test('color slider ArrowRight increases value and updates CSS variable', async ({ page }) => {
    await page.goto('/');
    const settingsButton = page.locator('#settings-button');
    await settingsButton.focus();
    await page.keyboard.press('Space');

    const colorSlider = page.locator('#color-slider');
    await colorSlider.focus();

    const initialValue = parseInt(await colorSlider.inputValue());
    await page.keyboard.press('ArrowRight');

    const newValue = parseInt(await colorSlider.inputValue());
    expect(newValue).toBe(initialValue + 1);

    const cssVar = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--progress-hue').trim()
    );
    expect(cssVar).toBe(String(newValue));
  });

  test('color slider ArrowLeft decreases value by 1', async ({ page }) => {
    await page.goto('/');
    const settingsButton = page.locator('#settings-button');
    await settingsButton.focus();
    await page.keyboard.press('Space');

    const colorSlider = page.locator('#color-slider');
    await colorSlider.focus();

    const initialValue = parseInt(await colorSlider.inputValue());
    await page.keyboard.press('ArrowLeft');

    const newValue = parseInt(await colorSlider.inputValue());
    expect(newValue).toBe(initialValue - 1);
  });

  test('Tab navigation stays within panel', async ({ page }) => {
    await page.goto('/');
    const settingsButton = page.locator('#settings-button');
    await settingsButton.focus();
    await page.keyboard.press('Space');

    const firstCheckbox = page.locator('#hourly-ding');
    await firstCheckbox.focus();

    let previousId = await page.evaluate(() => document.activeElement.id);

    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Tab');

      const currentId = await page.evaluate(() => document.activeElement.id);
      const isInPanel = await page.evaluate(() =>
        document.querySelector('#settings-panel').contains(document.activeElement)
      );

      expect(currentId).not.toBe(previousId);
      expect(isInPanel).toBe(true);

      previousId = currentId;
    }
  });

  test('range inputs clamp at bounds', async ({ page }) => {
    await page.goto('/');
    const settingsButton = page.locator('#settings-button');
    await settingsButton.focus();
    await page.keyboard.press('Space');

    const colorSlider = page.locator('#color-slider');
    await colorSlider.focus();
    await colorSlider.fill('360');

    await page.keyboard.press('ArrowRight');

    const finalValue = parseInt(await colorSlider.inputValue());
    expect(finalValue).toBe(360);
  });
});
