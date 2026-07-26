const { test, expect } = require('@playwright/test');

// Every label inside a container must be hidden (or shown) together.
async function labelDisplays(page, container) {
    return page.locator(`${container} .marker-label`)
        .evaluateAll(els => els.map(el => getComputedStyle(el).display));
}

test.describe('visibility toggles', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('settings button opens and closes the panel', async ({ page }) => {
        await page.click('#settings-button');
        await expect(page.locator('#settings-panel')).toHaveClass(/visible/);

        await page.click('#settings-button');
        await expect(page.locator('#settings-panel')).not.toHaveClass(/visible/);
    });

    test('clicking outside closes the panel', async ({ page }) => {
        await page.click('#settings-button');
        await expect(page.locator('#settings-panel')).toHaveClass(/visible/);

        // Bottom-left corner, well away from the panel in the top right.
        await page.mouse.click(10, 600);
        await expect(page.locator('#settings-panel')).not.toHaveClass(/visible/);
    });

    test('all five display toggles default to on', async ({ page }) => {
        await page.click('#settings-button');
        for (const id of ['#hour-bar-toggle', '#progress-bar-toggle', '#digital-clock-toggle',
                          '#hour-numbers-toggle', '#numbers-toggle']) {
            await expect(page.locator(id)).toBeChecked();
        }
    });

    test('hour bar toggle hides the bar and its markers', async ({ page }) => {
        await page.click('#settings-button');
        await page.locator('#hour-bar-toggle').uncheck();
        await expect(page.locator('#hour-progress-bar')).toHaveClass(/hidden-toggle/);
        await expect(page.locator('#hour-markers')).toHaveClass(/hidden-toggle/);

        await page.locator('#hour-bar-toggle').check();
        await expect(page.locator('#hour-progress-bar')).not.toHaveClass(/hidden-toggle/);
        await expect(page.locator('#hour-markers')).not.toHaveClass(/hidden-toggle/);
    });

    test('day bar toggle hides the bar and its markers', async ({ page }) => {
        await page.click('#settings-button');
        await page.locator('#progress-bar-toggle').uncheck();
        await expect(page.locator('#progress-bar')).toHaveClass(/hidden-toggle/);
        await expect(page.locator('#markers')).toHaveClass(/hidden-toggle/);

        await page.locator('#progress-bar-toggle').check();
        await expect(page.locator('#progress-bar')).not.toHaveClass(/hidden-toggle/);
        await expect(page.locator('#markers')).not.toHaveClass(/hidden-toggle/);
    });

    test('digital clock toggle hides the time display', async ({ page }) => {
        await page.click('#settings-button');
        await page.locator('#digital-clock-toggle').uncheck();
        await expect(page.locator('#time-display')).toHaveClass(/hidden-toggle/);

        await page.locator('#digital-clock-toggle').check();
        await expect(page.locator('#time-display')).not.toHaveClass(/hidden-toggle/);
    });

    test('day numbers toggle hides labels but keeps the lines', async ({ page }) => {
        await page.click('#settings-button');
        await page.locator('#numbers-toggle').uncheck();

        expect(await labelDisplays(page, '#markers')).toEqual(Array(25).fill('none'));

        const lines = await page.locator('#markers .marker-line')
            .evaluateAll(els => els.map(el => getComputedStyle(el).display));
        expect(lines.every(d => d !== 'none')).toBe(true);

        await page.locator('#numbers-toggle').check();
        expect((await labelDisplays(page, '#markers')).every(d => d !== 'none')).toBe(true);
    });

    test('hour numbers toggle hides labels but keeps the lines', async ({ page }) => {
        await page.click('#settings-button');
        await page.locator('#hour-numbers-toggle').uncheck();

        expect(await labelDisplays(page, '#hour-markers')).toEqual(Array(13).fill('none'));

        const lines = await page.locator('#hour-markers .marker-line')
            .evaluateAll(els => els.map(el => getComputedStyle(el).display));
        expect(lines.every(d => d !== 'none')).toBe(true);

        await page.locator('#hour-numbers-toggle').check();
        expect((await labelDisplays(page, '#hour-markers')).every(d => d !== 'none')).toBe(true);
    });
});
