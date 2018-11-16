// https://leafletjs.com/reference-1.3.4.html#polyline

var map = L.map('map').setView([-33.91, 18.41], 11)

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map)

const appId = 'BqU0U8dHPxCCYD9lLONy'
const appCode = 'sEcZjhBTHp46SlRzts1ZMQ'
const clientId = 'f99da0f2-7aed-4d6a-a64b-5a166c99bdd3'
const clientSecret = 'fTV46ARkBaBb+nSNwmBWQm2Eum+I2ik+cBsq6Bsnwso='

const autocompleteUrl = "http://autocomplete.geocoder.api.here.com/6.2/suggest.json" +
  "?app_id=" + appId +
  "&app_code=" + appCode +
  "&query="
  
const geocodeUrl = "https://geocoder.api.here.com/6.2/geocode.json" +
  "?app_id=" + appId +
  "&app_code=" + appCode +
  "&searchtext="

const tokenUrl = "https://identity.whereismytransport.com/connect/token"

function login() {
    var payload = {
        'client_id': clientId,
        'client_secret': clientSecret,
        'grant_type': 'client_credentials',
        'scope': 'transportapi:all'
    }

    var request = new XMLHttpRequest();
    request.open('POST', 'https://identity.whereismytransport.com/connect/token', true);
    request.addEventListener('load', function () {
        if(this.status == 200) {
            var response = JSON.parse(this.responseText);
            var token = response.access_token;
            window.token = token;

            localStorage.setItem('token', token)
            localStorage.setItem('storageDate', Date.now().toLocaleString())
        } else {
            console.log("get token call failed")
            alert('login unsuccessful')
        }
    });
    request.setRequestHeader('Accept', 'application/json');
    var formData = new FormData();

    for (var key in payload) {
        formData.append(key, payload[key]);
    }

    request.send(formData);
}

login()

var app = new Vue({
    el: '#app',
    data: {
        startAddress: '',
        destinationAddress: '',
        startLocation: undefined,
        destinationLocation: undefined,
        isStart: true,
        autoCompleteResults: [],
        startPoint: undefined,
        destinationPoint: undefined
    },
    methods: {
        autocomplete: function (isStart) {
            var _this = this
            var text = this.startAddress

            if (isStart == false) {
                text = this.destinationAddress
            }

            if(text.length < 5) {
                return false
            }

            fetch(autocompleteUrl + text)
                .then(function (response) {
                    return response.json()
                })
                .then(function (response) {
                    _this.autoCompleteResults = response.suggestions
                    _this.isStart = isStart
                })
        },
        resultSelect: function (result) {
            var _this = this
            fetch(geocodeUrl + result.label)
                .then(function (response) {
                    return response.json()
                })
                .then(function (response) {
                    var location = response.Response.View[0].Result[0].Location.DisplayPosition
                    if(_this.isStart == true) {
                        _this.startAddress = result.label
                        _this.startPoint = L.marker([location.Latitude, location.Longitude])
                        _this.startPoint.addTo(map)
                        _this.startLocation = location
                        _this.autoCompleteResults = []
                    } else {
                        _this.destinationAddress = result.label
                        _this.destinationPoint = L.marker([location.Latitude, location.Longitude])
                        _this.destinationPoint.addTo(map)
                        _this.destinationLocation = location
                        _this.autoCompleteResults = []
                    }
                })
        },
        search: function () {
            console.log('running search')
            var journeyUrl = 'https://platform.whereismytransport.com/api/journeys'
            var ourBody = {
                "geometry": {
                    "type": "MultiPoint",
                    "coordinates": [
                        [
                            this.startLocation.Longitude,
                            this.startLocation.Latitude
                        ],
                        [
                            this.destinationLocation.Longitude,
                            this.destinationLocation.Latitude
                        ]
                    ]
                },
                "maxItineraries": 5
            }


            fetch(journeyUrl, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + window.token,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(ourBody) 
            })
            .then(function(response){
                // console.log(response)
                return response.json()
            })
            .then(function(response) {
                console.log(response)

                var itineraries = response.itineraries
                if(itineraries.length > 0) {
                    var legs = itineraries[0].legs
                    for(var i = 0; i < legs.length; i++) {
                        console.log('geometry', legs[i].geometry.coordinates)
                        var coorindates = legs[i].geometry.coordinates

                    }
                }
            })
        }
    }
})