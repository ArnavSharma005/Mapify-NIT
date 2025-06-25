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

// Teacher management and UI functionality remains the same
let username = document.getElementById('username');
let logout = document.getElementById('logout');

let teacher = JSON.parse(localStorage.teacher);
username.innerHTML = teacher.name;

logout.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '../../landing.html';
});

async function removeClass(element) {
    let classid;
    const time = element.parentNode.childNodes[9].innerHTML.split(' - ')[0].replaceAll(':', '_');
    const branch = element.parentNode.childNodes[5].innerHTML.split(' - ')[0];
    const section = element.parentNode.childNodes[5].innerHTML.split(' - ')[1][0];
    const subsection = element.parentNode.childNodes[5].innerHTML.split(' - ')[1][1];
    
    await fetch(`http://localhost:3000/timetable/${day}/${branch}/${section}/${subsection}/${time}`)
        .then(response => response.json())
        .then(data => {
            classid = data[0]._id;
        })
        .catch(err => console.log(err));

    await fetch(`http://localhost:3000/timetable/${classid}`, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(err => console.log(err));

    window.location.reload();
}

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

    fetch(`http://localhost:3000/timetable/${dayName}`)
        .then(response => response.json())
        .then(data => {
            data.forEach(cls => {
                if (cls.start_time <= time && time <= cls.end_time) {
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

let addbtn = document.getElementById('addbtn');
let loc_select = document.getElementById('loc_select');
let branch_select = document.getElementById('branch_select');
let sub_select = document.getElementById('sub_select');

addbtn.addEventListener('click', async () => {
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
    
    let thatdate = new Date(date.value);
    let dayNumber = thatdate.getDay();
    let daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let dayName = daysOfWeek[dayNumber];
    let time = date.value.split('T')[1].concat(':00');
    let sec;
    
    if (sub_select.value <= 12)
        sec = 'C';
    if (sub_select.value <= 8)
        sec = 'B';
    if (sub_select.value <= 4)
        sec = 'A';

    let timeString = time;
    let currentDate = new Date();
    currentDate.setHours(timeString.substr(0, 2));
    currentDate.setMinutes(timeString.substr(3, 2));
    currentDate.setSeconds(timeString.substr(6, 2));
    currentDate.setTime(currentDate.getTime() + (55 * 60 * 1000));
    let newTimeString = currentDate.toTimeString().substring(0, 8);

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
            console.error('Error loading timetable:', error);
        });

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
