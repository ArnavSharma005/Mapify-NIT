let locations;
let loclist = document.getElementById('loclist');
let map;

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
                });

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

// Teacher management functionality remains the same
let username = document.getElementById('username');
let logout = document.getElementById('logout');

let teacher = JSON.parse(localStorage.teacher);
username.innerHTML = teacher.name;

logout.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '../landing.html';
});

// Date change event handler for timetable conflict checking
let date = document.getElementsByClassName('date')[0];

date.addEventListener('change', async () => {
    for (let i = 1; i < loc_select.childNodes.length; i += 2) {
        loc_select.childNodes[i].style.background = 'white';
    }

    let thatdate = new Date(date.value);
    let dayNumber = thatdate.getDay();
    let daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let dayName = daysOfWeek[dayNumber];
    let time = date.value.split('T')[1].concat(':00');
    console.log(dayName);

    fetch(`http://localhost:3000/timetable/${dayName}`)
        .then(response => response.json())
        .then(data => {
            data.forEach(cls => {
                if (cls.start_time <= time && time <= cls.end_time) {
                    console.log(cls);
                    let place = cls.location;
                    for (let i = 1; i < loc_select.childNodes.length; i += 2) {
                        if (loc_select.childNodes[i].value == place) {
                            loc_select.childNodes[i].style.background = 'red';
                        }
                    }
                }
            });
        })
        .catch(error => {
            console.error('Error loading timetable:', error);
        });
});

// Class scheduling functionality
let addbtn = document.getElementById('addbtn');
let loc_select = document.getElementById('loc_select');
let branch_select = document.getElementById('branch_select');
let sub_select = document.getElementById('sub_select');

addbtn.addEventListener('click', async () => {
    // Form validation
    if (branch_select.value == '') {
        alert('Select Branch');
        return false;
    }
    if (sub_select.value == '') {
        alert('Select Subsection');
        return false;
    }
    if (date.value == '') {
        alert('Select Date');
        return false;
    }
    if (loc_select.value == '') {
        alert('Select Location');
        return false;
    }

    // Date and time processing
    let thatdate = new Date(date.value);
    let dayNumber = thatdate.getDay();
    let daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let dayName = daysOfWeek[dayNumber];
    let time = date.value.split('T')[1].concat(':00');
    
    // Section determination logic
    let sec;
    if (sub_select.value <= 12)
        sec = 'C';
    if (sub_select.value <= 8)
        sec = 'B';
    if (sub_select.value <= 4)
        sec = 'A';

    // Calculate end time (55 minutes after start time)
    let timeString = time;
    let currentDate = new Date();
    currentDate.setHours(timeString.substr(0, 2));
    currentDate.setMinutes(timeString.substr(3, 2));
    currentDate.setSeconds(timeString.substr(6, 2));
    currentDate.setTime(currentDate.getTime() + (55 * 60 * 1000));
    let newTimeString = currentDate.toTimeString().substring(0, 8);

    // Find subject for the teacher
    let sub, flag = true;
    await fetch(`http://localhost:3000/timetable`)
        .then(response => response.json())
        .then(data => {
            data.forEach(cls => {
                if (flag && cls.teacher == teacher.name && cls.branch == branch_select.value && cls.section == sec) {
                    sub = cls.subject;
                    flag = false;
                }
            });
        })
        .catch(error => {
            console.error('Error loading timetable for subject lookup:', error);
        });

    // Create class object
    const myClass = {
        "subject": sub,
        "type": "Lecture",
        "location": loc_select.value,
        "day": dayName,
        "start_time": time,
        "end_time": newTimeString,
        "teacher": teacher.name,
        "branch": branch_select.value,
        "section": sec,
        "subsection": sub_select.value
    };

    console.log(myClass);

    // Add class to database
    await fetch('http://localhost:3000/timetable/', {
        method: 'POST',
        body: JSON.stringify(myClass),
        headers: { 'Content-Type': 'application/json' },
    })
        .then(response => response.json())
        .then(data => alert('Class Added'))
        .catch(error => console.error(error));

    window.location.reload();
});

// Initialize map when page loads
document.addEventListener('DOMContentLoaded', function() {
    initMap();
});
