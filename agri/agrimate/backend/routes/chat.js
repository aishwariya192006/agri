import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import ChatHistory from '../models/ChatHistory.js';
import User from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

/* Multilingual AI responses — same engine as ai.js */
const RESPONSES = {
  weather:   { en: (f,l) => `**Current Conditions — ${l}:**\n\nTemperature: 28°C, Humidity: 62%.\nSoil moisture: **68%** (optimal).\n🌧 Rain forecast Wed–Thu (80–95%). Skip irrigation for 3 days.`, hi: (_,l) => `**मौसम — ${l}:** 28°C, बुध-गुरु बारिश। 3 दिन सिंचाई न करें।`, ta: (_,l) => `**வானிலை — ${l}:** 28°C, புதன்-வியாழன் மழை. 3 நாட்கள் பாசனம் வேண்டாம்.`, te: (_,l) => `**వాతావరణం — ${l}:** 28°C, బుధ-గురు వర్షం. 3 రోజులు నీరు వద్దు.`, kn: (_,l) => `**ಹವಾಮಾನ — ${l}:** 28°C, ಬುಧ-ಗುರು ಮಳೆ. 3 ದಿನ ನೀರಾವರಿ ಬೇಡ.`, ml: (_,l) => `**കാലാവസ്ഥ — ${l}:** 28°C, ബുധ-വ്യാഴം മഴ. 3 ദിവസം ജലസേചനം വേണ്ട.` },
  market:    { en: () => `**Today's Mandi Prices:**\n\n• Wheat: ₹2,350/qtl (+1.2%) ↑\n• Cotton: ₹6,800/qtl (+2.4%) ↑\n• Mustard: ₹5,420/qtl (+0.8%) ↑\n\n💡 Hold wheat 15–20 days for +8% gain.`, hi: () => `**मंडी भाव:** गेहूं ₹2,350, कपास ₹6,800। गेहूं 15 दिन रोकें।`, ta: () => `**மண்டி விலை:** கோதுமை ₹2,350, பருத்தி ₹6,800. கோதுமை 15 நாட்கள் வைக்கவும்.`, te: () => `**మండి ధరలు:** గోధుమ ₹2,350, పత్తి ₹6,800. 15 రోజులు ఆగండి.`, kn: () => `**ಮಂಡಿ ಬೆಲೆ:** ಗೋಧಿ ₹2,350, ಹತ್ತಿ ₹6,800. 15 ದಿನ ತಡೆಯಿರಿ.`, ml: () => `**മണ്ടി വില:** ഗോതമ്പ് ₹2,350, പരുത്തി ₹6,800. 15 ദിവസം കാക്കുക.` },
  irrigation:{ en: (f) => `**Irrigation — ${f.crops?.join(' & ')}:**\n\nSoil moisture 68% — skip today. Rain Wed–Thu. Next irrigation: Friday 18mm.`, hi: (f) => `सिंचाई: मिट्टी नमी 68% — आज नहीं। शुक्रवार सुबह करें।`, ta: (f) => `நீர்ப்பாசனம்: மண் 68% — இன்று வேண்டாம். வெள்ளி காலை.`, te: (f) => `నీరు: 68% — ఈ రోజు వద్దు. శుక్రవారం.`, kn: (f) => `ನೀರು: 68% — ಇಂದು ಬೇಡ. ಶುಕ್ರವಾರ.`, ml: (f) => `ജലം: 68% — ഇന്ന് വേണ്ട. വെള്ളി.` },
  disease:   { en: () => `**Disease Alert:**\n\n🔴 Wheat Leaf Rust — HIGH risk. Spray Propiconazole 25% EC immediately.\n✅ Upload crop photo in Disease Detection for instant AI diagnosis.`, hi: () => `रोग चेतावनी: गेहूं पत्ती जंग — तुरंत Propiconazole 25% EC छिड़काव।`, ta: () => `நோய்: கோதுமை இலை துரு — உடனடி Propiconazole தெளிக்கவும்.`, te: () => `వ్యాధి: గోధుమ తుప్పు — వెంటనే Propiconazole పిచికారీ.`, kn: () => `ರೋಗ: ಗೋಧಿ ತುಕ್ಕು — Propiconazole ಸಿಂಪಡಿಸಿ.`, ml: () => `രോഗം: ഗോതമ്പ് തുരുമ്പ് — Propiconazole ഉടൻ തളിക്കുക.` },
  schemes:   { en: (f) => `**Schemes for ${f.state}:**\n\n1. PM-Kisan — ₹6,000/yr\n2. PMFBY — Crop insurance\n3. Soil Health Card — Free testing\n4. KCC — Low interest loans`, hi: (f) => `योजनाएं: PM-किसान ₹6,000, PMFBY बीमा, KCC ऋण।`, ta: (f) => `திட்டங்கள்: PM-கிசான் ₹6,000, PMFBY காப்பீடு.`, te: (f) => `పథకాలు: PM-కిసాన్ ₹6,000, PMFBY బీమా.`, kn: (f) => `ಯೋಜನೆ: PM-ಕಿಸಾನ್ ₹6,000, PMFBY.`, ml: (f) => `പദ്ധതി: PM-കിസാൻ ₹6,000, PMFBY.` },
  default:   { en: (q,f,l) => `Based on your farm in **${l}** (${f.area} acres, ${f.crops?.join(' & ')}):\n\nAsk me about crops, irrigation, diseases, market prices, or government schemes.`, hi: (_,f,l) => `${l} के खेत के लिए: फसल, सिंचाई, रोग, बाजार, योजनाओं के बारे में पूछें।`, ta: (_,f,l) => `${l} பண்ணை: பயிர், நீர், நோய், சந்தை, திட்டங்கள் கேளுங்கள்.`, te: (_,f,l) => `${l} వ్యవసాయం: పంట, నీరు, వ్యాధి, మార్కెట్ అడగండి.`, kn: (_,f,l) => `${l} ಕೃಷಿ: ಬೆಳೆ, ನೀರು, ರೋಗ, ಮಾರುಕಟ್ಟೆ ಕೇಳಿ.`, ml: (_,f,l) => `${l} ഫാം: വിള, ജലം, രോഗം, വിപണി ചോദിക്കുക.` },
};

