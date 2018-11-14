const appId = 'BqU0U8dHPxCCYD9lLONy'
const appCode = 'sEcZjhBTHp46SlRzts1ZMQ'

const url = "http://autocomplete.geocoder.api.here.com/6.2/suggest.json" +
  "?app_id=" + appId +
  "&app_code=" + appCode +
  "&query=";

function b() {
  this.newstate = 'b'
  console.log('b', this)
}

function a() {
  this.state = 'a'
  console.log('a', this)
  b()
}  

a()


var app = new Vue({
  el: '#app',
  data: {
    address: '',
    results: []
  },
  methods: {
    search: function () {
      if(this.address.length > 5) {
        var _this = this
        console.log('search', this)
        fetch(url + this.address)
          .then(function (response) {
            return response.json()
          })
          .then(function (response){
            _this.results = response.suggestions
          })
        
      } else {
        // do some error handling
        console.log('must use a valid address')
      }
    },
    klick: function (result) {
      this.address = result.label
    }
  }
})