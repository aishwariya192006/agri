import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import User from '../models/User.js';

const router = Router();

/* ── Location-aware crop recommendations ─────────────── */
const LOCATION_CROPS = {
  Punjab:       { Kharif: ['Rice', 'Cotton', 'Maize'], Rabi: ['Wheat', 'Mustard', 'Chickpea'] },
  Maharashtra:  { Kharif: ['Soybean', 'Cotton', 'Jowar'], Rabi: ['Wheat', 'Gram', 'Onion'] },
  Karnataka:    { Kharif: ['Rice', 'Maize', 'Groundnut'], Rabi: ['Wheat', 'Sunflower', 'Mustard'] },
  TamilNadu:    { Kharif: ['Rice', 'Groundnut', 'Cotton'], Rabi: ['Wheat', 'Sugarcane', 'Banana'] },
  AndhraPradesh:{ Kharif: ['Rice', 'Cotton', 'Chilli'], Rabi: ['Groundnut', 'Sunflower', 'Maize'] },
};

/* ── Multilingual response templates (Feature 2) ─────── */
const RESPONSES = {
  weather: {
    en: (f, loc) => `**Current Conditions — ${loc}:**\n\nTemperature: 28°C, Humidity: 62%, Partly Cloudy.\nSoil moisture: **68%** (optimal).\n\n🌧 Rain forecast Wednesday–Thursday (80–95% chance).\n➡ **Skip irrigation for next 3 days** — save water and cost.`,
    hi: (f, loc) => `**मौसम — ${loc}:**\n\nतापमान: 28°C, नमी: 62%, आंशिक बादल।\nमिट्टी नमी: **68%** (उत्तम)।\n\n🌧 बुध-गुरु को बारिश (80-95%) संभावना।\n➡ **अगले 3 दिन सिंचाई न करें** — पानी और खर्च बचाएं।`,
    ta: (f, loc) => `**வானிலை — ${loc}:**\n\nவெப்பநிலை: 28°C, ஈரப்பதம்: 62%.\nமண் ஈரம்: **68%** (சரியானது).\n\n🌧 புதன்-வியாழன் மழை (80-95%).\n➡ **3 நாட்கள் நீர்ப்பாசனம் தவிர்க்கவும்**.`,
    te: (f, loc) => `**వాతావరణం — ${loc}:**\n\nఉష్ణోగ్రత: 28°C, ఆర్ద్రత: 62%.\nమట్టి తేమ: **68%** (సరైనది).\n\n🌧 బుధ-గురు వర్షం (80-95%).\n➡ **3 రోజులు నీటిపారుదల వద్దు**.`,
    kn: (f, loc) => `**ಹವಾಮಾನ — ${loc}:**\n\nಉಷ್ಣಾಂಶ: 28°C, ಆರ್ದ್ರತೆ: 62%.\nಮಣ್ಣು ತೇವ: **68%** (ಸರಿಯಾದ).\n\n🌧 ಬುಧ-ಗುರು ಮಳೆ (80-95%).\n➡ **3 ದಿನ ನೀರಾವರಿ ಬೇಡ**.`,
    ml: (f, loc) => `**കാലാവസ്ഥ — ${loc}:**\n\nതാപനില: 28°C, ഈർപ്പം: 62%.\nമണ്ണ് ഈർപ്പം: **68%** (ഉചിതം).\n\n🌧 ബുധ-വ്യാഴം മഴ (80-95%).\n➡ **3 ദിവസം ജലസേചനം വേണ്ട**.`,
  },
  market: {
    en: () => `**Today's Mandi Prices:**\n\n• Wheat: ₹2,350/qtl (+1.2%) ↑\n• Cotton: ₹6,800/qtl (+2.4%) ↑\n• Mustard: ₹5,420/qtl (+0.8%) ↑\n• Rice: ₹1,960/qtl (stable)\n\n💡 **Recommendation:** Wheat prices trending up — consider selling 40% of stock this week. Hold cotton for 10 more days for max profit.`,
    hi: () => `**आज के मंडी भाव:**\n\n• गेहूं: ₹2,350/क्विंटल (+1.2%) ↑\n• कपास: ₹6,800/क्विंटल (+2.4%) ↑\n• सरसों: ₹5,420/क्विंटल (+0.8%) ↑\n\n💡 **सुझाव:** गेहूं के दाम बढ़ रहे हैं — इस हफ्ते 40% स्टॉक बेचें।`,
    ta: () => `**இன்றைய மண்டி விலைகள்:**\n\n• கோதுமை: ₹2,350/குவிண்டல் (+1.2%) ↑\n• பருத்தி: ₹6,800/குவிண்டல் (+2.4%) ↑\n\n💡 **பரிந்துரை:** கோதுமை விலை உயர்கிறது — 40% விற்கவும்.`,
    te: () => `**నేటి మండి ధరలు:**\n\n• గోధుమ: ₹2,350/క్వింటల్ (+1.2%) ↑\n• పత్తి: ₹6,800/క్వింటల్ (+2.4%) ↑\n\n💡 **సిఫార్సు:** గోధుమ ధరలు పెరుగుతున్నాయి — 40% అమ్మండి.`,
    kn: () => `**ಇಂದಿನ ಮಂಡಿ ಬೆಲೆಗಳು:**\n\n• ಗೋಧಿ: ₹2,350/ಕ್ವಿಂಟಲ್ (+1.2%) ↑\n• ಹತ್ತಿ: ₹6,800/ಕ್ವಿಂಟಲ್ (+2.4%) ↑\n\n💡 **ಸಲಹೆ:** ಗೋಧಿ ಬೆಲೆ ಏರುತ್ತಿದೆ — 40% ಮಾರಿ.`,
    ml: () => `**ഇന്നത്തെ മണ്ടി വിലകൾ:**\n\n• ഗോതമ്പ്: ₹2,350/ക്വിന്റൽ (+1.2%) ↑\n• പരുത്തി: ₹6,800/ക്വിന്റൽ (+2.4%) ↑\n\n💡 **ശുപാർശ:** ഗോതമ്പ് വില ഉയരുന്നു — 40% വിൽക്കുക.`,
  },
  irrigation: {
    en: (f) => `**Irrigation Schedule for ${f.crops?.join(' & ')}:**\n\n• Current soil moisture: **68%** — no irrigation needed today.\n• Rain expected Wed–Thu — skip irrigation.\n• Next irrigation: **Friday morning, 18mm**.\n\nTip: Use drip irrigation to save 40% water vs flood irrigation.`,
    hi: (f) => `**${f.crops?.join(' व ')} सिंचाई:**\n\n• मिट्टी नमी: **68%** — आज सिंचाई नहीं।\n• बुध-गुरु बारिश — सिंचाई छोड़ें।\n• अगली सिंचाई: **शुक्रवार सुबह**।`,
    ta: (f) => `**${f.crops?.join(', ')} நீர்ப்பாசன அட்டவணை:**\n\n• மண் ஈரம்: **68%** — இன்று பாசனம் வேண்டாம்.\n• புதன்-வியாழன் மழை — தவிர்க்கவும்.\n• அடுத்த பாசனம்: **வெள்ளிக்கிழமை காலை**.`,
    te: (f) => `**${f.crops?.join(', ')} నీటిపారుదల:**\n\n• మట్టి తేమ: **68%** — ఈ రోజు నీరు వద్దు.\n• బుధ-గురు వర్షం — దాటండి.\n• తదుపరి: **శుక్రవారం ఉదయం**.`,
    kn: (f) => `**${f.crops?.join(', ')} ನೀರಾವರಿ:**\n\n• ಮಣ್ಣು ತೇವ: **68%** — ಇಂದು ಬೇಡ.\n• ಬುಧ-ಗುರು ಮಳೆ — ತಪ್ಪಿಸಿ.\n• ಮುಂದಿನ: **ಶುಕ್ರವಾರ ಬೆಳಿಗ್ಗೆ**.`,
    ml: (f) => `**${f.crops?.join(', ')} ജലസേചനം:**\n\n• മണ്ണ് ഈർപ്പം: **68%** — ഇന്ന് വേണ്ട.\n• ബുധ-വ്യാഴം മഴ — ഒഴിവാക്കുക.\n• അടുത്തത്: **വെള്ളിയാഴ്ച രാവിലെ**.`,
  },
  crops: {
    en: (f, loc) => {
      const season = new Date().getMonth() < 6 ? 'Rabi' : 'Kharif';
      const crops = LOCATION_CROPS[f.state]?.[season] || ['Wheat', 'Mustard', 'Chickpea'];
      return `**Best Crops for ${loc} — ${season} Season:**\n\n${crops.map((c,i) => `${i+1}. **${c}**`).join('\n')}\n\nBased on your soil type (${f.soilType || 'Loamy'}), local climate, and current market prices.`;
    },
    hi: (f, loc) => `**${loc} के लिए उपयुक्त फसलें:**\n\nआपकी मिट्टी और जलवायु के अनुसार: गेहूं, सरसों, चना\n\nसही बीज, सही समय — अधिक उत्पादन।`,
    ta: (f, loc) => `**${loc} க்கான பொருத்தமான பயிர்கள்:**\n\nகோதுமை, கடுகு, கொண்டைக்கடலை பரிந்துரைக்கப்படுகிறது.`,
    te: (f, loc) => `**${loc} కోసం తగిన పంటలు:**\n\nగోధుమ, ఆవాలు, శనగ సిఫార్సు చేయబడింది.`,
    kn: (f, loc) => `**${loc} ಗೆ ಸೂಕ್ತ ಬೆಳೆಗಳು:**\n\nಗೋಧಿ, ಸಾಸಿವೆ, ಕಡಲೆ ಶಿಫಾರಸು.`,
    ml: (f, loc) => `**${loc} ലെ അനുയോജ്യ വിളകൾ:**\n\nഗോതമ്പ്, കടുക്, ഛോള ശുപാർശ ചെയ്യുന്നു.`,
  },
  disease: {
    en: () => `**Common Disease Alerts for your region:**\n\n🔴 **Wheat Leaf Rust** — Risk HIGH this week (humid conditions)\n• Spray Propiconazole 25% EC @ 0.1% immediately\n• Monitor fields daily\n\n🟡 **Powdery Mildew on Mustard** — Risk MEDIUM\n• Apply Sulfur 80% WP @ 2g/liter as preventive\n\n✅ Use our Disease Detection module to scan your crop photos for instant AI diagnosis.`,
    hi: () => `**आपके क्षेत्र में रोग चेतावनी:**\n\n🔴 **गेहूं की पत्ती जंग** — इस हफ्ते खतरा अधिक\n• Propiconazole 25% EC छिड़काव तुरंत करें\n\n✅ रोग पहचान मॉड्यूल से फसल फोटो अपलोड करें।`,
    ta: () => `**உங்கள் பகுதியில் நோய் எச்சரிக்கை:**\n\n🔴 **கோதுமை இலை துரு** — இந்த வாரம் அதிக ஆபத்து\n• Propiconazole 25% EC தெளிக்கவும்\n\n✅ நோய் கண்டறிதல் பகுதியில் படம் பதிவேற்றவும்.`,
    te: () => `**మీ ప్రాంతంలో వ్యాధి హెచ్చరిక:**\n\n🔴 **గోధుమ ఆకు తుప్పు** — అధిక ప్రమాదం\n• Propiconazole 25% EC వెంటనే పిచికారీ చేయండి`,
    kn: () => `**ನಿಮ್ಮ ಪ್ರದೇಶದ ರೋಗ ಎಚ್ಚರಿಕೆ:**\n\n🔴 **ಗೋಧಿ ಎಲೆ ತುಕ್ಕು** — ಈ ವಾರ ಹೆಚ್ಚಿನ ಅಪಾಯ\n• Propiconazole 25% EC ಸಿಂಪಡಿಸಿ`,
    ml: () => `**നിങ്ങളുടെ പ്രദേശത്ത് രോഗ മുന്നറിയിപ്പ്:**\n\n🔴 **ഗോതമ്പ് ഇല തുരുമ്പ്** — ഉയർന്ന അപകടം\n• Propiconazole 25% EC ഉടൻ തളിക്കുക`,
  },
  schemes: {
    en: (f) => `**Government Schemes for ${f.state || 'Punjab'} Farmers:**\n\n1. **PM-Kisan** — ₹6,000/year direct benefit\n2. **PMFBY** — Crop insurance at subsidized rates\n3. **Soil Health Card Scheme** — Free soil testing\n4. **KCC (Kisan Credit Card)** — Low interest farm loans\n5. **e-NAM** — Online mandi trading platform\n\nApply at your nearest Common Service Centre or visit pmkisan.gov.in`,
    hi: (f) => `**${f.state || 'पंजाब'} के किसानों के लिए सरकारी योजनाएं:**\n\n1. **PM-किसान** — ₹6,000/वर्ष\n2. **PMFBY** — फसल बीमा\n3. **मृदा स्वास्थ्य कार्ड** — मुफ्त मिट्टी परीक्षण\n4. **किसान क्रेडिट कार्ड** — कम ब्याज ऋण`,
    ta: (f) => `**${f.state || 'Punjab'} விவசாயிகளுக்கான அரசு திட்டங்கள்:**\n\n1. PM-கிசான் — ₹6,000/ஆண்டு\n2. PMFBY — பயிர் காப்பீடு\n3. மண் சுகாதார அட்டை — இலவச மண் பரிசோதனை`,
    te: (f) => `**${f.state || 'Punjab'} రైతుల కోసం ప్రభుత్వ పథకాలు:**\n\n1. PM-కిసాన్ — ₹6,000/సంవత్సరం\n2. PMFBY — పంట బీమా\n3. నేల ఆరోగ్య కార్డు — ఉచిత నేల పరీక్ష`,
    kn: (f) => `**${f.state || 'Punjab'} ರೈತರಿಗೆ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು:**\n\n1. PM-ಕಿಸಾನ್ — ₹6,000/ವರ್ಷ\n2. PMFBY — ಬೆಳೆ ವಿಮೆ\n3. ಮಣ್ಣು ಆರೋಗ್ಯ ಕಾರ್ಡ್ — ಉಚಿತ ಮಣ್ಣು ಪರೀಕ್ಷೆ`,
    ml: (f) => `**${f.state || 'Punjab'} കർഷകർക്കുള്ള സർക്കാർ പദ്ധതികൾ:**\n\n1. PM-കിസാൻ — ₹6,000/വർഷം\n2. PMFBY — വിള ഇൻഷുറൻസ്\n3. മണ്ണ് ആരോഗ്യ കാർഡ് — സൗജന്യ മണ്ണ് പരിശോധന`,
  },
  default: {
    en: (q, f, loc) => `Based on your farm in **${loc}** (${f.area} acres, ${f.crops?.join(' & ')}):\n\nI can help you with:\n• 🌱 Crop recommendations for your soil & climate\n• 💧 Irrigation scheduling\n• 🐛 Disease & pest alerts\n• 📈 Market prices & sell timing\n• 🏛 Government schemes\n• 🌤 Weather forecasts\n\nWhat specific advice do you need today?`,
    hi: (q, f, loc) => `आपके ${loc} के खेत (${f.area} एकड़, ${f.crops?.join(' व ')}) के लिए:\n\nमैं मदद कर सकता हूं:\n• फसल सुझाव, सिंचाई, रोग, बाजार भाव और सरकारी योजनाएं\n\nआज क्या जानना चाहते हैं?`,
    ta: (q, f, loc) => `உங்கள் ${loc} பண்ணை (${f.area} ஏக்கர்) அடிப்படையில்:\n\nபயிர் பரிந்துரை, நீர்ப்பாசனம், நோய், சந்தை விலை, அரசு திட்டங்கள் பற்றி கேளுங்கள்.`,
    te: (q, f, loc) => `మీ ${loc} వ్యవసాయం (${f.area} ఎకరాలు) ఆధారంగా:\n\nపంట సిఫార్సు, నీటిపారుదల, వ్యాధి, మార్కెట్, పథకాలు అడగండి.`,
    kn: (q, f, loc) => `ನಿಮ್ಮ ${loc} ಕೃಷಿ (${f.area} ಎಕರೆ) ಆಧರಿಸಿ:\n\nಬೆಳೆ ಶಿಫಾರಸು, ನೀರಾವರಿ, ರೋಗ, ಮಾರುಕಟ್ಟೆ, ಯೋಜನೆಗಳ ಬಗ್ಗೆ ಕೇಳಿ.`,
    ml: (q, f, loc) => `നിങ്ങളുടെ ${loc} ഫാം (${f.area} ഏക്കർ) അടിസ്ഥാനമാക്കി:\n\nവിള ശുപാർശ, ജലസേചനം, രോഗം, വിപണി, പദ്ധതികൾ ചോദിക്കുക.`,
  },
};

