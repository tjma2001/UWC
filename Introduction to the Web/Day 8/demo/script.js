window.onload = function () {
  show('login-form')

  try {
    getToken()
    show('journey-form')
  } catch (error) {
    show('login-form')
    console.log('no valid token found', error)
  }

  loadMap()
  loadButtonEvents()
}

function loadMap () {
  window.mapboxgl.accessToken = 'pk.eyJ1IjoidG1hcHBlciIsImEiOiJjaXhraXFiYXMwMDF5MzJwNmVldXRnZWdyIn0.kJ72HT7uR6Lo-kb7WsybiA'
  window.map = new window.mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v10',
    center: [18.405285, -33.909422],
    zoom: 10.5
  })

  window.start = new window.mapboxgl.Marker().setLngLat([0, 0]).addTo(window.map)
  window.destination = new window.mapboxgl.Marker().setLngLat([0, 0]).addTo(window.map)

  window.map.on('click', function (event) {
    console.log('map clicked,', event)

    // if we have already set the start, set the end
    if (window.startSet) {
      document.getElementById('destination').value = event.lngLat.lng + ',' + event.lngLat.lat
      window.destination.setLngLat(event.lngLat)
      window.startSet = false
    } else {
      document.getElementById('start').value = event.lngLat.lng + ',' + event.lngLat.lat
      window.start.setLngLat(event.lngLat)
      window.startSet = true
    }
  })
}

function loadButtonEvents () {
  var submitButton = document.getElementById('submit')
  submitButton.addEventListener('click', function (event) {
    event.preventDefault()

    var clientId = getClientId()
    var clientSecret = getClientSecret()

    login(clientId, clientSecret)
  })

  var logoutButton = document.getElementById('submit-logout')
  logoutButton.addEventListener('click', function (event) {
    event.preventDefault()
    logout()
  })

  var findButton = document.getElementById('submit-find')
  findButton.addEventListener('click', function (event) {
    event.preventDefault()
    try {
      var token = getToken()
      getJourney(token, getStart(), getDestination())
    } catch (error) {
      console.log('An error occurred redirecting back to home')
      console.log(error)
      show('login-form')
    }
  })
}

function getToken () {
  // CHECK if token exists in local storage
  var token = window.localStorage.getItem('token')
  if (typeof token === 'undefined' || token === 'undefined' || token == null) {
    window.localStorage.removeItem('token')
    throw new Error('No valid token')
  } else {
    return token
  }
}

function getClientId () {
  var clientId = document.getElementById('client-id')
  return clientId.value
}

function getClientSecret () {
  var clientSecret = document.getElementById('client-secret')
  return clientSecret.value
}

function getStart () {
  var start = document.getElementById('start').value

  // perform check to see if start is valid
  return start
}

function getDestination () {
  var destination = document.getElementById('destination').value

  // perform check to see if start is valid
  return destination
}

function getElement (elementId) {
  var element = document.getElementById(elementId).value
  var elementError = document.getElementById(elementId + '-error')

  if (element == null || element === undefined || element.trim() === '') {
    if (elementError) {
      elementError.classList.remove('is-invisisble')
    }
  }
  return element
}

function show (element) {
  document.getElementById('login-form').style.display = 'none'
  document.getElementById('journey-form').style.display = 'none'
  document.getElementById('logout-form').style.display = 'block'
  document.getElementById('map').style.display = 'block'

  document.getElementById(element).style.display = 'block'
  if (element === 'login-form') {
    document.getElementById('logout-form').style.display = 'none'
    document.getElementById('map').style.display = 'none'
  }
}

/**
 * Rest REQUESTS
 */

