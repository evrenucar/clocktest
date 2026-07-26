const { test, expect } = require('@playwright/test');

// Web Audio is absent from some browser builds and withheld by some privacy
// settings. Tone's constructors throw when it is missing, and at module scope
// that throw used to abort script.js before createMarkers() ran, so the page
// rendered two empty bars and no time at all.
//
// AudioContext is deleted before any page script runs, which reproduces that
// environment in every engine rather than relying on one that happens to lack it.
test.describe('no Web Audio available', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      delete window.AudioContext;
      delete window.webkitAudioContext;
    });
  });

  test('REGRESSION: the clock still renders', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('#markers .marker')).toHaveCount(25);
    await expect(page.locator('#hour-markers .marker')).toHaveCount(13);
    await expect(page.locator('#time-display')).toHaveText(/^\d{2}:\d{2}:\d{2}$/);
  });

  test('REGRESSION: no uncaught error reaches the page', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', err => pageErrors.push(err.message));

    await page.goto('/');
    await page.waitForTimeout(500);

    expect(pageErrors).toEqual([]);
  });

  test('the progress bars still advance', async ({ page }) => {
    await page.goto('/');

    const width = () => page.locator('#progress').evaluate(el => parseFloat(el.style.width));
    const first = await width();
    expect(first).toBeGreaterThan(0);

    await page.waitForTimeout(1200);
    expect(await width()).toBeGreaterThan(first);
  });

  test('sound buttons are inert rather than throwing', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', err => pageErrors.push(err.message));

    await page.goto('/');
    await page.locator('#settings-button').click();

    for (const id of ['#test-hourly', '#test-quarter', '#test-minute', '#test-tick-tock']) {
      await page.locator(id).click();
    }
    await page.waitForTimeout(300);

    expect(pageErrors).toEqual([]);
  });

  test('volume is still persisted so it survives into a capable browser', async ({ page }) => {
    await page.goto('/');
    await page.locator('#settings-button').click();
    await page.locator('#volume').fill('0.8');

    const stored = await page.evaluate(() => localStorage.getItem('volume'));
    expect(parseFloat(stored)).toBeCloseTo(0.8, 5);
  });
});
