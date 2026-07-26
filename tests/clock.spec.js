const { test, expect } = require('@playwright/test');

// Reads #time-display and converts it to seconds since midnight.
async function displayedSeconds(page) {
    const text = await page.locator('#time-display').textContent();
    const [h, m, s] = text.trim().split(':').map(Number);
    return h * 3600 + m * 60 + s;
}

test.describe('clock loop', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('time display uses 24-hour HH:MM:SS', async ({ page }) => {
        const text = await page.locator('#time-display').textContent();
        expect(text.trim()).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });

    test('displayed time tracks the browser clock', async ({ page }) => {
        const shown = await displayedSeconds(page);
        const actual = await page.evaluate(() => {
            const now = new Date();
            return now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
        });

        // Wrap-safe: 23:59:59 -> 00:00:00 is a 1s gap, not 86399s.
        const raw = Math.abs(shown - actual);
        expect(Math.min(raw, 86400 - raw)).toBeLessThanOrEqual(2);
    });

    test('day progress width matches the time of day', async ({ page }) => {
        const width = await page.locator('#progress').evaluate(el => parseFloat(el.style.width));
        const expected = (await displayedSeconds(page)) / 86400 * 100;
        expect(Math.abs(width - expected)).toBeLessThanOrEqual(0.1);
    });

    test('hour progress width matches minutes and seconds', async ({ page }) => {
        const width = await page.locator('#hour-progress').evaluate(el => parseFloat(el.style.width));
        const expected = await page.evaluate(() => {
            const now = new Date();
            return (now.getMinutes() * 60 + now.getSeconds()) / 3600 * 100;
        });
        expect(Math.abs(width - expected)).toBeLessThanOrEqual(0.5);
    });

    test('clock advances', async ({ page }) => {
        const before = await page.locator('#time-display').textContent();
        await page.waitForTimeout(2200);
        const after = await page.locator('#time-display').textContent();
        expect(after).not.toEqual(before);
    });

    // The regression guard for the scheduler. setInterval(1000) accumulated drift
    // and could skip or double a second; the self-correcting setTimeout must
    // advance the display by very close to the real elapsed time.
    test('does not drift over several ticks', async ({ page }) => {
        const startShown = await displayedSeconds(page);
        const startReal = await page.evaluate(() => Date.now());

        await page.waitForTimeout(4000);

        const endShown = await displayedSeconds(page);
        const endReal = await page.evaluate(() => Date.now());

        const shownDelta = (endShown - startShown + 86400) % 86400;
        const realDelta = (endReal - startReal) / 1000;

        expect(Math.abs(shownDelta - realDelta)).toBeLessThanOrEqual(1.5);
    });

    test('every sampled value stays well formed', async ({ page }) => {
        for (let i = 0; i < 4; i++) {
            const text = await page.locator('#time-display').textContent();
            expect(text.trim()).toMatch(/^\d{2}:\d{2}:\d{2}$/);
            await page.waitForTimeout(1000);
        }
    });
});
