import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import DiseaseAnalysis from '../models/DiseaseAnalysis.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

/* ─── Mock fallback data (used when no API key) ───────── */
const MOCK_DISEASES = [
  {
    disease: 'Wheat Leaf Rust (Puccinia triticina)',
    confidence: 96.8, severity: 'High', affectedArea: '30–40%',
    causes: ['Humid weather conditions', 'Dense plant spacing', 'Susceptible variety'],
    treatments: [
      { name: 'Propiconazole 25% EC',    dosage: '0.1% solution', method: 'Foliar spray immediately',      type: 'Chemical'   },
      { name: 'Tebuconazole 25.9% EC',   dosage: '0.1% solution', method: 'Alternate spray after 10 days', type: 'Chemical'   },
      { name: 'Pseudomonas fluorescens', dosage: '10g/liter',      method: 'For mild early stages',         type: 'Biological' },
    ],
    preventive: ['Use resistant varieties (HD-2967, PBW-550)', 'Avoid excess nitrogen', 'Ensure proper spacing'],
  },
  {
    disease: 'Yellow Rust (Puccinia striiformis)',
    confidence: 94.2, severity: 'Medium', affectedArea: '15–25%',
    causes: ['Cool and humid weather', 'Dense canopy', 'Late sowing'],
    treatments: [
      { name: 'Tebuconazole 25.9% EC', dosage: '0.1% solution', method: 'Foliar spray',              type: 'Chemical' },
      { name: 'Mancozeb 75% WP',       dosage: '2g/liter',      method: 'Preventive spray every 10 days', type: 'Chemical' },
    ],
    preventive: ['Monitor weekly', 'Avoid late sowing', 'Use resistant varieties'],
  },
  {
    disease: 'Powdery Mildew (Erysiphe graminis)',
    confidence: 91.5, severity: 'Low', affectedArea: '10–15%',
    causes: ['Dry hot days with humid nights', 'Excess nitrogen'],
    treatments: [
      { name: 'Sulfur 80% WP',        dosage: '2g/liter',   method: 'Dust or spray on leaves', type: 'Chemical' },
      { name: 'Karathane (Dinocap)',   dosage: '1ml/liter',  method: 'Foliar spray',            type: 'Chemical' },
    ],
    preventive: ['Avoid excess nitrogen', 'Improve air circulation', 'Use tolerant varieties'],
  },
  {
    disease: 'Brown Spot (Helminthosporium oryzae)',
    confidence: 89.3, severity: 'Medium', affectedArea: '20–30%',
    causes: ['Nutrient deficiency (N, K)', 'Water stress', 'High humidity'],
    treatments: [
      { name: 'Mancozeb 75% WP',       dosage: '2g/liter',   method: 'Foliar spray',                        type: 'Chemical' },
      { name: 'Propiconazole 25% EC',   dosage: '0.1%',       method: 'Spray at first appearance of symptoms', type: 'Chemical' },
    ],
    preventive: ['Balanced NPK fertilization', 'Avoid water stress', 'Use certified disease-free seeds'],
  },
  {
    disease: 'Bacterial Blight (Xanthomonas oryzae)',
    confidence: 87.6, severity: 'High', affectedArea: '25–35%',
    causes: ['Flood or rain splash', 'High temperature + humidity', 'Contaminated seeds'],
    treatments: [
      { name: 'Copper Oxychloride 50% WP', dosage: '3g/liter', method: 'Spray at 10-day intervals', type: 'Chemical' },
      { name: 'Streptomycin Sulphate',      dosage: '0.5g/liter', method: 'Foliar spray',           type: 'Chemical' },
    ],
    preventive: ['Use resistant varieties', 'Avoid overhead irrigation', 'Treat seeds before sowing'],
  },
];

