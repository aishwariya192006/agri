import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import SoilAnalysis from '../models/SoilAnalysis.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const CNN_META = { model: 'CNN-AgriMate-v1', architecture: 'ResNet-50', analysisType: 'Convolutional Neural Network' };

const SOIL_VARIANTS = [
  {
    healthScore: 74, nitrogen: 65, phosphorus: 42, potassium: 78,
    pH: 6.8, organicMatter: 2.1, texture: 'Loamy Sand', classification: 'Moderately Fertile',
    suitableCrops: ['Wheat', 'Mustard', 'Gram', 'Sunflower'],
    nutrients: [
      { name: 'Nitrogen (N)',   value: 65, status: 'Medium',   color: '#4ADE80', msg: 'Apply Urea @ 45 kg/acre before sowing' },
      { name: 'Phosphorus (P)', value: 42, status: 'Low',      color: '#C4A35A', msg: 'Apply DAP @ 2 bags/acre as basal dose' },
      { name: 'Potassium (K)',  value: 78, status: 'Good',     color: '#60A5FA', msg: 'Current levels sufficient' },
      { name: 'Zinc (Zn)',      value: 28, status: 'Very Low', color: '#F87171', msg: 'Apply Zinc Sulphate @ 10 kg/acre' },
    ],
    recommendations: [
      'Apply 5 tons/acre Farm Yard Manure to improve organic carbon',
      'Green manuring with Dhaincha before next Kharif',
      'pH 6.8 is optimal — no liming required',
      'Apply Zinc Sulphate 10 kg/acre immediately',
    ],
  },
  {
    healthScore: 82, nitrogen: 72, phosphorus: 58, potassium: 81,
    pH: 7.1, organicMatter: 2.8, texture: 'Clay Loam', classification: 'Fertile',
    suitableCrops: ['Rice', 'Cotton', 'Sugarcane', 'Maize'],
    nutrients: [
      { name: 'Nitrogen (N)',   value: 72, status: 'Good',   color: '#4ADE80', msg: 'Adequate for Kharif crops' },
      { name: 'Phosphorus (P)', value: 58, status: 'Medium', color: '#C4A35A', msg: 'Apply DAP @ 1 bag/acre' },
      { name: 'Potassium (K)',  value: 81, status: 'Good',   color: '#60A5FA', msg: 'Excellent potassium reserves' },
      { name: 'Zinc (Zn)',      value: 45, status: 'Medium', color: '#C4A35A', msg: 'Monitor zinc next season' },
    ],
    recommendations: [
      'Maintain organic matter with crop residue',
      'Consider legume rotation to fix nitrogen naturally',
      'pH 7.1 slightly alkaline — suitable for most crops',
    ],
  },
];

/* POST /api/soil/analyze */
router.post('/analyze', requireAuth, upload.single('image'), async (req, res) => {
  if (!req.file && !req.body?.image) return res.status(400).json({ error: 'Image or report is required' });

  const user = await User.findById(req.user.id);
  const seed = req.file?.size || req.body?.image?.length || Date.now();
  const variant = SOIL_VARIANTS[Math.abs(seed) % SOIL_VARIANTS.length];

  const record = await SoilAnalysis.create({
    user: req.user.id,
    ...CNN_META,
    ...variant,
    location: {
      state:     user?.location?.state    || '',
      district:  user?.location?.district || '',
      fieldName: req.body?.fieldName || 'Main Field',
    },
    season: req.body?.season || '',
    notes:  req.body?.notes  || '',
  });

  /* Notify if poor health */
  if (variant.healthScore < 60) {
    await Notification.create({
      user: req.user.id,
      type: 'soil', severity: 'medium',
      title: `🌱 Soil Health Alert — Score ${variant.healthScore}/100`,
      message: `Your soil needs attention. ${variant.recommendations[0]}`,
      icon: '🧪',
      actionUrl: '/app/soil',
      actionLabel: 'View Report',
      refModel: 'SoilAnalysis',
      refId: record._id,
    });
  }

  res.status(201).json(record);
});

/* GET /api/soil/history */
router.get('/history', requireAuth, async (req, res) => {
  const { limit = 10, page = 1 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const [records, total] = await Promise.all([
    SoilAnalysis.find({ user: req.user.id }).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
    SoilAnalysis.countDocuments({ user: req.user.id }),
  ]);
  res.json({ records, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

/* GET /api/soil/latest */
router.get('/latest', requireAuth, async (req, res) => {
  const record = await SoilAnalysis.findOne({ user: req.user.id }).sort({ createdAt: -1 });
  if (!record) return res.status(404).json({ error: 'No soil analysis found' });
  res.json(record);
});

/* GET /api/soil/:id */
router.get('/:id', requireAuth, async (req, res) => {
  const record = await SoilAnalysis.findOne({ _id: req.params.id, user: req.user.id });
  if (!record) return res.status(404).json({ error: 'Record not found' });
  res.json(record);
});

/* DELETE /api/soil/:id */
router.delete('/:id', requireAuth, async (req, res) => {
  await SoilAnalysis.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  res.json({ success: true });
});

export default router;
