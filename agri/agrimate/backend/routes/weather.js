import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import User from '../models/User.js';

const router = Router();

/* State → lat/lon map for Indian states */
const STATE_COORDS = {
  Punjab:        { lat: 30.9010, lon: 75.8573, city: 'Ludhiana' },
  Maharashtra:   { lat: 19.0760, lon: 72.8777, city: 'Mumbai'   },
  Karnataka:     { lat: 12.9716, lon: 77.5946, city: 'Bengaluru'},
  TamilNadu:     { lat: 13.0827, lon: 80.2707, city: 'Chennai'  },
  AndhraPradesh: { lat: 17.3850, lon: 78.4867, city: 'Hyderabad'},
  Gujarat:       { lat: 23.0225, lon: 72.5714, city: 'Ahmedabad'},
  Rajasthan:     { lat: 26.9124, lon: 75.7873, city: 'Jaipur'   },
  UttarPradesh:  { lat: 26.8467, lon: 80.9462, city: 'Lucknow'  },
  MadhyaPradesh: { lat: 23.2599, lon: 77.4126, city: 'Bhopal'   },
  WestBengal:    { lat: 22.5726, lon: 88.3639, city: 'Kolkata'  },
  Bihar:         { lat: 25.5941, lon: 85.1376, city: 'Patna'    },
  Haryana:       { lat: 29.0588, lon: 76.0856, city: 'Rohtak'   },
  Odisha:        { lat: 20.2961, lon: 85.8245, city: 'Bhubaneswar'},
  Kerala:        { lat: 9.9312,  lon: 76.2673, city: 'Kochi'    },
  Telangana:     { lat: 17.3850, lon: 78.4867, city: 'Hyderabad'},
};

const DEFAULT_COORD = { lat: 30.9010, lon: 75.8573, city: 'Ludhiana' };

const WMO_CODES = {
  0: { label: 'Clear sky',        icon: 'sun'   },
  1: { label: 'Mainly clear',     icon: 'sun'   },
  2: { label: 'Partly cloudy',    icon: 'cloud' },
  3: { label: 'Overcast',         icon: 'cloud' },
  45:{ label: 'Foggy',            icon: 'cloud' },
  61:{ label: 'Light rain',       icon: 'rain'  },
  63:{ label: 'Moderate rain',    icon: 'rain'  },
  65:{ label: 'Heavy rain',       icon: 'rain'  },
  80:{ label: 'Rain showers',     icon: 'rain'  },
  95:{ label: 'Thunderstorm',     icon: 'storm' },
};

function wmoLabel(code) {
  return WMO_CODES[code] || { label: 'Cloudy', icon: 'cloud' };
}

