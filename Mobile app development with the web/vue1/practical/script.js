var app = new Vue({
  el: '#app',
  data: {
    guess: 0,
    userGuess: 0
  },
  methods: {
    
  }
})

app.guess = Math.round(Math.random() * 10)

console.log(app.guess)