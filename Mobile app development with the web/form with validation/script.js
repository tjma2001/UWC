var app = new Vue({
  el: "#app",
  data: {
    username: '',
    password: '',
    usernameError: false,
    passwordError: false,
    usernameErrorMessage: []
  },
  methods: {
    login: function () {
      this.usernameError = false
      this.passwordError = false
      this.usernameErrorMessage = []

      if(this.password.length < 6) {
        this.passwordError = true
      }

      if(this.username.length < 3) {
        this.usernameError = true
        this.usernameErrorMessage.push({ msg: 'Username is too short', date: Date.now() })
        var errorMessage = {
          msg: 'new Error Message',
          date: Date.now()
        }

        this.usernameErrorMessage.push(errorMessage)
      }

      if(!this.username.includes('@')) {
        this.usernameError = true
        this.usernameErrorMessage.push({msg: 'Username must be a valid email address', date: Date.now()})
      }
    }
  }
})