const { test, expect } = require('@playwright/test');

// Regression cover for the slider styling bug: a -webkit- selector was grouped
// with a -moz- one in a single rule, so every browser discarded the whole rule
// and the track and thumb rendered nowhere. They are now split per vendor.
test.describe('accent colour slider', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.click('#settings-button');
    });

    test('slider is visible once the panel opens', async ({ page }) => {
        await expect(page.locator('#color-slider')).toBeVisible();
    });

    // getComputedStyle(el, '::-webkit-slider-thumb') is not supported in Chromium --
    // it silently falls back to the host element and reports the slider's own width.
    // The stylesheet is the right place to assert instead, and it is also the exact
    // thing the bug broke: an invalid selector list makes the parser discard the
    // whole rule, so a regrouped rule simply would not exist in cssRules.
    function rulesFor(page, fragment) {
        return page.evaluate(frag => {
            const out = [];
            for (const sheet of document.styleSheets) {
                let rules;
                try { rules = sheet.cssRules; } catch { continue; }
                for (const rule of rules) {
                    if (rule.selectorText && rule.selectorText.includes(frag)) {
                        out.push({ selector: rule.selectorText, css: rule.style.cssText });
                    }
                }
            }
            return out;
        }, fragment);
    }

    test('webkit thumb rule survives parsing and sizes the thumb', async ({ page }) => {
        const rules = await rulesFor(page, '-webkit-slider-thumb');
        expect(rules.length).toBe(1);
        // Without explicit dimensions plus appearance:none the thumb collapses to
        // zero size and disappears. Chromium normalises -webkit-appearance to
        // plain appearance in the CSSOM, hence the unprefixed assertion.
        expect(rules[0].css).toContain('width: 16px');
        expect(rules[0].css).toContain('height: 16px');
        expect(rules[0].css).toContain('appearance: none');
    });

    test('webkit track rule survives parsing and carries the gradient', async ({ page }) => {
        const rules = await rulesFor(page, '-webkit-slider-runnable-track');
        expect(rules.length).toBe(1);
        expect(rules[0].css).toContain('height: 8px');
        expect(rules[0].css).toContain('--hue-gradient');
    });

    // Chromium drops ::-moz-* rules entirely -- it does not know the pseudo-element --
    // so they are invisible to the CSSOM here. That is precisely why each vendor needs
    // its own rule, and it also means the "never group the prefixes" guard has to read
    // the raw stylesheet: a grouped rule is discarded, so it could never show up in
    // cssRules and a CSSOM-based check would pass vacuously.
    test('firefox rules exist as their own selectors in the source', async ({ page }) => {
        const css = await (await page.request.get('/style.css')).text();
        expect(css).toContain('#color-slider::-moz-range-track {');
        expect(css).toContain('#color-slider::-moz-range-thumb {');
    });

    test('no selector in the source groups webkit with moz', async ({ page }) => {
        const css = await (await page.request.get('/style.css')).text();

        // Strip comments first, otherwise a comment sitting above a rule gets
        // swept into that rule's "selector" -- including the one right above these
        // rules that explains why the prefixes must not be grouped.
        const mixed = css.replace(/\/\*[\s\S]*?\*\//g, '')
            .split('}')
            .map(block => block.split('{')[0])
            .filter(sel => sel.includes('-webkit-') && sel.includes('-moz-'))
            .map(sel => sel.trim());

        expect(mixed).toEqual([]);
    });

    test('--hue-gradient is defined once on the root', async ({ page }) => {
        const value = await page.evaluate(() =>
            getComputedStyle(document.documentElement).getPropertyValue('--hue-gradient'));
        expect(value).toContain('linear-gradient');
        expect(value).toContain('hsl');
    });

    test('moving the hue slider updates --progress-hue', async ({ page }) => {
        await page.locator('#color-slider').fill('180');
        const hue = await page.evaluate(() =>
            getComputedStyle(document.documentElement).getPropertyValue('--progress-hue').trim());
        expect(hue).toBe('180');
    });

    test('moving the saturation slider updates --progress-saturation', async ({ page }) => {
        await page.locator('#saturation-slider').fill('75');
        const sat = await page.evaluate(() =>
            getComputedStyle(document.documentElement).getPropertyValue('--progress-saturation').trim());
        expect(sat).toBe('75%');
    });

    test('hue survives a reload', async ({ page }) => {
        await page.locator('#color-slider').fill('240');
        expect(await page.evaluate(() => localStorage.getItem('progressHue'))).toBe('240');

        await page.reload();
        await expect(page.locator('#color-slider')).toHaveValue('240');
    });
});
