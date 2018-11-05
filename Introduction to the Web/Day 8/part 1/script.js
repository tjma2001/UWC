window.onload = function() {
    show('login-form')

    try {
        getToken()
        show('journey-form')
    } catch (error) {
        console.log("Unable to get token. There was an error")
    }

    loadMap()
    loadButtonEvents()   
}

function loadMap() {
    mapboxgl.accessToken = 'pk.eyJ1IjoidXdjbGVjdHVyZXIiLCJhIjoiY2ptdWJ6aWt1MGQ4aDN3bzhiM2V1dnRiYyJ9.lWYq773rwVmRzbyHcYAVHw'
    window.map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v10',
        center: [18.4241, -33.9249], // starting position [lng, lat]
        zoom: 9
    })

    window.startPin = new mapboxgl.Marker({ draggable: true }).setLngLat([0, 0]).addTo(window.map)
    window.destinationPin = new mapboxgl.Marker({ draggable: true }).setLngLat([0, 0]).addTo(window.map)

    window.map.on('click', function (event) {
        console.log(event)
        if(window.startPoint == true) {
            window.destinationPin.setLngLat(event.lngLat)
            window.startPoint = false
            document.getElementById('destination').value = event.lngLat.lng + ',' + event.lngLat.lat 
        } else {
            window.startPin.setLngLat(event.lngLat)
            window.startPoint = true
            document.getElementById('start').value = event.lngLat.lng + ',' + event.lngLat.lat
        }
    })

}

function loadButtonEvents() {
    var submitButton = document.getElementById('submit')
    submitButton.addEventListener('click', function (event) {
        event.preventDefault()

        var clientId = getClientId()
        var clientSecret = getClientSecret()

        login(clientId, clientSecret)
    })

    var submitAgenciesButton = document.getElementById('submit-agency')
    submitAgenciesButton.addEventListener('click', function (event) {
        event.preventDefault()

        var agencies = document.getElementById('agencies-select')
        var selectedAgency = agencies.options[agencies.selectedIndex].value

        getLines(getToken(), selectedAgency)
    })

    var logoutButton = document.getElementById('submit-logout')
    logoutButton.addEventListener('click', function (event){
        event.preventDefault()

        localStorage.removeItem('token')
        localStorage.removeItem('storageDate')

        show('login-form')
    })

    var journeyButton = document.getElementById('submit-journey')
    journeyButton.addEventListener('click', function (event) {
        event.preventDefault()
        var start = document.getElementById('start').value
        var destination = document.getElementById('destination').value

        var token = getToken()
        getJourney(token)
    })
}

function show(formId) {
    document.getElementById('login-form').style.display = 'none'
    document.getElementById('agencies-form').style.display = 'none'
    document.getElementById('lines-form').style.display = 'none'
    document.getElementById('logout-form').style.display = 'none'
    document.getElementById('map-form').style.display = 'none'
    document.getElementById('journey-form').style.display = 'none'

    document.getElementById(formId).style.display = 'block'

    if(formId != 'login-form') {
        document.getElementById('logout-form').style.display = 'block'
        document.getElementById('map-form').style.display = 'block'
    }
}

function getToken() {
    var token = this.localStorage.getItem('token')
    if(token == null || token == undefined || token == 'undefined') {
        throw new Error("Invalid token")
    } else {
        return token
    }
}

function getClientId() {
    var clientId = document.getElementById('client-id')
    return clientId.value
}

function getClientSecret() {
    var clientSecret = document.getElementById('client-secret')
    return clientSecret.value
}

function login(clientId, clientSecret) {
    //From whereismytransport developer page
    var CLIENT_ID = clientId;
    var CLIENT_SECRET = clientSecret;
    var payload = {
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'grant_type': 'client_credentials',
        'scope': 'transportapi:all'
    };
    var request = new XMLHttpRequest();
    request.open('POST', 'https://identity.whereismytransport.com/connect/token', true);
    request.addEventListener('load', function () {
        var response = JSON.parse(this.responseText);
        var token = response.access_token;
        window.token = token;

        if(this.status == 200) {
            localStorage.setItem('token', token)
            localStorage.setItem('storageDate', Date.now().toLocaleString())

            show('journey-form')
        } else {
            console.log("get token call failed")
        }
    });
    request.setRequestHeader('Accept', 'application/json');
    var formData = new FormData();

    for (var key in payload) {
        formData.append(key, payload[key]);
    }

    request.send(formData);
}

function getAgencies(token) {
    var request = new XMLHttpRequest();
    request.addEventListener('load', function () {
        var response = JSON.parse(this.responseText);
        addAgenciesToDropDown(response)
    });
    request.open('GET', 'https://platform.whereismytransport.com/api/agencies', true);
    request.setRequestHeader('Accept', 'application/json');
    request.setRequestHeader('Authorization', 'Bearer ' + token);
    request.send();
}

function addAgenciesToDropDown(agenciesList) {
    var agenciesSelect = document.getElementById('agencies-select')
    agenciesSelect.options.length = 0
    agenciesSelect.options.add(new Option("Select an option", null, true, false))
    
    agenciesList.forEach(function(agency) {
        agenciesSelect.options.add(new Option(agency.name, agency.id, false, false))
    })
}

function getLines(token, agency)  {
    var request = new XMLHttpRequest();
    request.addEventListener('load', function () {
        var response = JSON.parse(this.responseText);
        show('lines-form')
        addLinesToDropdown(response)
    });
    request.open('GET', 'https://platform.whereismytransport.com/api/lines?agencies=' + agency, true);
    request.setRequestHeader('Accept', 'application/json');
    request.setRequestHeader('Authorization', 'Bearer ' + token);
    request.send();
}

function addLinesToDropdown(linesList) {
    var linesSelect = document.getElementById('lines-select')
    linesSelect.options.length = 0
    linesSelect.options.add(new Option("Select an option", null, true, false))
    
    linesList.forEach(function(line) {
        linesSelect.options.add(new Option(line.name, line.id, false, false))
    })
}

function getJourney(token) {
    var request = new XMLHttpRequest();
    var payload = {
        "geometry": {
            "type": "MultiPoint",
            "coordinates": [
                [
                    18.37755,
                    -33.94393
                ],
                [
                    18.41489,
                    -33.91252
                ]
            ]
        },
        "maxItineraries": 5
    }

    request.addEventListener('load', function () {
        var response = JSON.parse(this.responseText);
        console.log(response)
    });
    request.open('POST', 'https://platform.whereismytransport.com/api/journeys', true);
    request.setRequestHeader('Accept', 'application/json');
    request.setRequestHeader('Content-Type', 'application/json');
    request.setRequestHeader('Authorization', 'Bearer ' + token);
    request.send(JSON.stringify(payload));
}