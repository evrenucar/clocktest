const { test, expect } = require('@playwright/test');

test.describe('Clock Markers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('#markers (24-hour strip)', () => {
    test('#markers contains exactly 25 elements', async ({ page }) => {
      const markers = page.locator('#markers .marker');
      await expect(markers).toHaveCount(25);
    });

    test('#markers labels are 0-24 in order', async ({ page }) => {
      const labels = page.locator('#markers .marker-label');
      const texts = await labels.allTextContents();
      const expected = Array.from({ length: 25 }, (_, i) => String(i));
      expect(texts).toEqual(expected);
    });

    test('#markers first marker left is 0%, last is 100%', async ({ page }) => {
      const markers = page.locator('#markers .marker');
      const first = markers.first();
      const last = markers.last();

      const firstLeft = await first.evaluate(el => el.style.left);
      const lastLeft = await last.evaluate(el => el.style.left);

      expect(firstLeft).toBe('0%');
      expect(lastLeft).toBe('100%');
    });

    test('#markers has 9 large and 16 small markers', async ({ page }) => {
      const large = page.locator('#markers .marker.marker-large');
      const small = page.locator('#markers .marker.marker-small');

      await expect(large).toHaveCount(9);
      await expect(small).toHaveCount(16);
    });

    test('#markers every marker contains one marker-line', async ({ page }) => {
      const markers = page.locator('#markers .marker');
      const count = await markers.count();

      for (let i = 0; i < count; i++) {
        const marker = markers.nth(i);
        const lines = marker.locator('.marker-line');
        await expect(lines).toHaveCount(1);
      }
    });
  });

  test.describe('#hour-markers (minute strip)', () => {
    test('#hour-markers contains exactly 13 elements', async ({ page }) => {
      const markers = page.locator('#hour-markers .marker');
      await expect(markers).toHaveCount(13);
    });

    test('#hour-markers labels are 0,5,10,15,20,25,30,35,40,45,50,55,60 in order', async ({ page }) => {
      const labels = page.locator('#hour-markers .marker-label');
      const texts = await labels.allTextContents();
      const expected = ['0', '5', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55', '60'];
      expect(texts).toEqual(expected);
    });

    test('#hour-markers has 5 large and 8 small markers', async ({ page }) => {
      const large = page.locator('#hour-markers .marker.marker-large');
      const small = page.locator('#hour-markers .marker.marker-small');

      await expect(large).toHaveCount(5);
      await expect(small).toHaveCount(8);
    });

    test('#hour-markers every marker contains one marker-line', async ({ page }) => {
      const markers = page.locator('#hour-markers .marker');
      const count = await markers.count();

      for (let i = 0; i < count; i++) {
        const marker = markers.nth(i);
        const lines = marker.locator('.marker-line');
        await expect(lines).toHaveCount(1);
      }
    });
  });
});
