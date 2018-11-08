function generateGuess() {
  return Math.round(Math.random() * 10)
}

const timerValue = 5

const app = new Vue({
  el: "#app",
  data: {
    timer: timerValue,
    computerGuess: generateGuess(),
    userGuess: 0,
    errors: [ ],
    showModal: false,
    failure: false,
    success: false,
    customMessage: ''
  },
  methods: {
    enter: function () {
      console.log(this.computerGuess)
      if(Number(this.userGuess) === this.computerGuess) {
        this.errors = []
        this.timer = timerValue
        this.computerGuess = generateGuess()
      } else {
        this.errors.push(true)
        if(this.errors.length >= 3) {
          alert('you failed')
          this.errors = []
          this.timer = timerValue
          this.computerGuess = generateGuess()
        }
      }
    }
  }
})

function countDown() {
  app.timer--
  if(app.timer === 0) {
    app.showModal = true
    app.failure = true
    app.success = false
    app.timer = timerValue
    app.customMessage = "The correct value was " + app.computerGuess
  }
}

setInterval(countDown, 1000)