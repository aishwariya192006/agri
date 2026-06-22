import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import CropRecommendation from '../models/CropRecommendation.js';
import User from '../models/User.js';

const router = Router();

const RECS = {
  Loamy: {
    Kharif: [
      { name:'Cotton',   variety:'Bt Cotton, RCH-2',      yield:'15–20 q/acre', profit:'₹52,000', roi:'220%', suitability:97, sowingWindow:'Jun–Jul', harvestDays:170, waterNeeds:'High',   marketDemand:'High'   },
      { name:'Maize',    variety:'Pioneer 3396, DK-9108',  yield:'25–32 q/acre', profit:'₹28,000', roi:'155%', suitability:91, sowingWindow:'Jun–Jul', harvestDays:110, waterNeeds:'Medium', marketDemand:'High'   },
      { name:'Groundnut',variety:'TAG-24, GG-20',          yield:'12–16 q/acre', profit:'₹35,000', roi:'180%', suitability:88, sowingWindow:'Jun–Jul', harvestDays:130, waterNeeds:'Medium', marketDemand:'Medium' },
    ],
    Rabi: [
      { name:'Wheat',    variety:'HD-2967, PBW-550',       yield:'22–28 q/acre', profit:'₹36,000', roi:'175%', suitability:95, sowingWindow:'Oct–Nov', harvestDays:150, waterNeeds:'Medium', marketDemand:'High'   },
      { name:'Mustard',  variety:'Pusa Bold, RH-30',       yield:'12–15 q/acre', profit:'₹28,000', roi:'165%', suitability:85, sowingWindow:'Oct–Nov', harvestDays:130, waterNeeds:'Low',    marketDemand:'High'   },
      { name:'Chickpea', variety:'GBG-1, Pusa-372',        yield:'10–14 q/acre', profit:'₹22,000', roi:'140%', suitability:80, sowingWindow:'Oct–Nov', harvestDays:120, waterNeeds:'Low',    marketDemand:'Medium' },
    ],
  },
  Sandy: {
    Kharif: [
      { name:'Groundnut',variety:'TAG-24, GG-20',yield:'10–14 q/acre',profit:'₹30,000',roi:'170%',suitability:92,sowingWindow:'Jun–Jul',harvestDays:130,waterNeeds:'Low',marketDemand:'Medium' },
      { name:'Bajra',    variety:'HHB-67, RHB-177',yield:'8–12 q/acre',profit:'₹18,000',roi:'130%',suitability:88,sowingWindow:'Jun–Jul',harvestDays:90,waterNeeds:'Low',marketDemand:'Medium' },
    ],
    Rabi: [
      { name:'Mustard',  variety:'Pusa Bold, RH-30',yield:'10–13 q/acre',profit:'₹25,000',roi:'148%',suitability:86,sowingWindow:'Oct',harvestDays:130,waterNeeds:'Low',marketDemand:'High' },
      { name:'Barley',   variety:'BH-902, Jyoti',yield:'16–20 q/acre',profit:'₹18,000',roi:'120%',suitability:78,sowingWindow:'Oct–Nov',harvestDays:130,waterNeeds:'Low',marketDemand:'Low'  },
    ],
  },
  ClayLoam: {
    Kharif: [
      { name:'Rice',    variety:'Pusa Basmati 1121',yield:'22–26 q/acre',profit:'₹48,000',roi:'200%',suitability:96,sowingWindow:'Jun',harvestDays:145,waterNeeds:'High',marketDemand:'High' },
      { name:'Cotton',  variety:'Bt Cotton, MRC-7351',yield:'16–22 q/acre',profit:'₹55,000',roi:'230%',suitability:93,sowingWindow:'Jun–Jul',harvestDays:175,waterNeeds:'High',marketDemand:'High' },
    ],
    Rabi: [
      { name:'Wheat',   variety:'HD-2967, WH-542',yield:'24–30 q/acre',profit:'₹40,000',roi:'185%',suitability:94,sowingWindow:'Nov',harvestDays:150,waterNeeds:'Medium',marketDemand:'High' },
      { name:'Sugarcane',variety:'Co-86032',yield:'350–400 q/acre',profit:'₹60,000',roi:'180%',suitability:88,sowingWindow:'Oct–Nov',harvestDays:365,waterNeeds:'High',marketDemand:'High' },
    ],
  },
};

const DEFAULT_REC = {
  Kharif: [
    { name:'Maize',  variety:'Pioneer 3396',yield:'20–28 q/acre',profit:'₹25,000',roi:'140%',suitability:80,sowingWindow:'Jun–Jul',harvestDays:110,waterNeeds:'Medium',marketDemand:'High' },
    { name:'Bajra',  variety:'HHB-67',yield:'8–12 q/acre',profit:'₹16,000',roi:'120%',suitability:75,sowingWindow:'Jun',harvestDays:90,waterNeeds:'Low',marketDemand:'Medium' },
  ],
  Rabi: [
    { name:'Wheat',  variety:'HD-2967',yield:'20–25 q/acre',profit:'₹30,000',roi:'160%',suitability:85,sowingWindow:'Oct–Nov',harvestDays:150,waterNeeds:'Medium',marketDemand:'High' },
    { name:'Mustard',variety:'Pusa Bold',yield:'10–13 q/acre',profit:'₹22,000',roi:'140%',suitability:78,sowingWindow:'Oct',harvestDays:130,waterNeeds:'Low',marketDemand:'High' },
  ],
};

/* POST /api/crops/recommend */
router.post('/recommend', requireAuth, async (req, res) => {
  const { soil, season, save = false } = req.body;
  if (!season) return res.status(400).json({ error: 'season is required' });

  const user      = await User.findById(req.user.id);
  const soilKey   = soil || user?.farm?.soilType || 'Loamy';
  const seasonKey = season.startsWith('Kharif') ? 'Kharif' : 'Rabi';
  const state     = user?.location?.state    || 'Punjab';
  const district  = user?.location?.district || '';
  const village   = user?.location?.village  || '';
  const area      = user?.farm?.area || 12;

  const items = RECS[soilKey]?.[seasonKey] || DEFAULT_REC[seasonKey];

  const payload = {
    user: req.user.id,
    season: seasonKey, soilType: soilKey,
    location: { state, district, village },
    farmArea: area,
    recommendations: items,
    aiModel: 'AgriMate-CropAI-v1',
    basedOn: ['soil_type', 'location', 'season', 'market_prices'],
    isSaved: Boolean(save),
  };

  if (save) {
    const record = await CropRecommendation.create(payload);
    return res.status(201).json({ recommendations: items, meta: { soil: soilKey, season: seasonKey, state, area }, id: record._id });
  }

  res.json({ recommendations: items, meta: { soil: soilKey, season: seasonKey, state, area } });
});

/* GET /api/crops/history */
router.get('/history', requireAuth, async (req, res) => {
  const records = await CropRecommendation.find({ user: req.user.id })
    .sort({ createdAt: -1 }).limit(10).lean();
  res.json({ records });
});

/* GET /api/crops/:id */
router.get('/:id', requireAuth, async (req, res) => {
  const record = await CropRecommendation.findOne({ _id: req.params.id, user: req.user.id });
  if (!record) return res.status(404).json({ error: 'Not found' });
  res.json(record);
});

/* PATCH /api/crops/:id/save */
router.patch('/:id/save', requireAuth, async (req, res) => {
  const record = await CropRecommendation.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { isSaved: true }, { new: true }
  );
  if (!record) return res.status(404).json({ error: 'Not found' });
  res.json(record);
});

export default router;
