let hourlyDing = localStorage.getItem('hourlyDing') === 'true';
let quarterDing = localStorage.getItem('quarterDing') === 'true';
let volume = parseFloat(localStorage.getItem('volume'));
if (isNaN(volume)) volume = 0.5;

let showHourBar = localStorage.getItem('showHourBar');
showHourBar = showHourBar === null ? true : showHourBar === 'true';

let showDigitalClock = localStorage.getItem('showDigitalClock');
showDigitalClock = showDigitalClock === null ? true : showDigitalClock === 'true';

let lastHourPlayed = null;
let lastQuarterPlayed = null;

const gainNode = new Tone.Gain(volume).toDestination();
const synth = new Tone.Synth().connect(gainNode);

const settingsButton = document.getElementById('settings-button');
const settingsPanel = document.getElementById('settings-panel');
const hourlyCheckbox = document.getElementById('hourly-ding');
const quarterCheckbox = document.getElementById('quarter-ding');
const volumeControl = document.getElementById('volume');
const hourBarCheckbox = document.getElementById('hour-bar-toggle');
const hourProgressBar = document.getElementById('hour-progress-bar');
const hourMarkers = document.getElementById('hour-markers');
const digitalClockCheckbox = document.getElementById('digital-clock-toggle');
const timeDisplay = document.getElementById('time-display');

settingsButton.addEventListener('click', () => {
    settingsPanel.classList.toggle('visible');
});

hourlyCheckbox.checked = hourlyDing;
quarterCheckbox.checked = quarterDing;
volumeControl.value = volume;
hourBarCheckbox.checked = showHourBar;
digitalClockCheckbox.checked = showDigitalClock;
updateHourBarVisibility();
updateDigitalClockVisibility();

hourlyCheckbox.addEventListener('change', () => {
    hourlyDing = hourlyCheckbox.checked;
    localStorage.setItem('hourlyDing', hourlyDing);
});

quarterCheckbox.addEventListener('change', () => {
    quarterDing = quarterCheckbox.checked;
    localStorage.setItem('quarterDing', quarterDing);
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

document.getElementById('test-hourly').addEventListener('click', playHourlyChirp);
document.getElementById('test-quarter').addEventListener('click', playQuarterChirp);

function playHourlyChirp() {
    synth.triggerAttackRelease('C4', 1);
}

function playQuarterChirp() {
    synth.triggerAttackRelease('G4', 0.3);
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

    if (hourlyDing && minutes === 0 && seconds === 0 && hours !== lastHourPlayed) {
        playHourlyChirp();
        lastHourPlayed = hours;
    }
    const quarter = Math.floor(minutes / 15);
    if (quarterDing && minutes % 15 === 0 && seconds === 0 && quarter !== lastQuarterPlayed) {
        playQuarterChirp();
        lastQuarterPlayed = quarter;
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

        if (i % 15 === 0) {
            const label = document.createElement('div');
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
}

function updateDigitalClockVisibility() {
    timeDisplay.style.display = showDigitalClock ? 'block' : 'none';
}

createMarkers();
createHourMarkers();
updateProgress();
setInterval(updateProgress, 1000); // update every second
