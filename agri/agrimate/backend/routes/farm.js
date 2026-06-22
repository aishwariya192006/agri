import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const SEED_RECS = {
  Loamy: {
    Kharif: [
      { name: 'Cotton', variety: 'Bt Cotton, RCH-2', yield: '15–20 q/acre', profit: '₹52,000', roi: '220%', suitability: 97 },
      { name: 'Maize', variety: 'Pioneer 3396, DK-9108', yield: '25–32 q/acre', profit: '₹28,000', roi: '155%', suitability: 91 },
      { name: 'Groundnut', variety: 'TAG-24, GG-20', yield: '12–16 q/acre', profit: '₹35,000', roi: '180%', suitability: 88 },
    ],
    Rabi: [
      { name: 'Wheat', variety: 'HD-2967, PBW-550', yield: '22–28 q/acre', profit: '₹36,000', roi: '175%', suitability: 95 },
      { name: 'Mustard', variety: 'Pusa Bold, RH-30', yield: '12–15 q/acre', profit: '₹28,000', roi: '165%', suitability: 85 },
      { name: 'Chickpea', variety: 'GBG-1, Pusa-372', yield: '10–14 q/acre', profit: '₹22,000', roi: '140%', suitability: 80 },
    ],
  },
  Sandy: {
    Kharif: [
      { name: 'Groundnut', variety: 'TAG-24, GG-20', yield: '10–14 q/acre', profit: '₹30,000', roi: '170%', suitability: 92 },
      { name: 'Bajra', variety: 'HHB-67, RHB-177', yield: '8–12 q/acre', profit: '₹18,000', roi: '130%', suitability: 88 },
    ],
    Rabi: [
      { name: 'Mustard', variety: 'Pusa Bold, RH-30', yield: '10–13 q/acre', profit: '₹25,000', roi: '148%', suitability: 86 },
      { name: 'Barley', variety: 'BH-902, Jyoti', yield: '16–20 q/acre', profit: '₹18,000', roi: '120%', suitability: 78 },
    ],
  },
};

const DEFAULT_REC = [
  { name: 'Wheat', variety: 'HD-2967, PBW-343', yield: '20–25 q/acre', profit: '₹30,000', roi: '160%', suitability: 88 },
  { name: 'Mustard', variety: 'Pusa Bold, RH-30', yield: '10–13 q/acre', profit: '₹25,000', roi: '148%', suitability: 82 },
  { name: 'Chickpea', variety: 'GBG-1, Pusa-372', yield: '8–12 q/acre', profit: '₹20,000', roi: '135%', suitability: 78 },
  { name: 'Barley', variety: 'BH-902, Jyoti', yield: '18–22 q/acre', profit: '₹18,000', roi: '120%', suitability: 72 },
];

const CROP_YIELDS = {
  Wheat: { yieldPerAcre: 22, pricePerQtl: 2350 },
  Cotton: { yieldPerAcre: 18, pricePerQtl: 6800 },
  Rice: { yieldPerAcre: 28, pricePerQtl: 2100 },
  Maize: { yieldPerAcre: 30, pricePerQtl: 1850 },
  Mustard: { yieldPerAcre: 12, pricePerQtl: 5420 },
};

router.post('/seeds', requireAuth, (req, res) => {
  const { soil, season, state, area } = req.body;
  if (!soil || !season) {
    return res.status(400).json({ error: 'Soil type and season are required' });
  }
  const seasonKey = season.startsWith('Kharif') ? 'Kharif' : 'Rabi';
  const recommendations = SEED_RECS[soil]?.[seasonKey] || DEFAULT_REC;
  res.json({ recommendations, meta: { soil, season, state: state || 'Punjab', area: Number(area) || 12 } });
});

router.post('/profit', requireAuth, (req, res) => {
  const { crop = 'Wheat', area = 12, season = 'Rabi', cost = 125000 } = req.body;
  const cropData = CROP_YIELDS[crop] || CROP_YIELDS.Wheat;
  const acres = Number(area) || 12;
  const totalCost = Number(cost) || 125000;
  const yieldQtl = cropData.yieldPerAcre * acres;
  const revenue = Math.round(yieldQtl * cropData.pricePerQtl);
  const profit = revenue - totalCost;
  const roi = Math.round((profit / totalCost) * 100);

  res.json({
    revenue,
    cost: totalCost,
    profit,
    roi,
    yield: Math.round(yieldQtl),
    breakdown: [
      { name: 'Seed', cost: Math.round(totalCost * 0.12) },
      { name: 'Fertilizer', cost: Math.round(totalCost * 0.28) },
      { name: 'Labor', cost: Math.round(totalCost * 0.36) },
      { name: 'Machinery', cost: Math.round(totalCost * 0.16) },
      { name: 'Pesticides', cost: Math.round(totalCost * 0.08) },
    ],
    monthly: [
      { m: 'Oct', v: 0 }, { m: 'Nov', v: 0 }, { m: 'Dec', v: -Math.round(totalCost * 0.32) },
      { m: 'Jan', v: -Math.round(totalCost * 0.64) }, { m: 'Feb', v: -totalCost },
      { m: 'Mar', v: Math.round(profit * 0.25) }, { m: 'Apr', v: profit },
    ],
    suggestions: [
      'Switching to direct seeding could save ₹15,000 in labor costs.',
      `Selling in peak ${season} season could increase revenue by 8%.`,
      'Apply for PM-Kisan scheme to add ₹6,000 to net profit.',
    ],
    meta: { crop, area: acres, season },
  });
});

router.get('/dashboard', requireAuth, (_req, res) => {
  res.json({
    weather: { temp: 28, humidity: 62, condition: 'Clear', soilMoisture: 68 },
    profitData: [
      { month: 'Jan', profit: 10 }, { month: 'Feb', profit: 22 },
      { month: 'Mar', profit: 28 }, { month: 'Apr', profit: 32 },
      { month: 'May', profit: 38 }, { month: 'Jun', profit: 35 },
      { month: 'Jul', profit: 40 }, { month: 'Aug', profit: 43 },
      { month: 'Sep', profit: 48 },
    ],
    soilData: [
      { name: 'N', val: 65 }, { name: 'P', val: 42 },
      { name: 'K', val: 78 }, { name: 'pH', val: 68 },
    ],
    forecast7: [
      { day: 'Mon', hi: 34, lo: 24, rain: '0%', icon: 'sun' },
      { day: 'Tue', hi: 32, lo: 25, rain: '20%', icon: 'cloud' },
      { day: 'Wed', hi: 29, lo: 23, rain: '80%', icon: 'rain' },
      { day: 'Thu', hi: 28, lo: 22, rain: '90%', icon: 'rain' },
      { day: 'Fri', hi: 31, lo: 23, rain: '30%', icon: 'cloud' },
      { day: 'Sat', hi: 33, lo: 24, rain: '5%', icon: 'sun' },
      { day: 'Sun', hi: 35, lo: 25, rain: '0%', icon: 'sun' },
    ],
    alerts: [
      { type: 'pest', message: 'Leaf rust risk elevated — monitor wheat fields', severity: 'high' },
      { type: 'weather', message: 'Heavy rain expected Wednesday — delay irrigation', severity: 'medium' },
      { type: 'market', message: 'Cotton prices up 2.4% at Bathinda Mandi', severity: 'low' },
    ],
  });
});

export default router;
