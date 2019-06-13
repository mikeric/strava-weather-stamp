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

// Get the athlete's most recent activity.
const getLatestActivity = () => (
  Strava.get('athlete/activities', { params: { per_page: 1 }}).then(res => (
    res.data[0]
  ))
)

// Get the weather conditions at the specified loctime.
const getConditions = loctime => (
  DarkSky.get(loctime.join(), { params: { units: 'ca' }}).then(res => (
    res.data.currently
  ))
)

// Update the activity with a weather stamp.
const stampActivity = async activity => {
  const conditions = await getConditions(activityLoctime(activity))
  const description = createStamp(conditions)

  await Strava.put(`activities/${activity.id}`, { description })
  return description
}

// Weather stamp the athlete's latest activity.
(async () => {
  try {
    const activity = await getLatestActivity()
    const stamp = await stampActivity(activity)

    console.log(activity.name)
    console.log(stamp)
  } catch(error) {
    console.error(error.response.data)
  }
})()
