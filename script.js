let hourSound = localStorage.getItem('hourSound') === 'true';
let quarterSound = localStorage.getItem('quarterSound') === 'true';
let minuteSound = localStorage.getItem('minuteSound') === 'true';
let secondTickTock = localStorage.getItem('secondTickTock') === 'true';
let volume = parseFloat(localStorage.getItem('volume'));
if (isNaN(volume)) volume = 0.5;

let showHourBar = localStorage.getItem('showHourBar');
showHourBar = showHourBar === null ? true : showHourBar === 'true';

let showDigitalClock = localStorage.getItem('showDigitalClock');
showDigitalClock = showDigitalClock === null ? true : showDigitalClock === 'true';

let showProgressBar = localStorage.getItem('showProgressBar');
showProgressBar = showProgressBar === null ? true : showProgressBar === 'true';

let showNumbers = localStorage.getItem('showNumbers');
showNumbers = showNumbers === null ? true : showNumbers === 'true';

let showHourNumbers = localStorage.getItem('showHourNumbers');
showHourNumbers = showHourNumbers === null ? true : showHourNumbers === 'true';

let lightMode = localStorage.getItem('lightMode') === 'true';
let progressHue = parseInt(localStorage.getItem('progressHue'));
if (isNaN(progressHue)) progressHue = 60;
let progressSaturation = parseInt(localStorage.getItem('progressSaturation'));
if (isNaN(progressSaturation)) progressSaturation = 50;
let nightFilter = parseFloat(localStorage.getItem('nightFilter'));
if (isNaN(nightFilter)) nightFilter = 0;

let lastHourPlayed = null;
let lastQuarterPlayed = null;
let lastMinutePlayed = null;
let isTick = true; // true for tick, false for tock

// Initialize audio context on first user interaction
let audioInitialized = false;
const gainNode = new Tone.Gain(volume).toDestination();
// Single synth used for the tick/tock sound so we don't create a new
// instance every second. Constantly creating synthesizers can cause
// memory buildup and audio stuttering after long periods of time.
const tickSynth = new Tone.Synth({
    oscillator: { type: "sine" },
    envelope: {
        attack: 0.01,
        decay: 0.02,
        sustain: 0,
        release: 0.105
    }
}).connect(gainNode);

function initializeAudio() {
    if (!audioInitialized) {
        Tone.start();
        audioInitialized = true;
    }
}

// Resume the audio context on the first user gesture
function handleFirstGesture() {
    initializeAudio();
    document.removeEventListener('touchstart', handleFirstGesture);
    document.removeEventListener('click', handleFirstGesture);
}

document.addEventListener('touchstart', handleFirstGesture, { once: true });
document.addEventListener('click', handleFirstGesture, { once: true });

const settingsButton = document.getElementById('settings-button');
const settingsPanel = document.getElementById('settings-panel');
const hourlyCheckbox = document.getElementById('hourly-ding');
const quarterCheckbox = document.getElementById('quarter-ding');
const minuteCheckbox = document.getElementById('minute-ding');
const tickTockCheckbox = document.getElementById('tick-tock');
const volumeControl = document.getElementById('volume');
const hourBarCheckbox = document.getElementById('hour-bar-toggle');
const hourProgressBar = document.getElementById('hour-progress-bar');
const hourMarkers = document.getElementById('hour-markers');
const digitalClockCheckbox = document.getElementById('digital-clock-toggle');
const timeDisplay = document.getElementById('time-display');
const progressBarCheckbox = document.getElementById('progress-bar-toggle');
const progressBar = document.getElementById('progress-bar');
const numbersCheckbox = document.getElementById('numbers-toggle');
const markers = document.getElementById('markers');
const hourNumbersCheckbox = document.getElementById('hour-numbers-toggle');
const themeToggle = document.getElementById('theme-toggle');
const colorSlider = document.getElementById('color-slider');
const colorSliderRow = document.getElementById('color-slider-row');
const saturationSlider = document.getElementById('saturation-slider');
const saturationSliderRow = document.getElementById('saturation-slider-row');
const nightFilterSlider = document.getElementById('night-filter-slider');

settingsButton.addEventListener('click', () => {
    initializeAudio();
    settingsPanel.classList.toggle('visible');
});

// Close settings panel when clicking outside of it
document.addEventListener('click', (event) => {
    if (settingsPanel.classList.contains('visible') && 
        !settingsPanel.contains(event.target) && 
        !settingsButton.contains(event.target)) {
        settingsPanel.classList.remove('visible');
    }
});

