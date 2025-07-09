let hourlyDing = localStorage.getItem('hourlyDing') === 'true';
let quarterDing = localStorage.getItem('quarterDing') === 'true';
let volume = parseFloat(localStorage.getItem('volume')) || 0.5;
let lastHourPlayed = null;
let lastQuarterPlayed = null;

const settingsButton = document.getElementById('settings-button');
const settingsPanel = document.getElementById('settings-panel');
const hourlyCheckbox = document.getElementById('hourly-ding');
const quarterCheckbox = document.getElementById('quarter-ding');
const volumeControl = document.getElementById('volume');

settingsButton.addEventListener('click', () => {
    settingsPanel.classList.toggle('visible');
});

hourlyCheckbox.checked = hourlyDing;
quarterCheckbox.checked = quarterDing;
volumeControl.value = volume;

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
});

document.getElementById('test-hourly').addEventListener('click', playDing);
document.getElementById('test-quarter').addEventListener('click', playDoubleClick);

function playDing() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.value = volume;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
}

function playDoubleClick() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    function click(time) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(660, time);
        gain.gain.setValueAtTime(volume, time);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + 0.1);
    }
    const now = ctx.currentTime;
    click(now);
    click(now + 0.2);
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
        playDing();
        lastHourPlayed = hours;
    }
    const quarter = Math.floor(minutes / 15);
    if (quarterDing && minutes % 15 === 0 && seconds === 0 && quarter !== lastQuarterPlayed) {
        playDoubleClick();
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
            marker.classList.add("marker-start");
        } else if (i === 24) {
            marker.classList.add("marker-end");
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

createMarkers();
updateProgress();
setInterval(updateProgress, 1000); // update every second
