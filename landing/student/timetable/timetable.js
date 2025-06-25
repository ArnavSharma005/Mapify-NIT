let locations;
let loclist = document.getElementById('loclist');
let sub = document.getElementById('sub');
let loc = document.getElementById('loc');
let time = document.getElementById('time');
let type = document.getElementById('type');
let table = document.getElementsByClassName('table');
table = table[0];
let map;

let today = new Date();
let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
let day = days[today.getDay()];
const user = JSON.parse(localStorage.getItem('user'));

// Remove Google Maps loading function since we'll use Leaflet CDN
// Make sure to include Leaflet CSS and JS in your HTML:
// <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
// <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

function initMap() {
    // Initialize Leaflet map
    map = L.map('map').setView([29.946076, 76.817682], 16);

    // Add satellite tile layer
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 18
    }).addTo(map);

    // Custom marker icon
    const customIcon = L.icon({
        iconUrl: '../marker.png',
        iconSize: [20, 32],
        iconAnchor: [10, 32],
        popupAnchor: [0, -32]
    });

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

    // Calculate user section
    let subsec = user.subsection;
    subsec = Number(subsec);
    let sec;
    if (subsec <= 12)
        sec = 'C';
    if (subsec <= 8)
        sec = 'B';
    if (subsec <= 4)
        sec = 'A';

    // Load timetable data
    fetch(`http://localhost:3000/timetable/${day}/${user.branch}/${sec}/${subsec}`)
        .then(response => response.json())
        .then(data => {
            data.forEach(el => {
                table.innerHTML += `
                <div id="data">
                    <img src="./marker100.png" alt="marker">
                    <div class="details">
                        <h4 id="sub">${el.subject}</h4>
                        <h4 id="type">(${el.type})</h4>
                        <h4 id="loc">${el.location}</h4>
                        <h4 id="time">${el.start_time} - ${el.end_time}</h4>
                    </div>
                </div>
                `;
            });

            // Add markers for timetable locations
            data.forEach(el => {
                let loc = el.location;
                let element;
                fetch('../locations.json')
                    .then(response => response.json())
                    .then(dt => {
                        dt.places.forEach(i => {
                            if (i.name == loc)
                                element = i;
                        });

                        if (element) {
                            const marker = L.marker([element.latitude, element.longitude], {
                                icon: customIcon,
                                title: element.name
                            }).addTo(map);

                            // Create popup content
                            const popupContent = 
                                '<div class="info-window-content">' +
                                '<h2>' + element.name + '</h2>' +
                                '<img src="https://www.mystudyindia.com/storage/colleges/medias/aTSlBx_1618989003.webp" style="width: 100%; max-width: 300px;"/>' +
                                '</div>';

                            marker.bindPopup(popupContent, {
                                maxWidth: 350,
                                className: 'custom-popup'
                            });

                            // Simulate drop animation
                            setTimeout(() => {
                                marker.addTo(map);
                            }, Math.random() * 500);
                        }
                    })
                    .catch(error => {
                        console.error('Error loading location data:', error);
                    });
            });
        })
        .catch(err => console.log(err));

    // Load club meetings data
    fetch(`http://localhost:3000/clubdb`)
        .then(response => response.json())
        .then(data => {
            data.forEach(club => {
                let rollArray = club.roll_no;
                let meetArray = club.meetings;
                
                for (let i = 0; i < rollArray.length; i++) {
                    if (us.roll_no == rollArray[i].roll_no) { // Fixed property access
                        for (let j = 0; j < meetArray.length; j++) {
                            let m = meetArray[j];
                            let today = new Date();
                            let meetdate = new Date(m.date);
                            
                            if (today.getTime() <= meetdate.getTime()) {
                                meets.innerHTML += `
                                <div id="data">
                                    <img src="./marker100.png" alt="marker">
                                    <div class="details">
                                        <h4 id="sub">${club.name}</h4>
                                        <h4 id="type">at ${m.location}</h4>
                                        <h4 id="loc">on ${m.date} at ${m.time}</h4>
                                        <h4 id="time">${m.agenda}</h4>
                                    </div>
                                </div>
                                `;
                                
                                let element;
                                fetch('../locations.json')
                                    .then(response => response.json())
                                    .then(data => {
                                        data.places.forEach(i => {
                                            if (i.name == m.location) {
                                                element = i;
                                            }
                                        });
                                        
                                        if (element) {
                                            const marker = L.marker([element.latitude, element.longitude], {
                                                icon: customIcon,
                                                title: element.name
                                            }).addTo(map);

                                            const popupContent = 
                                                '<div class="info-window-content">' +
                                                '<h2>' + element.name + '</h2>' +
                                                '<img src="https://www.mystudyindia.com/storage/colleges/medias/aTSlBx_1618989003.webp" style="width: 100%; max-width: 300px;"/>' +
                                                '</div>';

                                            marker.bindPopup(popupContent, {
                                                maxWidth: 350,
                                                className: 'custom-popup'
                                            });
                                        }
                                    })
                                    .catch(error => {
                                        console.error('Error loading club location data:', error);
                                    });
                            }
                        }
                    }
                }
            });
        })
        .catch(err => console.log(err));
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
                window.location.href = '../directions/directions.html';
            }
        })
        .catch(error => {
            console.error('Error finding location:', error);
        });
}

// User management functionality
let username = document.getElementById('username');
let userrollno = document.getElementById('userrollno');
let logout = document.getElementById('logout');
let meets = document.getElementById('meets');

console.log(JSON.parse(localStorage.user));

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
