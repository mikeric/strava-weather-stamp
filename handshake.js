const axios = require('axios')
const open = require('open')
const http = require('http')
const url = require('url')
const { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET } = require('./config.json')

const AUTH_URL = `http://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&response_type=code&redirect_uri=http://localhost:9615/&approval_prompt=force&scope=read_all,activity:read_all,activity:write`

;(() => {
  const server = http.createServer(async (req, res) => {
    try {
      const { data } = await axios.post('https://www.strava.com/oauth/token', {
        client_id: STRAVA_CLIENT_ID,
        client_secret: STRAVA_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: url.parse(req.url, true).query.code
      })

      console.log('access token:', data.access_token)
      console.log('refresh token:', data.refresh_token)
      console.log('expires at:', new Date(data.expires_at * 1000))

      res.end('handshake successful')
    } catch(error) {
      console.error(error.response.data)
      res.end('handshake failed')
    }

    server.close()
  }).listen(9615)

  open(AUTH_URL)
})()
