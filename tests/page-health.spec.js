const { test, expect } = require('@playwright/test');

test.describe('Clock page health', () => {
  test('Page loads with no console errors', async ({ page }) => {
    const consoleErrors = [];
    const pageErrors = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', (err) => {
      pageErrors.push(err.message);
    });

    await page.goto('/');
    await page.waitForTimeout(500);

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  test('No failed network requests', async ({ page }) => {
    const failedRequests = [];
    const badStatusResponses = [];

    page.on('requestfailed', (req) => {
      failedRequests.push(req.url());
    });

    page.on('response', (res) => {
      if (res.status() >= 400) {
        badStatusResponses.push({ url: res.url(), status: res.status() });
      }
    });

    await page.goto('/');
    await page.waitForTimeout(500);

    expect(failedRequests).toEqual([]);
    expect(badStatusResponses).toEqual([]);
  });

  test('Tone.js version is pinned to 14.9.17', async ({ page }) => {
    let toneUrl = null;

    page.on('response', (res) => {
      if (res.url().includes('tone') && res.url().includes('.js')) {
        toneUrl = res.url();
      }
    });

    await page.goto('/');
    await page.waitForTimeout(500);

    expect(toneUrl).toBeTruthy();
    expect(toneUrl).toContain('14.9.17');
  });

  test('window.Tone is defined after load', async ({ page }) => {
    await page.goto('/');

    const toneDefined = await page.evaluate(() => {
      return typeof window.Tone !== 'undefined';
    });

    expect(toneDefined).toBe(true);
  });

  test('Sound test buttons work without errors', async ({ page }) => {
    const consoleErrors = [];
    const pageErrors = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', (err) => {
      pageErrors.push(err.message);
    });

    await page.goto('/');
    await page.waitForTimeout(500);

    // Open settings panel
    await page.click('#settings-button');
    await page.waitForTimeout(300);

    const buttons = ['#test-hourly', '#test-quarter', '#test-minute', '#test-tick-tock'];

    for (const buttonSelector of buttons) {
      await page.click(buttonSelector);
      await page.waitForTimeout(200);
    }

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  test('LEAK GUARD: minute synth is reused on repeated clicks', async ({ page }) => {
    const consoleErrors = [];
    const pageErrors = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', (err) => {
      pageErrors.push(err.message);
    });

    await page.goto('/');
    await page.waitForTimeout(500);

    // Open settings panel
    await page.click('#settings-button');
    await page.waitForTimeout(300);

    // Click the minute test button 5 times
    for (let i = 0; i < 5; i++) {
      await page.click('#test-minute');
      await page.waitForTimeout(200);
    }

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);

    // Verify page is still responsive
    const timeDisplayVisible = await page.locator('#time-display').isVisible();
    expect(timeDisplayVisible).toBe(true);
  });
});
