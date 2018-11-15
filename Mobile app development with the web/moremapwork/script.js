var map = L.map('map').setView([-33.91, 18.41], 11)

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map)

const appId = 'BqU0U8dHPxCCYD9lLONy'
const appCode = 'sEcZjhBTHp46SlRzts1ZMQ'

const autocompleteUrl = "http://autocomplete.geocoder.api.here.com/6.2/suggest.json" +
  "?app_id=" + appId +
  "&app_code=" + appCode +
  "&query="
  
const geocodeUrl = "https://geocoder.api.here.com/6.2/geocode.json" +
  "?app_id=" + appId +
  "&app_code=" + appCode +
  "&searchtext="

var app = new Vue({
    el: '#app',
    data: {
        startAddress: '',
        destinationAddress: '',
        autoCompleteResults: [],
        geoResults: [],
    },
    methods: {
        autocomplete: function () {
            var _this = this
            console.log(autocompleteUrl)
            console.log(autocompleteUrl + this.startAddress)

            fetch(autocompleteUrl + this.startAddress)
                .then(function (response) {
                    console.log('response', response)
                    return response.json()
                })
                .then(function (response) {
                    console.log('response', response)
                    console.log('suggestions', response.suggestions)
                    _this.autoCompleteResults = response.suggestions
                })
        }
    }
})