function login (clientId, clientSecret) {
  // From whereismytransport developer page
  var payload = {
    'client_id': clientId,
    'client_secret': clientSecret,
    'grant_type': 'client_credentials',
    'scope': 'transportapi:all'
  }

  var request = new window.XMLHttpRequest()
  request.open('POST', 'https://identity.whereismytransport.com/connect/token', true)
  request.addEventListener('load', function () {
    var response = JSON.parse(this.responseText)
    var token = response.access_token

    if (this.status === 200) {
      window.localStorage.setItem('token', token)
      window.localStorage.setItem('storageDate', Date.now().toLocaleString())

      show('journey-form')
    }
  })

  request.setRequestHeader('Accept', 'application/json')
  var formData = new window.FormData()

  for (var key in payload) {
    formData.append(key, payload[key])
  }

  request.send(formData)
}

function logout () {
  window.localStorage.removeItem('token')
  show('login-form')
}

function getAgencies (token) {
  var request = new window.XMLHttpRequest()
  request.addEventListener('load', function () {
    if (this.status === 401) {
      return logout()
    }
    var response = JSON.parse(this.responseText)
    addAgenciesToDropDown(response)
  })
  request.open('GET', 'https://platform.whereismytransport.com/api/agencies', true)
  request.setRequestHeader('Accept', 'application/json')
  request.setRequestHeader('Authorization', 'Bearer ' + token)
  request.send()
}

function getLines (token, agency) {
  var request = new window.XMLHttpRequest()
  request.addEventListener('load', function () {
    if (this.status === 401) {
      return logout()
    }
    var response = JSON.parse(this.responseText)
    addLinesToDropDown(response)
    show('lines-form')
  })
  request.open('GET', 'https://platform.whereismytransport.com/api/lines?agencies=' + agency, true)
  request.setRequestHeader('Accept', 'application/json')
  request.setRequestHeader('Authorization', 'Bearer ' + token)
  request.send()
}

function getJourney (token, start, destination) {
  var request = new window.XMLHttpRequest()
  var payload = {
    'geometry': {
      'type': 'MultiPoint',
      'coordinates': [
        start.split(','),
        destination.split(',')
      ]
    }
  }

  request.addEventListener('load', function () {
    if (this.status === 401) {
      return logout()
    }
    if (this.status === 201) {
      addResultToMap(JSON.parse(this.responseText))
    }
    var response = JSON.parse(this.responseText)
    console.log(response)
  })
  request.open('POST', 'https://platform.whereismytransport.com/api/journeys', true)
  request.setRequestHeader('Accept', 'application/json')
  request.setRequestHeader('Content-Type', 'application/json')
  request.setRequestHeader('Authorization', 'Bearer ' + token)
  request.send(JSON.stringify(payload))
}

function addAgenciesToDropDown (agenciesList) {
  var agenciesSelect = document.getElementById('agencies-select')
  agenciesSelect.options.length = 0
  agenciesSelect.options.add(new window.Option('Select an option', null, true, true))
  agenciesList.forEach(function (agency) {
    agenciesSelect.options.add(new window.Option(agency.name, agency.id, false, false))
  })
}

function addLinesToDropDown (linesList) {
  var linesSelect = document.getElementById('lines-select')
  linesSelect.options.length = 0
  linesSelect.options.add(new window.Option('Select an option', null, true, true))
  linesList.forEach(function (line) {
    linesSelect.options.add(new window.Option(line.name, line.id, false, false))
  })
}

function addResultToMap (journeyResponse) {
  if (journeyResponse.itineraries === 0) {
    // Show no journeys found
  }

  // we only show the first one in this example
  var itinerary = journeyResponse.itineraries[0]

  itinerary.legs.forEach(function (leg, index) {
    window.map.addLayer({
      'id': index.toLocaleString(),
      'type': 'line',
      'source': {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'properties': {},
          'geometry': leg.geometry
        }
      },
      'layout': {
        'line-join': 'round',
        'line-cap': 'round'
      },
      'paint': {
        'line-color': getRandomColor(),
        'line-width': 8
      }
    })
  })
}

function getRandomColor () {
  var letters = '0123456789ABCDEF'
  var color = '#'
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}