const CHIPS = {
  weather: ['Irrigation schedule', 'Pest forecast', 'Market prices'],
  market:  ['Best time to sell', 'Storage tips', 'Profit prediction'],
  irrigation: ['Soil moisture check', 'Drip vs flood', 'Water saving tips'],
  crops:   ['Fertilizer guide', 'Sowing calendar', 'Yield estimate'],
  disease: ['Upload crop photo', 'Treatment guide', 'Prevention tips'],
  schemes: ['Apply for PM-Kisan', 'Crop insurance', 'KCC loan'],
  default: ['Weather update', 'Market prices', 'Crop advice'],
};

function detectTopic(msg) {
  const m = msg.toLowerCase();
  if (m.match(/weather|rain|temperature|cloud|forecast|mausam|வானிலை|వాతావరణ|ಹವಾಮಾನ|കാലാവസ്ഥ/)) return 'weather';
  if (m.match(/market|price|mandi|sell|mandhi|விலை|ధర|ಬೆಲೆ|വില/)) return 'market';
  if (m.match(/water|irrigat|sincha|நீர்|నీరు|ನೀರು|ജലം|moisture/)) return 'irrigation';
  if (m.match(/crop|seed|sow|plant|பயிர்|పంట|ಬೆಳೆ|വിള|fasal|beej/)) return 'crops';
  if (m.match(/disease|pest|rust|blight|fungus|rog|நோய்|వ్యాధి|ರೋಗ|രോഗ/)) return 'disease';
  if (m.match(/scheme|yojana|subsidy|government|govt|சர்க்கார்|ప్రభుత్వ|ಸರ್ಕಾರ|സർക്കാർ/)) return 'schemes';
  return 'default';
}

