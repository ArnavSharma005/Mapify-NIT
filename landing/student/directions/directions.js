let latt = 29.947001, lngg = 76.816805;
let map;
let routingControl;
let loclist = document.getElementById('loclist');

// Remove Google Maps loading function since we'll use Leaflet CDN
// Make sure to include Leaflet and Leaflet Routing Machine in your HTML:
// <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
// <link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css" />
// <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
// <script src="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js"></script>

function initMap() {
    // Initialize Leaflet map
    map = L.map('map').setView([29.946076, 76.817682], 16);

    // Add satellite tile layer
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 18
    }).addTo(map);

    // Load locations for the list
    fetch('../locations.json')
        .then(response => response.json())
        .then(data => {
            data.places.forEach(element => {
                loclist.innerHTML += `<li><a href="#" onclick="onClickHandler(this)">${element.name}</a></li>`;
            });
        })
        .catch(error => {
            console.error('Error loading locations:', error);
        });

    // Get user's current location and show directions
    navigator.geolocation.watchPosition(
        function (position) {
            latt = position.coords.latitude;
            lngg = position.coords.longitude;

            // Get destination from localStorage
            const targetLat = parseFloat(localStorage.getItem('targetLat'));
            const targetLng = parseFloat(localStorage.getItem('targetLng'));

            if (targetLat && targetLng) {
                showDirections(latt, lngg, targetLat, targetLng);
            } else {
                console.error('No destination coordinates found in localStorage');
            }
        },
        function (error) {
            console.log("Geolocation error occurred. Error code: " + error.code);
            // Fallback to default coordinates if geolocation fails
            const targetLat = parseFloat(localStorage.getItem('targetLat'));
            const targetLng = parseFloat(localStorage.getItem('targetLng'));
            
            if (targetLat && targetLng) {
                showDirections(latt, lngg, targetLat, targetLng);
            }
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );
}

function showDirections(startLat, startLng, endLat, endLng) {
    // Remove existing routing control if it exists
    if (routingControl) {
        map.removeControl(routingControl);
    }

    // Create routing control for walking directions
    routingControl = L.Routing.control({
        waypoints: [
            L.latLng(startLat, startLng),
            L.latLng(endLat, endLng)
        ],
        routeWhileDragging: false,
        addWaypoints: false,
        router: L.Routing.osrmv1({
            serviceUrl: 'https://router.project-osrm.org/route/v1',
            profile: 'foot' // Walking mode
        }),
        createMarker: function(i, waypoint, n) {
            // Custom markers for start and end points
            const isStart = i === 0;
            const iconUrl = isStart ? 
                'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiM0Mjg1RjQiLz4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iNCIgZmlsbD0id2hpdGUiLz4KPC9zdmc+' : 
                'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiNFQTQzMzUiLz4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iNCIgZmlsbD0id2hpdGUiLz4KPC9zdmc+';
            
            return L.marker(waypoint.latLng, {
                icon: L.icon({
                    iconUrl: iconUrl,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                })
            }).bindPopup(isStart ? 'Your Location' : 'Destination');
        },
        lineOptions: {
            styles: [
                {color: '#4285F4', opacity: 0.8, weight: 6}
            ]
        },
        show: true,
        collapsible: true,
        collapsed: false
    }).addTo(map);

    // Handle routing events
    routingControl.on('routesfound', function(e) {
        console.log('Route found successfully');
        const routes = e.routes;
        const summary = routes[0].summary;
        
        // You can display route information here
        console.log('Distance:', (summary.totalDistance / 1000).toFixed(2) + ' km');
        console.log('Time:', Math.round(summary.totalTime / 60) + ' minutes');
    });

    routingControl.on('routingerror', function(e) {
        console.error('Routing error:', e.error);
        alert('Directions request failed. Try Again');
    });
}

function onClickHandler(element) {
    let str = element.innerHTML;
    let obj;

    fetch('../locations.json')
        .then(response => response.json())
        .then(data => {
            obj = data.places.find(el => el.name == str);
            if (obj) {
                localStorage.setItem('targetLat', obj.latitude);
                localStorage.setItem('targetLng', obj.longitude);
                location.reload();
            }
        })
        .catch(error => {
            console.error('Error loading locations:', error);
        });
}

// User management functionality remains the same
let username = document.getElementById('username');
let userrollno = document.getElementById('userrollno');
let logout = document.getElementById('logout');

let us = JSON.parse(localStorage.user);

username.innerHTML = us.name;
userrollno.innerHTML = us.roll_no;

logout.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '../../landing.html';
});

// Initialize map when page loads
document.addEventListener('DOMContentLoaded', function() {
    initMap();
});
