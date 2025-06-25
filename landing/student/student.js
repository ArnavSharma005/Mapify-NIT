let locations;
let loclist = document.getElementById('loclist');
let map;
let infoWindow;

// Remove Google Maps loading function since we'll use Leaflet CDN
// Make sure to include Leaflet CSS and JS in your HTML:
// <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
// <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

function initMap() {
    // Initialize Leaflet map
    map = L.map('map').setView([29.946076, 76.817682], 16);

    // Add satellite tile layer (using Esri World Imagery)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 18
    }).addTo(map);

    // Alternative: Use OpenStreetMap tiles
    // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    // }).addTo(map);

    // Custom marker icon
    const customIcon = L.icon({
        iconUrl: 'marker.png',
        iconSize: [20, 32],
        iconAnchor: [10, 32],
        popupAnchor: [0, -32]
    });

    // Set minimum zoom
    map.setMinZoom(15);

    fetch('./locations.json')
        .then(response => response.json())
        .then(data => {
            data.places.forEach(element => {
                loclist.innerHTML += `<li><a href="#" onclick="onClickHandler(this)">${element.name}</a></li>`;

                // Create Leaflet marker
                const marker = L.marker([element.latitude, element.longitude], {
                    icon: customIcon,
                    title: element.name
                }).addTo(map);

                // Create popup content
                const popupContent = 
                    '<div class="info-window-content">' +
                    '<h2>' + element.name + '</h2>' +
                    `<img src="${element.image}" style="width:400px; height:300px; max-width:100%; height:auto;"/>` +
                    '</div>';

                // Bind popup to marker
                marker.bindPopup(popupContent, {
                    maxWidth: 450,
                    className: 'custom-popup'
                });

                // Optional: Add click event (popup opens automatically with bindPopup)
                marker.on('click', function(e) {
                    // Additional click handling if needed
                    console.log('Marker clicked:', element.name);
                });
            });
        })
        .catch(error => {
            console.error('Error loading locations:', error);
        });
}

function onClickHandler(element) {
    let str = element.innerHTML;
    let obj;

    fetch('./locations.json')
        .then(response => response.json())
        .then(data => {
            obj = data.places.find(el => el.name == str);
            if (obj) {
                localStorage.setItem('targetLat', obj.latitude);
                localStorage.setItem('targetLng', obj.longitude);
                window.location.href = 'directions/directions.html';
                
                // Optional: Pan to location on map before navigating
                // map.setView([obj.latitude, obj.longitude], 18);
            }
        })
        .catch(error => {
            console.error('Error finding location:', error);
        });
}

// User management code remains the same
let username = document.getElementById('username');
let userrollno = document.getElementById('userrollno');
let logout = document.getElementById('logout');

let us = JSON.parse(localStorage.user);

username.innerHTML = us.name;
userrollno.innerHTML = us.roll_no;

logout.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '../landing.html';
});

// Responsive navbar code remains the same
let navb = document.querySelector('#menu');
let navbar = document.querySelector('#navbarid');

navb.onclick = () => {
    navb.classList.toggle('bx-x');
    navbar.classList.toggle('active');
};

// Initialize map when page loads
document.addEventListener('DOMContentLoaded', function() {
    initMap();
});
