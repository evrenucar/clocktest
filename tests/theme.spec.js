const { test, expect } = require('@playwright/test');

const DARK = 'rgb(21, 21, 21)';
const LIGHT = 'rgb(240, 240, 240)';

const bg = page => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
const cssVar = (page, name) => page.evaluate(
    n => getComputedStyle(document.documentElement).getPropertyValue(n).trim(), name);

test.describe('theme and colour', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('defaults to dark', async ({ page }) => {
        await expect(page.locator('body')).not.toHaveClass(/light-mode/);
        expect(await bg(page)).toBe(DARK);
    });

    // style.css transitions background-color over 0.3s, so reading it once right
    // after the click samples a mid-fade colour. Poll until it settles.
    test('theme toggle switches to light', async ({ page }) => {
        await page.click('#settings-button');
        await page.locator('#theme-toggle').check();

        await expect(page.locator('body')).toHaveClass(/light-mode/);
        await expect.poll(() => bg(page), { timeout: 3000 }).toBe(LIGHT);
    });

    test('theme toggle switches back to dark', async ({ page }) => {
        await page.click('#settings-button');
        await page.locator('#theme-toggle').check();
        await page.locator('#theme-toggle').uncheck();

        await expect(page.locator('body')).not.toHaveClass(/light-mode/);
        await expect.poll(() => bg(page), { timeout: 3000 }).toBe(DARK);
    });

    test('light mode survives a reload', async ({ page }) => {
        await page.click('#settings-button');
        await page.locator('#theme-toggle').check();
        expect(await page.evaluate(() => localStorage.getItem('lightMode'))).toBe('true');

        await page.reload();
        await expect(page.locator('body')).toHaveClass(/light-mode/);
    });

    test('night filter defaults off and is adjustable', async ({ page }) => {
        expect(await cssVar(page, '--night-filter')).toBe('0');

        await page.click('#settings-button');
        await page.locator('#night-filter-slider').fill('0.5');

        expect(await cssVar(page, '--night-filter')).toBe('0.5');
        expect(await page.evaluate(() => localStorage.getItem('nightFilter'))).toBe('0.5');
    });

    // script.js no longer sets --progress-color; style.css derives it from hue and
    // saturation. This proves that derivation still resolves.
    test('--progress-color still resolves after a hue change', async ({ page }) => {
        await page.click('#settings-button');
        await page.locator('#color-slider').fill('200');

        const colour = await cssVar(page, '--progress-color');
        expect(colour).toBeTruthy();
        expect(colour).toContain('hsl');
    });

    test('progress bar paints a real colour', async ({ page }) => {
        await page.click('#settings-button');
        await page.locator('#color-slider').fill('200');

        const painted = await page.evaluate(() =>
            getComputedStyle(document.getElementById('progress')).backgroundColor);
        expect(painted).toBeTruthy();
        expect(painted).not.toBe('rgba(0, 0, 0, 0)');
    });
});
