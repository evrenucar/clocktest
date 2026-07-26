# 24 Hour Clock Loader

Public version can be accessed at https://evrenucar.github.io/clocktest/

This is a simple web app that displays a 24-hour clock as a loading bar. The bar fills from left to right over the course of a day. 
Unlike a regular clock a progress-bar helps visualize passage of time and how much time is left in the day.

<img width="1824" height="844" alt="image" src="https://github.com/user-attachments/assets/3a315a70-2936-4a7c-baf7-ffc261ab70e5" />



Sound help to recognize and perceive passage of time better. Sound to be played can be selected and volume adjusted

<img width="224" height="161" alt="image" src="https://github.com/user-attachments/assets/e7afdc6b-588e-4fbd-a4f3-7eefe93173de" />



The hour-bar and day-bar(24hrs) numbers and the bars themselves can be turned on-off

<img width="212" height="124" alt="image" src="https://github.com/user-attachments/assets/7f49e1e9-5107-4e60-8dff-73f5efd09f1a" />



There is a dark mode(default) as well as a light mode. Light mode can be enabled by checking the box. Additionally the color can be adjusted.

<img width="684" height="279" alt="image" src="https://github.com/user-attachments/assets/d3ae21be-5ef1-4808-8bb7-dc195b0315ab" />



The night filter can be adjusted to pull whites closer to yellow for less eye-strain

<img width="591" height="336" alt="image" src="https://github.com/user-attachments/assets/c4cb4e7b-2b65-44c5-b788-14d769ab54e4" />


Open `index.html` in your browser to see the clock in action. If you have any issues please report it and I'll get it fixed. Cheers!

## Code audit

[**Read the audit →**](https://evrenucar.github.io/clocktest/docs/audit.html) ([source](docs/audit.html))

A code-quality audit of this repo covering all four files: 37 findings, grouped into bugs,
dead code, redundancy, hygiene, and repo state. It also carries the plan for working through
them: four commits, what was deliberately deferred and why, and a 90-second browser check
that covers everything the fixes touch.

Four of the findings actually broke something. All four are fixed, and each left behind a
test that fails if the bug comes back:

- The accent colour slider's track and thumb styling rendered in **no** browser. A
  `-webkit-` and a `-moz-` selector shared one rule, and a single unrecognised selector
  invalidates the whole group. (`color-slider.spec.js`)
- `playMinuteChirp` allocated a synth every minute and never disposed it: 1440 leaked
  synths a day. (`page-health.spec.js`)
- The tick scheduler drifted off the second boundary, which is what the recurring "fix clock
  running issue" commits had been chasing. (`clock.spec.js`)
- Toggling either progress bar overwrote the saved "Marker numbers" preference in
  localStorage, so those checkboxes couldn't hold a setting. (`settings-persistence.spec.js`)

The audit page is a self-contained HTML file: all CSS and JS inlined, no CDN, no build step.
It works offline straight from disk. Search and filter the findings, and tick them off as
you go; progress is stored in `localStorage`.

## Tests

85 Playwright tests across 10 spec files in `tests/`, covering the clock loop, both marker
strips, the display toggles, theme and accent colour, keyboard navigation, settings
persistence, layout at three viewports, and console and network health on load.

```
npm install
npx playwright install chromium
npm test
```

`serve.js` serves the repo on port 5173 using only the Node standard library; the Playwright
config starts and stops it. Tests run against `http://` rather than `file://` because
localStorage behaves inconsistently on a file origin.