/* ─── Disease info lookup by class label ─────────────── */
const DISEASE_INFO = {
  'Apple__black_rot':                { causes: ['Fungal infection (Botryosphaeria obtusa)', 'Warm humid weather'],       treatments: [{ name: 'Captan 50% WP', dosage: '2g/L', method: 'Foliar spray every 10 days', type: 'Chemical' }],       preventive: ['Remove mummified fruits', 'Prune infected branches'] },
  'Apple__Healthy':                  { causes: [],                                                                         treatments: [],                                                                                                        preventive: ['Maintain balanced nutrition', 'Regular monitoring'] },
  'Apple__Rotten':                   { causes: ['Post-harvest fungal decay', 'Physical damage'],                          treatments: [{ name: 'Thiabendazole', dosage: 'Per label', method: 'Post-harvest dip', type: 'Chemical' }],           preventive: ['Handle fruit carefully', 'Store at proper temperature'] },
  'Apple__rust':                     { causes: ['Cedar-apple rust (Gymnosporangium juniperi-virginianae)', 'Wet spring'],  treatments: [{ name: 'Myclobutanil', dosage: '1ml/L', method: 'Spray at pink bud stage', type: 'Chemical' }],           preventive: ['Remove nearby junipers', 'Use resistant varieties'] },
  'Apple__scab':                     { causes: ['Venturia inaequalis fungus', 'Cool wet weather'],                        treatments: [{ name: 'Mancozeb 75% WP', dosage: '2g/L', method: 'Spray at bud break', type: 'Chemical' }],            preventive: ['Rake fallen leaves', 'Use resistant cultivars'] },
  'Banana__Healthy':                 { causes: [],                                                                         treatments: [],                                                                                                        preventive: ['Regular soil testing', 'Proper irrigation'] },
  'Banana__Rotten':                  { causes: ['Panama disease', 'Anthracnose', 'Over-ripening'],                        treatments: [{ name: 'Propiconazole', dosage: '0.1%', method: 'Foliar spray', type: 'Chemical' }],                     preventive: ['Use disease-free planting material', 'Crop rotation'] },
  'Bellpepper__Healthy':             { causes: [],                                                                         treatments: [],                                                                                                        preventive: ['Adequate spacing', 'Balanced fertilization'] },
  'Bellpepper__Rotten':              { causes: ['Phytophthora blight', 'Bacterial soft rot'],                             treatments: [{ name: 'Copper Oxychloride', dosage: '3g/L', method: 'Foliar + soil drench', type: 'Chemical' }],        preventive: ['Improve drainage', 'Avoid overwatering'] },
  'Carrot__Healthy':                 { causes: [],                                                                         treatments: [],                                                                                                        preventive: ['Crop rotation', 'Well-drained soil'] },
  'Carrot__Rotten':                  { causes: ['Cavity spot', 'Root rot (Pythium spp.)'],                                treatments: [{ name: 'Thiram', dosage: '3g/kg seed', method: 'Seed treatment', type: 'Chemical' }],                    preventive: ['Avoid waterlogging', 'Maintain soil pH 6–7'] },
  'Cassava__bacterial_blight':       { causes: ['Xanthomonas axonopodis pv. manihotis', 'Infected cuttings'],             treatments: [{ name: 'Copper Oxychloride 50%', dosage: '3g/L', method: 'Spray every 10 days', type: 'Chemical' }],     preventive: ['Use disease-free cuttings', 'Avoid overhead irrigation'] },
  'Cassava__brown_streak_disease':   { causes: ['CBSD virus', 'Whitefly transmission'],                                   treatments: [{ name: 'Imidacloprid', dosage: '0.5ml/L', method: 'Spray for whitefly control', type: 'Chemical' }],     preventive: ['Use virus-tested cuttings', 'Control whitefly vectors'] },
  'Cassava__green_mottle':           { causes: ['Cassava green mottle virus (CsGMV)', 'Mealybug vectors'],                treatments: [{ name: 'Dimethoate', dosage: '2ml/L', method: 'Spray for vector control', type: 'Chemical' }],           preventive: ['Remove infected plants', 'Use clean planting material'] },
  'Cassava__healthy':                { causes: [],                                                                         treatments: [],                                                                                                        preventive: ['Regular scouting', 'Balanced nutrition'] },
  'Cassava__mosaic_disease':         { causes: ['African cassava mosaic virus', 'Bemisia tabaci whitefly'],               treatments: [{ name: 'Thiamethoxam', dosage: '0.5g/L', method: 'Drench or foliar', type: 'Chemical' }],              preventive: ['Plant resistant varieties', 'Rogue infected plants early'] },
  'Cherry__healthy':                 { causes: [],                                                                         treatments: [],                                                                                                        preventive: ['Proper pruning', 'Balanced fertilization'] },
  'Cherry__powdery_mildew':          { causes: ['Podosphaera clandestina fungus', 'Low humidity + warm days'],            treatments: [{ name: 'Sulfur 80% WP', dosage: '2g/L', method: 'Dust or foliar spray', type: 'Chemical' }],           preventive: ['Improve air circulation', 'Avoid excess nitrogen'] },
};

/* ─── TensorFlow model microservice integration ──────── */
async function analyzeWithTFModel(imageBuffer, mimeType = 'image/jpeg') {
  const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5050';
  try {
    const FormData = (await import('form-data')).default;
    const form = new FormData();
    form.append('image', imageBuffer, { filename: 'image.jpg', contentType: mimeType });
    const resp = await fetch(`${ML_SERVICE_URL}/predict`, { method: 'POST', body: form, headers: form.getHeaders() });
    if (!resp.ok) return null;
    const data = await resp.json();

    const label      = data.prediction || '';
    const confidence = data.confidence || 0;
    const severity   = confidence >= 85 ? 'High' : confidence >= 60 ? 'Medium' : 'Low';
    const info       = DISEASE_INFO[label] || { causes: ['Environmental stress'], treatments: [], preventive: ['Monitor field regularly'] };
    const isHealthy  = label.toLowerCase().includes('healthy');

    return {
      disease:      label.replace(/__/g, ' — ').replace(/_/g, ' '),
      confidence:   Math.round(confidence * 10) / 10,
      severity:     isHealthy ? 'None' : severity,
      affectedArea: isHealthy ? '0%' : `${Math.round(confidence * 0.3)}–${Math.round(confidence * 0.45)}%`,
      causes:       info.causes,
      treatments:   info.treatments.length ? info.treatments : [{ name: 'Consult local agronomist', dosage: '-', method: 'Professional diagnosis recommended', type: 'General' }],
      preventive:   info.preventive,
      isRealAI:     true,
      top3:         data.top3 || [],
    };
  } catch {
    return null;
  }
}

