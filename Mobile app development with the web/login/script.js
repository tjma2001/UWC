const load = () => {
  var webAuth = new auth0.WebAuth({
    domain: 'transporter.eu.auth0.com',
    clientID: 'Wn-nbWoRAJ6mt5bAzTfDHYophZB8a-dG'
  })
  webAuth.authorize({})
  webAuth.crossOriginVerification()

  // webAuth.signup({
  //   connection: 'Username-Password-Authentication',
  //   email: 'taariq@figornaartjie.com',
  //   password: 'asdf1234',
  //   user_metadata: { plan: 'silver', team_id: 'a111' }
  // }, function (err) {
  //   if (err) return alert('Something went wrong: ' + err.message)
  //   return alert('success signup without login!')
  // })
}

window.addEventListener('load', load)