hourlyCheckbox.checked = hourSound;
quarterCheckbox.checked = quarterSound;
minuteCheckbox.checked = minuteSound;
tickTockCheckbox.checked = secondTickTock;
volumeControl.value = volume;
hourBarCheckbox.checked = showHourBar;
digitalClockCheckbox.checked = showDigitalClock;
progressBarCheckbox.checked = showProgressBar;
numbersCheckbox.checked = showNumbers;
hourNumbersCheckbox.checked = showHourNumbers;
themeToggle.checked = lightMode;
colorSlider.value = progressHue;
saturationSlider.value = progressSaturation;
nightFilterSlider.value = nightFilter;
applyTheme();
updateHourBarVisibility();
updateDigitalClockVisibility();
updateProgressBarVisibility();
updateNumbersVisibility();
updateHourNumbersVisibility();

hourlyCheckbox.addEventListener('change', () => {
    hourSound = hourlyCheckbox.checked;
    localStorage.setItem('hourSound', hourSound);
});

quarterCheckbox.addEventListener('change', () => {
    quarterSound = quarterCheckbox.checked;
    localStorage.setItem('quarterSound', quarterSound);
});

minuteCheckbox.addEventListener('change', () => {
    minuteSound = minuteCheckbox.checked;
    localStorage.setItem('minuteSound', minuteSound);
});

tickTockCheckbox.addEventListener('change', () => {
    secondTickTock = tickTockCheckbox.checked;
    localStorage.setItem('secondTickTock', secondTickTock);
});

volumeControl.addEventListener('input', () => {
    volume = parseFloat(volumeControl.value);
    localStorage.setItem('volume', volume);
    gainNode.gain.value = volume;
});

hourBarCheckbox.addEventListener('change', () => {
    showHourBar = hourBarCheckbox.checked;
    localStorage.setItem('showHourBar', showHourBar);
    updateHourBarVisibility();
});

digitalClockCheckbox.addEventListener('change', () => {
    showDigitalClock = digitalClockCheckbox.checked;
    localStorage.setItem('showDigitalClock', showDigitalClock);
    updateDigitalClockVisibility();
});

progressBarCheckbox.addEventListener('change', () => {
    showProgressBar = progressBarCheckbox.checked;
    localStorage.setItem('showProgressBar', showProgressBar);
    updateProgressBarVisibility();
});

numbersCheckbox.addEventListener('change', () => {
    showNumbers = numbersCheckbox.checked;
    localStorage.setItem('showNumbers', showNumbers);
    updateNumbersVisibility();
});

hourNumbersCheckbox.addEventListener('change', () => {
    showHourNumbers = hourNumbersCheckbox.checked;
    localStorage.setItem('showHourNumbers', showHourNumbers);
    updateHourNumbersVisibility();
});

themeToggle.addEventListener('change', () => {
    lightMode = themeToggle.checked;
    localStorage.setItem('lightMode', lightMode);
    applyTheme();
});

colorSlider.addEventListener('input', () => {
    progressHue = parseInt(colorSlider.value);
    localStorage.setItem('progressHue', progressHue);
    updateAccentColor();
});

saturationSlider.addEventListener('input', () => {
    progressSaturation = parseInt(saturationSlider.value);
    localStorage.setItem('progressSaturation', progressSaturation);
    updateAccentColor();
});

nightFilterSlider.addEventListener('input', () => {
    nightFilter = parseFloat(nightFilterSlider.value);
    localStorage.setItem('nightFilter', nightFilter);
    updateNightFilter();
});

document.getElementById('test-hourly').addEventListener('click', () => {
    initializeAudio();
    playHourlyChirp();
});
document.getElementById('test-quarter').addEventListener('click', () => {
    initializeAudio();
    playQuarterChirp();
});
document.getElementById('test-minute').addEventListener('click', () => {
    initializeAudio();
    playMinuteChirp();
});
document.getElementById('test-tick-tock').addEventListener('click', () => {
    initializeAudio();
    playTickTock();
});