/* ─── Severity scorer ─────────────────────────────────── */
function getSeverityLabel(confidence) {
  if (confidence >= 90) return 'High';
  if (confidence >= 70) return 'Medium';
  return 'Low';
}

/* ─── POST /api/disease/analyze ──────────────────────── */
router.post('/analyze', requireAuth, upload.single('image'), async (req, res) => {
  if (!req.file && !req.body?.image) return res.status(400).json({ error: 'Image is required' });

  const user = await User.findById(req.user.id);
  let diseaseData = null;
  let usedRealAI  = false;
  let modelInfo   = { model: 'CNN-AgriMate-v1 (Mock)', architecture: 'Rule-based fallback', analysisType: 'Simulated CNN' };

  /* Try local TensorFlow model first */
  if (req.file) {
    try {
      const result = await analyzeWithTFModel(req.file.buffer, req.file.mimetype);
      if (result) {
        diseaseData = result;
        usedRealAI  = true;
        modelInfo   = {
          model:        'CNN-AgriMate-TF (MobileNetV2)',
          architecture: 'MobileNetV2 fine-tuned on 18-class crop dataset',
          analysisType: 'Deep Learning — Local TensorFlow Model',
          framework:    'TensorFlow 2.21 / Keras',
          inputSize:    '224x224',
          isRealAI:     true,
        };
      }
    } catch (err) {
      console.warn('TF model service failed, using mock:', err.message);
    }
  }

  /* Fallback to mock if API unavailable or no key */
  if (!diseaseData) {
    const seed = req.file?.size || req.body?.image?.length || Date.now();
    diseaseData = MOCK_DISEASES[Math.abs(seed) % MOCK_DISEASES.length];
    modelInfo   = {
      model:        'CNN-AgriMate-v1 (Simulation)',
      architecture: 'ResNet-50 (Mock — start predict_service.py for real AI)',
      analysisType: 'Simulated CNN — run predict_service.py for TensorFlow AI',
      framework:    'Static rule-based',
      isRealAI:     false,
    };
  }

  /* Save to MongoDB */
  const record = await DiseaseAnalysis.create({
    user: req.user.id,
    ...modelInfo,
    cropType: req.body?.cropType || '',
    disease:      diseaseData.disease,
    confidence:   diseaseData.confidence,
    severity:     diseaseData.severity,
    affectedArea: diseaseData.affectedArea,
    causes:       diseaseData.causes,
    treatments:   diseaseData.treatments,
    preventive:   diseaseData.preventive,
    location: {
      state:    user?.location?.state    || '',
      district: user?.location?.district || '',
    },
  });

  /* Auto-notification for high severity */
  if (['High', 'Critical'].includes(diseaseData.severity)) {
    await Notification.create({
      user: req.user.id,
      type: 'disease', severity: 'high',
      title: `⚠️ ${diseaseData.severity} Risk: ${diseaseData.disease.split('(')[0].trim()}`,
      message: `${diseaseData.affectedArea} of your field affected. Apply ${diseaseData.treatments[0]?.name} immediately.`,
      icon: '🌿',
      actionUrl: '/app/disease',
      actionLabel: 'View Treatment',
      refModel: 'DiseaseAnalysis',
      refId: record._id,
    });
  }

  res.status(201).json({
    ...record.toObject(),
    usedRealAI,
    analyzedAt: record.createdAt,
  });
});

/* ─── GET /api/disease/history ───────────────────────── */
router.get('/history', requireAuth, async (req, res) => {
  const { limit = 10, page = 1 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const [records, total] = await Promise.all([
    DiseaseAnalysis.find({ user: req.user.id }).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
    DiseaseAnalysis.countDocuments({ user: req.user.id }),
  ]);
  res.json({ records, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

/* ─── GET /api/disease/:id ───────────────────────────── */
router.get('/:id', requireAuth, async (req, res) => {
  const record = await DiseaseAnalysis.findOne({ _id: req.params.id, user: req.user.id });
  if (!record) return res.status(404).json({ error: 'Record not found' });
  res.json(record);
});

/* ─── PATCH /api/disease/:id/status ─────────────────── */
router.patch('/:id/status', requireAuth, async (req, res) => {
  const { status, notes } = req.body;
  const record = await DiseaseAnalysis.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { $set: { status, notes } },
    { new: true }
  );
  if (!record) return res.status(404).json({ error: 'Record not found' });
  res.json(record);
});

/* ─── DELETE /api/disease/:id ────────────────────────── */
router.delete('/:id', requireAuth, async (req, res) => {
  await DiseaseAnalysis.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  res.json({ success: true });
});

export default router;
