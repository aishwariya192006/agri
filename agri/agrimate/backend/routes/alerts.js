import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import WeatherAlert from '../models/WeatherAlert.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

const router = Router();

const STATE_COORDS = {
  Punjab:        { lat: 30.9010, lon: 75.8573, city: 'Ludhiana'   },
  Maharashtra:   { lat: 19.0760, lon: 72.8777, city: 'Mumbai'     },
  Karnataka:     { lat: 12.9716, lon: 77.5946, city: 'Bengaluru'  },
  TamilNadu:     { lat: 13.0827, lon: 80.2707, city: 'Chennai'    },
  AndhraPradesh: { lat: 17.3850, lon: 78.4867, city: 'Hyderabad'  },
  Gujarat:       { lat: 23.0225, lon: 72.5714, city: 'Ahmedabad'  },
  Rajasthan:     { lat: 26.9124, lon: 75.7873, city: 'Jaipur'     },
  UttarPradesh:  { lat: 26.8467, lon: 80.9462, city: 'Lucknow'    },
  Haryana:       { lat: 29.0588, lon: 76.0856, city: 'Rohtak'     },
  Kerala:        { lat: 9.9312,  lon: 76.2673, city: 'Kochi'      },
};

const WMO = { 0:'sun',1:'sun',2:'cloud',3:'cloud',45:'cloud',61:'rain',63:'rain',65:'rain',80:'rain',95:'storm' };

/* GET /api/alerts/forecast — fetch live weather + store alerts */
router.get('/forecast', requireAuth, async (req, res) => {
  const user      = await User.findById(req.user.id);
  const state     = user?.location?.state || 'Punjab';
  const coords    = STATE_COORDS[state] || STATE_COORDS.Punjab;
  const threshold = user?.notifications?.rainThreshold || 60;
  const district  = user?.location?.district || coords.city;

  let forecast7, current;
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}`
      + `&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum`
      + `&current_weather=true&timezone=Asia%2FKolkata&forecast_days=7`;

    const resp = await fetch(url);
    if (!resp.ok) throw new Error('API error');
    const data = await resp.json();

    const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const MON  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    forecast7 = data.daily.time.map((dateStr, i) => {
      const d = new Date(dateStr);
      const rainPct = data.daily.precipitation_probability_max[i] || 0;
      return {
        day: DAYS[d.getDay()], date: `${d.getDate()} ${MON[d.getMonth()]}`,
        icon: WMO[data.daily.weathercode[i]] || 'cloud',
        hi: Math.round(data.daily.temperature_2m_max[i]),
        lo: Math.round(data.daily.temperature_2m_min[i]),
        rain: `${rainPct}%`, rainPct,
        precipitation: data.daily.precipitation_sum[i] || 0,
      };
    });

    current = {
      temp: Math.round(data.current_weather.temperature),
      windspeed: Math.round(data.current_weather.windspeed),
      icon: WMO[data.current_weather.weathercode] || 'cloud',
      humidity: 65, soilMoisture: 68, uvIndex: 6,
      feelsLike: Math.round(data.current_weather.temperature + 2),
      precipitation: 0,
    };
  } catch {
    /* Fallback */
    forecast7 = [
      { day:'Mon',date:'16 Jun',icon:'sun',  hi:34,lo:24,rain:'0%', rainPct:0  },
      { day:'Tue',date:'17 Jun',icon:'cloud',hi:32,lo:25,rain:'20%',rainPct:20 },
      { day:'Wed',date:'18 Jun',icon:'rain', hi:29,lo:23,rain:'80%',rainPct:80 },
      { day:'Thu',date:'19 Jun',icon:'rain', hi:28,lo:22,rain:'95%',rainPct:95 },
      { day:'Fri',date:'20 Jun',icon:'cloud',hi:31,lo:23,rain:'30%',rainPct:30 },
      { day:'Sat',date:'21 Jun',icon:'sun',  hi:33,lo:24,rain:'5%', rainPct:5  },
      { day:'Sun',date:'22 Jun',icon:'sun',  hi:35,lo:25,rain:'0%', rainPct:0  },
    ];
    current = { temp:28,windspeed:12,icon:'cloud',humidity:65,soilMoisture:68,uvIndex:6,feelsLike:31,precipitation:0 };
  }

  /* Build rain alerts and save to DB */
  const rainDays = forecast7.filter(f => f.rainPct >= threshold);
  const savedAlerts = [];

  for (const day of rainDays) {
    const existing = await WeatherAlert.findOne({
      user: req.user.id,
      'forecast.day': day.day,
      'forecast.date': day.date,
      type: 'rain',
    });
    if (existing) { savedAlerts.push(existing); continue; }

    const severity = day.rainPct >= 80 ? 'high' : 'medium';
    const irrigAction = day.rainPct >= threshold ? 'skip' : 'reduce';

    const alert = await WeatherAlert.create({
      user: req.user.id,
      type: 'rain', severity,
      title: `🌧 Rain Alert — ${day.day} (${day.date})`,
      message: `${day.rainPct}% chance of rain on ${day.day} (${day.date}). Skip irrigation to save water and cost.`,
      forecast: { day: day.day, date: day.date, rainPct: day.rainPct, tempHi: day.hi, tempLo: day.lo, precipitation: day.precipitation, icon: day.icon },
      irrigationAction: irrigAction,
      irrigationNote: `Avoid irrigation on ${day.day}. Rain forecast: ${day.rainPct}%.`,
      location: { state, district, lat: coords.lat, lon: coords.lon },
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    });
    savedAlerts.push(alert);

    /* Push to Notifications */
    if (user?.notifications?.weatherAlerts !== false) {
      await Notification.create({
        user: req.user.id,
        type: 'weather', severity,
        title: alert.title,
        message: alert.message,
        icon: '🌧',
        actionUrl: '/app/weather',
        actionLabel: 'View Forecast',
        refModel: 'WeatherAlert',
        refId: alert._id,
        expiresAt: alert.validUntil,
      });
    }
  }

  /* Build irrigation schedule */
  const irrigationSchedule = forecast7.map(f => ({
    day: f.day, date: f.date,
    skip: f.rainPct >= threshold,
    amount: f.rainPct >= threshold ? '0 mm' : f.rainPct > 30 ? '10 mm' : '18 mm',
    status: f.rainPct >= threshold ? `Skip — ${f.rainPct}% rain forecast`
           : f.rainPct > 30 ? 'Light irrigation recommended'
           : 'Irrigate as scheduled',
    statusColor: f.rainPct >= threshold ? '#7A9BB5' : f.rainPct > 30 ? '#C4A35A' : '#4A9B3F',
  }));

  res.json({
    current,
    forecast7,
    rainAlerts: savedAlerts,
    irrigationSchedule,
    location: { city: district, state, lat: coords.lat, lon: coords.lon },
    threshold,
    updatedAt: new Date().toISOString(),
  });
});

/* GET /api/alerts — list user's weather alerts */
router.get('/', requireAuth, async (req, res) => {
  const alerts = await WeatherAlert.find({ user: req.user.id, isDismissed: false })
    .sort({ createdAt: -1 }).limit(20).lean();
  res.json({ alerts });
});

/* PATCH /api/alerts/:id/read */
router.patch('/:id/read', requireAuth, async (req, res) => {
  await WeatherAlert.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, { isRead: true });
  res.json({ success: true });
});

/* PATCH /api/alerts/:id/dismiss */
router.patch('/:id/dismiss', requireAuth, async (req, res) => {
  await WeatherAlert.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, { isDismissed: true });
  res.json({ success: true });
});

export default router;
