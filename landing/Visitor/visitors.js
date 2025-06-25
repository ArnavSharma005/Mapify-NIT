let locations;
let loclist = document.getElementById('loclist');
let map;

function initMap() {
    // Initialize Leaflet map
    map = L.map('map').setView([29.946076, 76.817682], 16);

    // Add satellite tile layer (using Esri World Imagery)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 18,
        minZoom: 15
    }).addTo(map);

    // Custom marker icon
    const customIcon = L.icon({
        iconUrl: 'marker.png',
        iconSize: [20, 32],
        iconAnchor: [10, 32],
        popupAnchor: [0, -32]
    });

    fetch('./locations.json')
        .then(response => response.json())
        .then(data => {
            data.places.forEach(element => {
                loclist.innerHTML += `<li><a href="#" onclick="onClickHandler(this)">${element.name}</a></li>`;

                // Create Leaflet marker with drop animation effect
                const marker = L.marker([element.latitude, element.longitude], {
                    icon: customIcon,
                    title: element.name
                }).addTo(map);

                // Create popup content (fixed the missing closing tag)
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

                // Add click event for additional functionality if needed
                marker.on('click', function(e) {
                    // Popup opens automatically with bindPopup
                    console.log('Marker clicked:', element.name);
                });

                // Simulate drop animation by adding marker with delay
                setTimeout(() => {
                    marker.addTo(map);
                }, Math.random() * 500); // Random delay for drop effect
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
            }
        })
        .catch(error => {
            console.error('Error finding location:', error);
        });
}

// Logout functionality remains the same
let logout = document.getElementById('logout');
logout.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '../landing.html';
});

// Initialize map when page loads
document.addEventListener('DOMContentLoaded', function() {
    initMap();
});