function playHourlyChirp() {
    // Create a 3-note melody using FatOscillator as per documentation
    const lowTone = new Tone.FatOscillator("E3", "triangle", 40);
    const midTone = new Tone.FatOscillator("F3", "triangle", 60);
    const highTone = new Tone.FatOscillator("G3", "sine", 30);
    
    const envelope = new Tone.AmplitudeEnvelope({
        attack: 0.8,
        decay: 0.3,
        sustain: 0.7,
        release: 7.4
    }).connect(gainNode);
    
    lowTone.connect(envelope);
    midTone.connect(envelope);
    highTone.connect(envelope);
    
    // Play 3-note melody: C-E-G
    lowTone.start();
    envelope.triggerAttackRelease(1.0);
    
    // Second note (E) after 1.2 second gap
    setTimeout(() => {
        midTone.start();
        envelope.triggerAttackRelease(1.0);
    }, 1200);
    
    // Third note (G) after 1.2 second gap
    setTimeout(() => {
        highTone.start();
        envelope.triggerAttackRelease(1.0);
    }, 2400);
    
    // Clean up oscillators after they finish
    setTimeout(() => {
        lowTone.dispose();
        midTone.dispose();
        highTone.dispose();
        envelope.dispose();
    }, 8000);
}

function playQuarterChirp() {
    // Create a 2-note descending melody for 15-minute sound
    const highTone = new Tone.FatOscillator("G3", "triangle", 40);
    const lowTone = new Tone.FatOscillator("E3", "triangle", 40);
    
    const envelope = new Tone.AmplitudeEnvelope({
        attack: 0.4,
        decay: 0.3,
        sustain: 0.7,
        release: 0.4
    }).connect(gainNode);
    
    highTone.connect(envelope);
    lowTone.connect(envelope);
    
    // Play 2-note descending melody: G-E
    highTone.start();
    envelope.triggerAttackRelease(0.4);
    
    // Second note (E) after 1.2 second gap
    setTimeout(() => {
        lowTone.start();
        envelope.triggerAttackRelease(0.6);
    }, 900);
    
    // Clean up oscillators after they finish
    setTimeout(() => {
        highTone.dispose();
        lowTone.dispose();
        envelope.dispose();
    }, 2000);
}

function playMinuteChirp() {
    // Create a double chirp for minute sound, similar to tick-tock
    const chirp = new Tone.Synth({
        oscillator: {
            type: "sine"
        },
        envelope: {
            attack: 0.01,
            decay: 0.02,
            sustain: 0,
            release: 0.1
        }
    }).connect(gainNode);
    
    // First chirp
    chirp.triggerAttackRelease("E4", "8n");
    
    // Second chirp after short delay
    setTimeout(() => {
        chirp.triggerAttackRelease("E4", "8n");
    }, 200);
}

function playTickTock() {
    // Reuse the same synth instance and simply change the note. This
    // avoids allocating new Tone.Synth objects every second.
    const note = isTick ? "C4" : "C3";
    tickSynth.triggerAttackRelease(note, "8n");
    isTick = !isTick; // Alternate between tick and tock
}

function updateProgress() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    const progressPercent = (totalSeconds / 86400) * 100;
    document.getElementById('progress').style.width = progressPercent + '%';

    const hourProgressPercent = ((minutes * 60 + seconds) / 3600) * 100;
    document.getElementById('hour-progress').style.width = hourProgressPercent + '%';

    const timeString = now.toLocaleTimeString('en-US', { hour12: false });
    document.getElementById('time-display').textContent = timeString;

    if (hourSound && minutes === 0 && seconds === 0 && hours !== lastHourPlayed) {
        playHourlyChirp();
        lastHourPlayed = hours;
    }
    const quarter = Math.floor(minutes / 15);
    if (quarterSound && minutes % 15 === 0 && seconds === 0 && quarter !== lastQuarterPlayed) {
        playQuarterChirp();
        lastQuarterPlayed = quarter;
    }
    if (minuteSound && seconds === 0 && minutes !== lastMinutePlayed) {
        playMinuteChirp();
        lastMinutePlayed = minutes;
    }
    
    // Tick tock every second
    if (secondTickTock) {
        playTickTock();
    }
}

function createMarkers() {
    const markersContainer = document.getElementById('markers');
    for (let i = 0; i <= 24; i++) {
        const marker = document.createElement('div');
        marker.classList.add('marker');
        if (i % 3 === 0) {
            marker.classList.add('marker-large');
        } else {
            marker.classList.add('marker-small');
        }
        if (i === 0) {
            marker.classList.add('marker-start');
        } else if (i === 24) {
            marker.classList.add('marker-end');
        }
        marker.style.left = (i / 24) * 100 + '%';

        const line = document.createElement('div');
        line.classList.add('marker-line');
        marker.appendChild(line);

        const label = document.createElement('div');
        label.classList.add('marker-label');
        label.textContent = i;
        marker.appendChild(label);

        markersContainer.appendChild(marker);
    }
}

