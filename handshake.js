const axios = require('axios')
const open = require('open')
const http = require('http')
const url = require('url')
const fs = require('fs')
const { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, HANDSHAKE_PORT } = require('./config.json')

const AUTH_URL = `http://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&response_type=code&redirect_uri=http://localhost:${HANDSHAKE_PORT}/&approval_prompt=force&scope=read_all,activity:read_all,activity:write`

const store = auth => {
  fs.writeFile("auth.json", JSON.stringify(auth), 'utf8', err => {
    if (err) {
      console.error(err)
    } else {
      console.log("Handshake successful. Your authentication details have been written to auth.json.")
    }
  })
}

(() => {
  const server = http.createServer(async (req, res) => {
    try {
      const { data } = await axios.post('https://www.strava.com/oauth/token', {
        client_id: STRAVA_CLIENT_ID,
        client_secret: STRAVA_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: url.parse(req.url, true).query.code
      })

      store({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: data.expires_at
      })

      res.end('handshake successful')
    } catch(error) {
      console.error(error.response.data)
      res.end('handshake failed')
    }

    server.close()
  }).listen(HANDSHAKE_PORT)

  open(AUTH_URL)
})()
