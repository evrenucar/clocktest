function updateProgress() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    const progressPercent = (totalSeconds / 86400) * 100; // 24*60*60 = 86400
    document.getElementById('progress').style.width = progressPercent + '%';

    const timeString = now.toLocaleTimeString('en-US', { hour12: false });
    document.getElementById('time-display').textContent = timeString;
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
        label.textContent = i;
        marker.appendChild(label);

        markersContainer.appendChild(marker);
    }
}

createMarkers();
updateProgress();
setInterval(updateProgress, 1000); // update every second
