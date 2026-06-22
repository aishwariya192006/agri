import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import MarketPrice from '../models/MarketPrice.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

const router = Router();

const BASE = {
  Wheat:    { base: 2350, msp: 2275, unit: '₹/qtl' },
  Rice:     { base: 1960, msp: 2183, unit: '₹/qtl' },
  Cotton:   { base: 6800, msp: 6620, unit: '₹/qtl' },
  Maize:    { base: 1820, msp: 1962, unit: '₹/qtl' },
  Mustard:  { base: 5420, msp: 5650, unit: '₹/qtl' },
  Soybean:  { base: 4200, msp: 4600, unit: '₹/qtl' },
  Sugarcane:{ base: 315,  msp: 305,  unit: '₹/qtl' },
};

const SELL_ADVICE = {
  Wheat:    'Hold 15–20 days — festival demand expected to push prices +8%.',
  Cotton:   'Good time to sell 50% — prices near seasonal peak.',
  Rice:     'Market stable — sell gradually over next 2 weeks.',
  Mustard:  'Prices below MSP — wait for govt procurement window.',
  Maize:    'Prices steady — sell if storage costs are high.',
  Soybean:  'Export demand improving — hold 10 more days.',
  Sugarcane:'Sell immediately — factory crushing season starting.',
};

const MANDIS = {
  Punjab:      [{ name:'Khanna Mandi',  district:'Ludhiana' },{ name:'Ludhiana APMC',district:'Ludhiana' },{ name:'Bathinda Mandi',district:'Bathinda' }],
  Maharashtra: [{ name:'Pune APMC',     district:'Pune'     },{ name:'Nashik Mandi', district:'Nashik'   },{ name:'Nagpur APMC',  district:'Nagpur'   }],
  Karnataka:   [{ name:'APMC Bengaluru',district:'Bengaluru'},{ name:'Hubli APMC',   district:'Dharwad'  }],
  TamilNadu:   [{ name:'Koyambedu APMC',district:'Chennai'  },{ name:'Madurai Mandi',district:'Madurai'  }],
  default:     [{ name:'Local APMC',    district:'District'  },{ name:'State Mandi',  district:'Nearby'   }],
};

function livePrice(base) {
  return Math.round(base + (Math.random() - 0.48) * base * 0.01);
}

function buildHistory(base) {
  let p = base * 0.92;
  return Array.from({ length: 30 }, (_, i) => {
    p = Math.round(p + (Math.random() - 0.46) * base * 0.012);
    return { date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000), price: p, mandi: 'Average' };
  });
}

/* GET /api/market/prices — all crops, live prices */
router.get('/prices', requireAuth, async (req, res) => {
  const user  = await User.findById(req.user.id);
  const state = user?.location?.state || 'Punjab';

  const prices = Object.entries(BASE).map(([name, { base, msp, unit }]) => {
    const price    = livePrice(base);
    const prevPrice= livePrice(base);
    const change   = price - prevPrice;
    const changePct= ((change / prevPrice) * 100).toFixed(1);
    return {
      cropName: name, price, prevPrice, unit, msp, change,
      changePct: Number(changePct),
      trend: change >= 0 ? 'up' : 'down',
      state,
      sellAdvice: SELL_ADVICE[name] || '',
      forecastPrice: Math.round(base * 1.08),
      aboveMsp: price > msp,
    };
  });

  res.json({ prices, state, updatedAt: new Date().toISOString() });
});

/* GET /api/market/prices/:crop — single crop with history + mandis */
router.get('/prices/:crop', requireAuth, async (req, res) => {
  const crop  = req.params.crop;
  const user  = await User.findById(req.user.id);
  const state = user?.location?.state || 'Punjab';

  if (!BASE[crop]) return res.status(404).json({ error: 'Crop not found' });
  const { base, msp, unit } = BASE[crop];
  const price    = livePrice(base);
  const prevPrice= livePrice(base);
  const history  = buildHistory(base);
  const mandis   = (MANDIS[state] || MANDIS.default).map(m => ({
    ...m, price: livePrice(base), unit, trend: Math.random() > 0.4 ? 'up' : 'down',
  }));

  res.json({
    cropName: crop, price, prevPrice, unit, msp,
    change: price - prevPrice,
    changePct: Number(((price - prevPrice) / prevPrice * 100).toFixed(1)),
    trend: price >= prevPrice ? 'up' : 'down',
    history, mandis, state,
    sellAdvice: SELL_ADVICE[crop] || '',
    forecastPrice: Math.round(base * 1.08),
    aboveMsp: price > msp,
    updatedAt: new Date().toISOString(),
  });
});

/* POST /api/market/save — save price snapshot to DB */
router.post('/save', requireAuth, async (req, res) => {
  const { cropName, price, state } = req.body;
  if (!cropName || !price) return res.status(400).json({ error: 'cropName and price required' });

  const info  = BASE[cropName] || {};
  const prev  = await MarketPrice.findOne({ cropName, state }).sort({ createdAt: -1 });
  const change = prev ? price - prev.price : 0;

  const record = await MarketPrice.create({
    cropName, price, unit: info.unit || '₹/qtl', msp: info.msp || 0,
    prevPrice: prev?.price || price, change,
    changePct: prev ? Number(((change / prev.price) * 100).toFixed(1)) : 0,
    trend: change >= 0 ? 'up' : 'down',
    state: state || 'Punjab',
    sellAdvice: SELL_ADVICE[cropName] || '',
    history: buildHistory(info.base || price),
    fetchedAt: new Date(),
  });

  /* Alert if price drops below MSP */
  if (info.msp && price < info.msp) {
    const user = await User.findById(req.user.id);
    if (user?.notifications?.marketAlerts !== false) {
      await Notification.create({
        user: req.user.id,
        type: 'market', severity: 'high',
        title: `📉 ${cropName} Price Below MSP`,
        message: `Current: ₹${price}/qtl | MSP: ₹${info.msp}/qtl. Consider waiting for govt procurement.`,
        icon: '📊', actionUrl: '/app/market', actionLabel: 'View Market',
        refModel: 'MarketPrice', refId: record._id,
      });
    }
  }

  res.status(201).json(record);
});

/* GET /api/market/history/:crop */
router.get('/history/:crop', requireAuth, async (req, res) => {
  const records = await MarketPrice.find({ cropName: req.params.crop })
    .sort({ createdAt: -1 }).limit(30).lean();
  res.json({ records });
});

export default router;
