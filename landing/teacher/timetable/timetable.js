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
const user = JSON.parse(localStorage.getItem('teacher'));
console.log(user);

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
        iconUrl: 'marker.png',
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

    // Load teacher's timetable
    let name = user.name.replaceAll(' ', '_');

    fetch(`http://localhost:3000/timetable/${day}/${name}`)
        .then(response => response.json())
        .then(data => {
            // Display timetable data
            data.forEach(el => {
                table.innerHTML += `
                <div id="data">
                    <img src="./marker100.png" alt="marker">
                    <div class="details">
                        <h4 id="sub">${el.subject}</h4>
                        <h4 id="type">(${el.type})</h4>
                        <h4 id="branchsec">${el.branch} - ${el.section}${el.subsection}</h4>
                        <h4 id="loc">${el.location}</h4>
                        <h4 id="time">${el.start_time} - ${el.end_time}</h4>
                        <button class="remclass" onclick="removeClass(this)">Remove Class</button>
                    </div>
                </div>
                `;
            });

            // Add markers for each class location
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
                            // Create Leaflet marker
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

                            // Bind popup to marker
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
        .catch(error => {
            console.error('Error loading timetable:', error);
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
                window.location.href = '../directions/directions.html';
            }
        })
        .catch(error => {
            console.error('Error finding location:', error);
        });
}

// Teacher management functionality
let username = document.getElementById('username');
let logout = document.getElementById('logout');

let teacher = JSON.parse(localStorage.teacher);
username.innerHTML = teacher.name;

logout.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '../../landing.html';
});

// Remove class functionality
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

// Date change event for location conflict checking
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
            console.error('Error loading timetable for conflict check:', error);
        });
});

// Add class functionality
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

    // Process date and time
    let thatdate = new Date(date.value);
    let dayNumber = thatdate.getDay();
    let daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let dayName = daysOfWeek[dayNumber];
    let time = date.value.split('T')[1].concat(':00');
    
    // Determine section
    let sec;
    if (sub_select.value <= 12)
        sec = 'C';
    if (sub_select.value <= 8)
        sec = 'B';
    if (sub_select.value <= 4)
        sec = 'A';

    // Calculate end time
    let timeString = time;
    let currentDate = new Date();
    currentDate.setHours(timeString.substr(0, 2));
    currentDate.setMinutes(timeString.substr(3, 2));
    currentDate.setSeconds(timeString.substr(6, 2));
    currentDate.setTime(currentDate.getTime() + (55 * 60 * 1000));
    let newTimeString = currentDate.toTimeString().substring(0, 8);

    // Find subject for teacher
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