const CHIPS = {
  weather: ['Irrigation schedule','Pest forecast','Market prices'],
  market:  ['Best time to sell','Storage tips','Profit prediction'],
  irrigation: ['Soil moisture','Drip vs flood','Water saving'],
  disease: ['Upload crop photo','Treatment guide','Prevention'],
  schemes: ['Apply PM-Kisan','Crop insurance','KCC loan'],
  default: ['Weather update','Market prices','Crop advice'],
};

function detectTopic(msg) {
  const m = msg.toLowerCase();
  if (m.match(/weather|rain|temp|cloud|forecast|mausam|வானிலை|వాతావరణ/)) return 'weather';
  if (m.match(/market|price|mandi|sell|விலை|ధర|ಬೆಲೆ/))                  return 'market';
  if (m.match(/water|irrigat|sincha|நீர்|నీరు|ನೀರು|moisture/))           return 'irrigation';
  if (m.match(/disease|pest|rust|blight|rog|நோய்|వ్యాధి|ರೋಗ/))          return 'disease';
  if (m.match(/scheme|yojana|subsidy|govt|சர்க்கார்|ప్రభుత్వ/))         return 'schemes';
  return 'default';
}

/* POST /api/chat/message — send message, get AI reply, save to DB */
router.post('/message', requireAuth, async (req, res) => {
  const { message, sessionId, lang = 'en' } = req.body;
  if (!message?.trim()) return res.status(400).json({ error: 'Message is required' });

  const user = await User.findById(req.user.id);
  const farm = user?.farm || { state: 'Punjab', area: 12, crops: ['Wheat', 'Cotton'] };
  const location = user?.location || { state: 'Punjab', district: 'Ludhiana' };
  const loc = [location.district, location.state].filter(Boolean).join(', ');
  const activeLang = lang || user?.preferredLang || 'en';
  const sid = sessionId || uuidv4();
  const topic = detectTopic(message.trim());

  /* Build AI response */
  const tpl = RESPONSES[topic]?.[activeLang] || RESPONSES[topic]?.en || RESPONSES.default.en;
  let text;
  try {
    text = topic === 'default' ? tpl(message, farm, loc)
         : topic === 'schemes' ? tpl(farm)
         : ['weather'].includes(topic) ? tpl(farm, loc)
         : tpl(farm);
  } catch { text = RESPONSES.default.en(message, farm, loc); }

  const chips = CHIPS[topic] || CHIPS.default;

  /* Upsert chat session */
  const userMsg = { role: 'user', text: message.trim(), timestamp: new Date() };
  const aiMsg   = { role: 'ai',   text, chips, topic, timestamp: new Date() };

  let session = await ChatHistory.findOne({ user: req.user.id, sessionId: sid });
  if (!session) {
    session = await ChatHistory.create({
      user: req.user.id,
      sessionId: sid,
      title: message.trim().slice(0, 50),
      lang: activeLang,
      topic,
      location: { state: location.state, district: location.district },
      messages: [userMsg, aiMsg],
      messageCount: 2,
      lastMessage: text.slice(0, 100),
    });
  } else {
    session.messages.push(userMsg, aiMsg);
    session.messageCount = session.messages.length;
    session.lastMessage  = text.slice(0, 100);
    await session.save();
  }

  res.json({ text, chips, topic, lang: activeLang, sessionId: sid });
});

/* GET /api/chat/sessions — list all sessions */
router.get('/sessions', requireAuth, async (req, res) => {
  const sessions = await ChatHistory.find({ user: req.user.id })
    .sort({ updatedAt: -1 }).limit(20)
    .select('sessionId title lang topic lastMessage messageCount updatedAt').lean();
  res.json({ sessions });
});

/* GET /api/chat/session/:sessionId — get full session */
router.get('/session/:sessionId', requireAuth, async (req, res) => {
  const session = await ChatHistory.findOne({ user: req.user.id, sessionId: req.params.sessionId });
  if (!session) return res.status(404).json({ error: 'Session not found' });
  res.json(session);
});

/* DELETE /api/chat/session/:sessionId */
router.delete('/session/:sessionId', requireAuth, async (req, res) => {
  await ChatHistory.findOneAndDelete({ user: req.user.id, sessionId: req.params.sessionId });
  res.json({ success: true });
});

/* DELETE /api/chat/all */
router.delete('/all', requireAuth, async (req, res) => {
  await ChatHistory.deleteMany({ user: req.user.id });
  res.json({ success: true });
});

export default router;
