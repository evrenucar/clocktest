const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './tests',
    fullyParallel: true,
    reporter: [['list']],
    // Several clock tests sample the wall clock for 5-10s, so they hold a
    // browser context open far longer than a typical assertion. Three engines
    // at the default worker count starved Firefox teardown past the 30s default
    // and failed tests that pass on their own. 60s absorbs the contention; the
    // suite is I/O-bound on timers, not CPU-bound, so this costs nothing when
    // things are healthy.
    timeout: 60000,
    retries: process.env.CI ? 1 : 0,
    use: {
        baseURL: 'http://127.0.0.1:5173',
        trace: 'retain-on-failure',
    },
    // All three matter here: the slider bug was a -webkit-/-moz- selector sharing
    // one rule, which broke every engine. Chromium alone cannot catch that class
    // of bug, so its guard had to assert against the CSS source text instead.
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    ],
    webServer: {
        command: 'node serve.js',
        url: 'http://127.0.0.1:5173',
        reuseExistingServer: true,
        timeout: 20000,
    },
});