router.post('/chat', requireAuth, async (req, res) => {
  const { message, lang = 'en' } = req.body;
  if (!message?.trim()) return res.status(400).json({ error: 'Message is required' });

  const user = await User.findById(req.user.id);
  const farm = user?.farm || { state: 'Punjab', area: 12, crops: ['Wheat', 'Cotton'], soilType: 'Loamy' };
  const location = user?.location || { state: 'Punjab', district: 'Ludhiana', village: '' };
  const loc = [location.village, location.district, location.state].filter(Boolean).join(', ') || 'Punjab';
  const activeLang = lang || user?.preferredLang || 'en';

  const topic = detectTopic(message.trim());
  const tpl = RESPONSES[topic]?.[activeLang] || RESPONSES[topic]?.['en'] || RESPONSES.default.en;

  let text;
  try {
    text = topic === 'default'
      ? tpl(message.trim(), farm, loc)
      : (topic === 'weather' || topic === 'crops' || topic === 'schemes')
        ? tpl(farm, loc)
        : tpl(farm);
  } catch {
    text = RESPONSES.default.en(message.trim(), farm, loc);
  }

  res.json({
    text,
    chips: CHIPS[topic] || CHIPS.default,
    topic,
    lang: activeLang,
    location: loc,
  });
});

export default router;
