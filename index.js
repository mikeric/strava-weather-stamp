const axios = require('axios')
const { DARKSKY_API_KEY, STRAVA_ACCESS_TOKEN } = require('./config.json')

// For interfacing with the Strava API.
const Strava = axios.create({
  baseURL: 'https://www.strava.com/api/v3/',
  headers: {
    'Authorization': `Bearer ${STRAVA_ACCESS_TOKEN}`
  }
})

// For interfacing with the Dark Sky API.
const DarkSky = axios.create({
  baseURL: `https://api.darksky.net/forecast/${DARKSKY_API_KEY}/`
})

// Tuple of (latitude, longitude, timestamp) representing the specific location
// and time of the activity.
const activityLoctime = activity => (
  [...activity.start_latlng, Math.floor(Date.parse(activity.start_date) / 1000)]
)

// Draw ASCII arrow in the direction the wind is blowing.
const arrow = bearing => (
  '↓↙←↖↑↗→↘↓'[Math.round(bearing / 45)]
)

// Generate stamp from weather conditions. Example output:
// 23.31 °C | 4.78 km/h (22.35 km/h gust) ↗
const createStamp = ({ temperature, windSpeed, windGust, windBearing }) => (
  [
    `${temperature} °C`,
    `${windSpeed} km/h (${windGust} km/h gust) ${arrow(windBearing)}`
  ].join(' | ')
)

// Update the description of the athlete's latest activity with weather stamp.
Strava.get('athlete/activities?per_page=1').then(res => {
  res.data.forEach(activity => {
    const start = Math.floor(Date.parse(activity.start_date) / 1000)
    const spaceTime = [...activity.start_latlng, start]

    DarkSky.get(`${spaceTime.join()}?units=ca`).then(res => {
      const description = createStamp(res.data.currently)

      Strava.put(`activities/${activity.id}`, { description }).then(() => {
        console.log(activity.name)
        console.log(description)
      })
    })
  })
})