function createHourMarkers() {
    const container = document.getElementById('hour-markers');
    for (let i = 0; i <= 60; i += 5) {
        const marker = document.createElement('div');
        marker.classList.add('marker');
        if (i % 15 === 0) {
            marker.classList.add('marker-large');
        } else {
            marker.classList.add('marker-small');
        }
        marker.style.left = (i / 60) * 100 + '%';

        if (i % 15 === 0 || i === 5 || i === 10 || i === 20 || i === 25 || i === 35 || i === 40 || i === 50 || i === 55) {
            const label = document.createElement('div');
            label.classList.add('marker-label');
            label.textContent = i;
            marker.appendChild(label);
        }

        const line = document.createElement('div');
        line.classList.add('marker-line');
        marker.appendChild(line);

        container.appendChild(marker);
    }
}

function updateHourBarVisibility() {
    hourProgressBar.style.display = showHourBar ? 'block' : 'none';
    hourMarkers.style.display = showHourBar ? 'block' : 'none';
    
    if (!showHourBar) {
        // If hour bar is hidden, also hide the hour marker numbers
        showHourNumbers = false;
        hourNumbersCheckbox.checked = false;
        localStorage.setItem('showHourNumbers', false);
        updateHourNumbersVisibility();
    } else {
        // If hour bar is shown, also show the hour marker numbers
        showHourNumbers = true;
        hourNumbersCheckbox.checked = true;
        localStorage.setItem('showHourNumbers', true);
        updateHourNumbersVisibility();
    }
}

function updateDigitalClockVisibility() {
    timeDisplay.style.display = showDigitalClock ? 'block' : 'none';
}

function updateProgressBarVisibility() {
    progressBar.style.display = showProgressBar ? 'block' : 'none';
    
    if (!showProgressBar) {
        // If progress bar is hidden, also hide the marker numbers and lines
        showNumbers = false;
        numbersCheckbox.checked = false;
        localStorage.setItem('showNumbers', false);
        updateNumbersVisibility();
        
        // Also hide the entire markers container (numbers + lines)
        markers.style.display = 'none';
    } else {
        // If progress bar is shown, show the markers container and numbers
        markers.style.display = 'block';
        showNumbers = true;
        numbersCheckbox.checked = true;
        localStorage.setItem('showNumbers', true);
        updateNumbersVisibility();
    }
}

function updateNumbersVisibility() {
    // Hide/show only the number labels, keep the lines visible
    const labels = markers.querySelectorAll('.marker-label');
    labels.forEach(label => {
        label.style.display = showNumbers ? 'block' : 'none';
    });
}

function updateHourNumbersVisibility() {
    // Hide/show only the hour marker number labels, keep the lines visible
    const hourLabels = hourMarkers.querySelectorAll('.marker-label');
    hourLabels.forEach(label => {
        label.style.display = showHourNumbers ? 'block' : 'none';
    });
}

function updateAccentColor() {
    const color = `hsl(${progressHue}, ${progressSaturation}%, 50%)`;
    document.documentElement.style.setProperty('--progress-hue', progressHue);
    document.documentElement.style.setProperty('--progress-saturation', progressSaturation + '%');
    document.documentElement.style.setProperty('--progress-color', color);
    colorSlider.style.accentColor = color;
    colorSlider.style.background = `linear-gradient(to right,
        hsl(0, ${progressSaturation}%, 50%),
        hsl(60, ${progressSaturation}%, 50%),
        hsl(120, ${progressSaturation}%, 50%),
        hsl(180, ${progressSaturation}%, 50%),
        hsl(240, ${progressSaturation}%, 50%),
        hsl(300, ${progressSaturation}%, 50%),
        hsl(360, ${progressSaturation}%, 50%)
    )`;
}

function updateNightFilter() {
    document.documentElement.style.setProperty('--night-filter', nightFilter);
}

function applyTheme() {
    if (lightMode) {
        document.body.classList.add('light-mode');
    } else {
        document.body.classList.remove('light-mode');
    }
    updateAccentColor();
    updateNightFilter();
}

createMarkers();
createHourMarkers();
updateProgress();
setInterval(updateProgress, 1000); // update every second
