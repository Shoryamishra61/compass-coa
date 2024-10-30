// Constants
const TARGET = { lat: 12.8231, lng: 80.0442 }; // Target location (SRM Boys Hostel)
const STATUS_INDICATOR = document.querySelector('.status-indicator');
const HEADING_DISPLAY = document.getElementById('heading');
const DIRECTION_DISPLAY = document.getElementById('direction');
const DISTANCE_DISPLAY = document.getElementById('distance');
const COMPASS_ARROW = document.querySelector('.compass-arrow');
const TARGET_ARROW = document.querySelector('.target-arrow');
let currentPosition = null;

// Start Tracking
document.getElementById('calibrationButton').addEventListener('click', () => {
    document.getElementById('calibrationOverlay').style.display = 'none';
    initializeTracking();
});

async function initializeTracking() {
    // Ask for orientation permissions (iOS)
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission !== 'granted') return alert('Permission denied.');
    }
    initializeCompass();
    initializeGeolocation();
}

function initializeCompass() {
    window.addEventListener('deviceorientation', (event) => {
        const heading = event.webkitCompassHeading || 360 - event.alpha;
        updateCompassDisplay(heading);
    }, true);
}

function updateCompassDisplay(heading) {
    COMPASS_ARROW.style.transform = `rotate(${heading}deg)`;
    HEADING_DISPLAY.textContent = `${Math.round(heading)}°`;
    DIRECTION_DISPLAY.textContent = getCardinalDirection(heading);

    if (currentPosition) {
        const bearing = calculateBearing(
            currentPosition.coords.latitude,
            currentPosition.coords.longitude,
            TARGET.lat, TARGET.lng
        );
        TARGET_ARROW.style.transform = `rotate(${bearing}deg)`;
    }
}

function initializeGeolocation() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(updatePosition, handleLocationError, {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000
        });
    } else {
        alert('Geolocation is not supported by your browser');
    }
}

function updatePosition(position) {
    currentPosition = position;
    const distance = calculateDistance(
        position.coords.latitude, position.coords.longitude,
        TARGET.lat, TARGET.lng
    );
    DISTANCE_DISPLAY.textContent = `${Math.round(distance)} meters`;
    STATUS_INDICATOR.style.backgroundColor = '#4CAF50';
}

function handleLocationError(error) {
    alert(`Location error: ${error.message}`);
    STATUS_INDICATOR.style.backgroundColor = '#ff4444';
}

function getCardinalDirection(degrees) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(degrees / 45) % 8];
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ/2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function calculateBearing(lat1, lon1, lat2, lon2) {
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}