router.get('/forecast', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const state = user?.location?.state || user?.farm?.state || 'Punjab';
    const coords = STATE_COORDS[state] || DEFAULT_COORD;
    const threshold = user?.notifications?.rainThreshold || 60;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}`
      + `&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum`
      + `&current_weather=true&timezone=Asia%2FKolkata&forecast_days=7`;

    const resp = await fetch(url);
    if (!resp.ok) throw new Error('Weather API unavailable');
    const data = await resp.json();

    const { daily, current_weather } = data;
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    const forecast7 = daily.time.map((dateStr, i) => {
      const d = new Date(dateStr);
      const wmo = wmoLabel(daily.weathercode[i]);
      const rainPct = daily.precipitation_probability_max[i] || 0;
      return {
        day:    days[d.getDay()],
        date:   `${d.getDate()} ${months[d.getMonth()]}`,
        icon:   wmo.icon,
        label:  wmo.label,
        hi:     Math.round(daily.temperature_2m_max[i]),
        lo:     Math.round(daily.temperature_2m_min[i]),
        rain:   `${rainPct}%`,
        rainPct,
        precipitation: daily.precipitation_sum[i] || 0,
      };
    });

    /* Smart rain alerts */
    const rainAlerts = forecast7
      .filter(f => f.rainPct >= threshold)
      .map(f => ({
        day: f.day, date: f.date, rainPct: f.rainPct,
        message: `Rain expected on ${f.day} (${f.date}) — ${f.rainPct}% chance. Skip irrigation to save water and cost.`,
      }));

    /* Irrigation schedule */
    const irrigationSchedule = forecast7.map(f => ({
      day:    f.day,
      date:   f.date,
      skip:   f.rainPct >= threshold,
      amount: f.rainPct >= threshold ? '0 mm' : f.rainPct > 30 ? '10 mm' : '18 mm',
      status: f.rainPct >= threshold
        ? `Skip — ${f.rainPct}% rain forecast`
        : f.rainPct > 30
          ? 'Light irrigation'
          : 'Irrigate as scheduled',
      statusColor: f.rainPct >= threshold ? '#7A9BB5' : f.rainPct > 30 ? '#C4A35A' : '#4A9B3F',
    }));

    res.json({
      current: {
        temp:      Math.round(current_weather.temperature),
        windspeed: Math.round(current_weather.windspeed),
        icon:      wmoLabel(current_weather.weathercode).icon,
        label:     wmoLabel(current_weather.weathercode).label,
        humidity:  65,     // open-meteo free tier: estimate
        soilMoisture: 68,  // from farm sensors / estimate
        uvIndex:   6,
        feelsLike: Math.round(current_weather.temperature + 2),
        precipitation: 0,
      },
      forecast7,
      rainAlerts,
      irrigationSchedule,
      location: { city: user?.location?.district || coords.city, state, lat: coords.lat, lon: coords.lon },
      threshold,
      updatedAt: new Date().toISOString(),
    });

  } catch (err) {
    /* Fallback static data if API is down */
    res.json({
      current: { temp: 28, windspeed: 12, icon: 'cloud', label: 'Partly Cloudy', humidity: 65, soilMoisture: 68, uvIndex: 6, feelsLike: 31, precipitation: 0 },
      forecast7: [
        { day:'Mon', date:'16 Jun', icon:'sun',   hi:34, lo:24, rain:'0%',  rainPct:0,  label:'Clear'         },
        { day:'Tue', date:'17 Jun', icon:'cloud', hi:32, lo:25, rain:'20%', rainPct:20, label:'Partly Cloudy' },
        { day:'Wed', date:'18 Jun', icon:'rain',  hi:29, lo:23, rain:'80%', rainPct:80, label:'Rain'          },
        { day:'Thu', date:'19 Jun', icon:'rain',  hi:28, lo:22, rain:'95%', rainPct:95, label:'Heavy Rain'    },
        { day:'Fri', date:'20 Jun', icon:'cloud', hi:31, lo:23, rain:'30%', rainPct:30, label:'Cloudy'        },
        { day:'Sat', date:'21 Jun', icon:'sun',   hi:33, lo:24, rain:'5%',  rainPct:5,  label:'Clear'         },
        { day:'Sun', date:'22 Jun', icon:'sun',   hi:35, lo:25, rain:'0%',  rainPct:0,  label:'Clear'         },
      ],
      rainAlerts: [
        { day:'Wed', date:'18 Jun', rainPct:80, message:'Rain expected on Wed (18 Jun) — 80% chance. Skip irrigation.' },
        { day:'Thu', date:'19 Jun', rainPct:95, message:'Heavy rain on Thu (19 Jun) — 95% chance. Skip irrigation.' },
      ],
      irrigationSchedule: [
        { day:'Mon', date:'16 Jun', skip:false, amount:'18 mm', status:'Irrigate as scheduled',   statusColor:'#4A9B3F' },
        { day:'Tue', date:'17 Jun', skip:false, amount:'0 mm',  status:'Skip — Soil Optimal',     statusColor:'#4A9B3F' },
        { day:'Wed', date:'18 Jun', skip:true,  amount:'0 mm',  status:'Skip — 80% rain forecast', statusColor:'#7A9BB5' },
        { day:'Thu', date:'19 Jun', skip:true,  amount:'0 mm',  status:'Heavy Rain 15mm',          statusColor:'#7A9BB5' },
        { day:'Fri', date:'20 Jun', skip:false, amount:'18 mm', status:'Irrigate morning',         statusColor:'#C4A35A' },
        { day:'Sat', date:'21 Jun', skip:false, amount:'0 mm',  status:'Monitor soil',             statusColor:'#A8C5A0' },
        { day:'Sun', date:'22 Jun', skip:false, amount:'15 mm', status:'Irrigate if needed',       statusColor:'#C4A35A' },
      ],
      location: { city:'Ludhiana', state:'Punjab', lat:30.90, lon:75.86 },
      threshold: 60,
      updatedAt: new Date().toISOString(),
      fallback: true,
    });
  }
});

export default router;
