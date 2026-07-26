const { test, expect } = require('@playwright/test');

const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 667 },
];

VIEWPORTS.forEach(({ name, width, height }) => {
  test.describe(`Responsive - ${name} (${width}x${height})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/');
    });

    test('no horizontal scroll', async ({ page }) => {
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    });

    test('container is visible and properly sized', async ({ page }) => {
      const container = page.locator('.container');
      await expect(container).toBeVisible();

      const box = await container.boundingBox();
      expect(box).not.toBeNull();
      expect(box.width).toBeGreaterThan(0);
      expect(box.width).toBeLessThanOrEqual(width);
    });

    test('settings button is visible and fully inside viewport', async ({ page }) => {
      const button = page.locator('#settings-button');
      await expect(button).toBeVisible();

      const box = await button.boundingBox();
      expect(box).not.toBeNull();
      expect(box.x + box.width).toBeLessThanOrEqual(width);
      expect(box.y).toBeGreaterThanOrEqual(0);
    });

    test('settings panel stays inside viewport when opened', async ({ page }) => {
      const button = page.locator('#settings-button');
      await button.click();

      const panel = page.locator('#settings-panel');
      await expect(panel).toHaveClass(/visible/);

      const box = await panel.boundingBox();
      expect(box).not.toBeNull();
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
    });

    test('progress bars are visible with non-zero height', async ({ page }) => {
      const progressBar = page.locator('#progress-bar');
      const hourProgressBar = page.locator('#hour-progress-bar');

      await expect(progressBar).toBeVisible();
      await expect(hourProgressBar).toBeVisible();

      const progressBox = await progressBar.boundingBox();
      const hourProgressBox = await hourProgressBar.boundingBox();

      expect(progressBox.height).toBeGreaterThan(0);
      expect(hourProgressBox.height).toBeGreaterThan(0);
    });

    test('viewport meta tag exists with correct content', async ({ page }) => {
      // A <meta> tag lives in <head> and is never "visible" -- assert it exists
      // and carries the right content instead.
      const viewport = page.locator('meta[name="viewport"]');
      await expect(viewport).toHaveCount(1);

      const content = await viewport.getAttribute('content');
      expect(content).toContain('width=device-width');
    });
  });
});
