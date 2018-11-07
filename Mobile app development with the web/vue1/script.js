var app = new Vue({
  el: '#app',
  data: {
    message: 'this is the new message',
    count: 0,
    routes: [
      { name: 'Route 1', description: 'route to here'},
      { name: 'Route 2', description: 'route to there'},
      { name: 'Route 3', description: 'route to a'},
      { name: 'Route 4', description: 'route to b'},
      { name: 'Route 5', description: 'route to c'},
      { name: 'Route 6', description: 'route to nowhere'},
      { name: 'Route 7', description: 'route to rome'},
      { name: 'Route 8', description: 'route to D'},
    ],
    firstname: '',
    surname: ''
  },
  methods: {
    showAlert: function () {
      alert('Your name is ' + this.$data.firstname + ' ' + this.$data.surname)
    }
  }
})

setInterval(function() {
  app.count++
  app.message = app.firstname + " " + app.count
}, 1000)
