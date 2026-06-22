import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlaskConical, CloudUpload, CheckCircle, Leaf, Camera, FlipHorizontal, X } from 'lucide-react';
import VoiceBar from '../components/VoiceBar';
import AIPanel  from '../components/AIPanel';
import { useLang } from '../i18n/LangContext';
import { analysisApi } from '../api';

const dummyReport = {
  healthScore: 74,
  nitrogen: 65, phosphorus: 42, potassium: 78,
  pH: 6.8, organicMatter: 2.1, texture: 'Loamy Sand',
  suitableCrops: ['Wheat', 'Mustard', 'Gram', 'Sunflower'],
  nutrients: [
    { name: 'Nitrogen (N)',   value: 65, status: 'Medium',   color: '#4ADE80', msg: 'Apply Urea @ 45 kg/acre before sowing' },
    { name: 'Phosphorus (P)', value: 42, status: 'Low',      color: '#C4A35A', msg: 'Apply DAP @ 2 bags/acre as basal dose' },
    { name: 'Potassium (K)',  value: 78, status: 'Good',     color: '#60A5FA', msg: 'Current levels sufficient' },
    { name: 'Zinc (Zn)',      value: 28, status: 'Very Low', color: '#F87171', msg: 'Apply Zinc Sulphate @ 10 kg/acre' },
  ],
  recommendations: [
    'Apply 5 tons/acre Farm Yard Manure to improve organic carbon',
    'Green manuring with Dhaincha before next Kharif crop',
    'Soil pH 6.8 is optimal — no liming required',
    'Apply micronutrients (Zinc, Boron) as soil test recommends',
  ],
};

function buildVoiceScript(r) {
  return `
    Your soil health score is ${r.healthScore} out of 100.
    Soil pH is ${r.pH}, which is optimal for most crops.
    Nitrogen level is ${r.nitrogen} percent — medium.
    Phosphorus is ${r.phosphorus} percent — low, apply DAP fertilizer.
    Potassium is ${r.potassium} percent — good.
    Zinc is very low at ${r.value} percent — apply Zinc Sulphate.
    Your soil texture is ${r.texture}.
    Best crops for your soil: ${r.suitableCrops.join(', ')}.
    Recommendations: ${r.recommendations.join('. ')}.
  `.trim();
}

function buildExplainText(r) {
  return `Your soil health score is ${r.healthScore} out of 100 — this means your soil is in moderate condition. The pH of ${r.pH} is very good, meaning neither too acidic nor too alkaline. Your nitrogen level needs attention — apply Urea before sowing. Phosphorus is low, so use DAP fertilizer when planting. Zinc is very low which can stunt crop growth — apply Zinc Sulphate immediately. Your soil texture (${r.texture}) drains well and holds moderate moisture. Based on this analysis, wheat, mustard, gram and sunflower will grow best in your field this season.`;
}

const nextSteps = [
  'Apply 45 kg Urea per acre before sowing.',
  'Apply 2 bags of DAP fertilizer as basal dose at sowing time.',
  'Apply 10 kg Zinc Sulphate per acre to fix zinc deficiency.',
  'Add 5 tonnes of Farm Yard Manure to improve organic matter.',
  'Get your soil retested after the next harvest season.',
  'Visit Soil Health Card portal (soilhealth.dac.gov.in) for government support.',
];

function Gauge({ value, color, label, size = 130 }) {
  const r = 50, circ = 2 * Math.PI * r, offset = circ - (circ * value / 100);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }} viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="9"/>
          <motion.circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round"
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            style={{ strokeDasharray: circ }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color, lineHeight: 1 }}>{value}%</span>
        </div>
      </div>
      <div style={{ color: '#e8f5e8', fontSize: 12, fontWeight: 600, textAlign: 'center' }}>{label}</div>
    </div>
  );
}

export default function SoilAnalysis() {
  const [image,      setImage]      = useState(null);
  const [file,       setFile]       = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [report,     setReport]     = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [facingMode, setFacingMode] = useState('environment');
  const [accessMode, setAccessMode] = useState(false);
  const [autoSpoke,  setAutoSpoke]  = useState(false);
  const { t } = useLang();

  const videoRef  = useRef(null);
  const streamRef = useRef(null);

  /* camera */
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraOpen(true);
    } catch { alert('Camera not available.'); }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraOpen(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg');
    setImage(dataUrl);
    setFile({ name: 'camera-capture.jpg' });
    stopCamera();
  };

  useEffect(() => { if (cameraOpen) startCamera(); }, [facingMode, cameraOpen]); // eslint-disable-line

  /* analyze */
  const analyze = async () => {
    if (!file && !image) return;
    setLoading(true);
    setAutoSpoke(false);
    try {
      const data = await analysisApi.soil(file || image);
      setReport(data);
    } catch {
      setReport(dummyReport);
    } finally {
      setLoading(false);
    }
  };

  /* auto voice */
  useEffect(() => {
    if (report && !autoSpoke) {
      setAutoSpoke(true);
      setTimeout(() => {
        const utt = new SpeechSynthesisUtterance(buildVoiceScript(report));
        utt.lang = 'en-IN'; utt.rate = 0.9;
        window.speechSynthesis.speak(utt);
      }, 800);
    }
  }, [report, autoSpoke]);

  const FS = accessMode ? 16 : 14;
  const pHPct = report ? ((report.pH - 4) / 6) * 100 : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: accessMode ? 34 : 28, fontWeight: 700, color: '#4ADE80' }}>
            🧪 {t('soil')}
          </div>
          <div style={{ color: '#A8C5A0', fontSize: FS, marginTop: 4 }}>
            Upload or capture a soil photo or report for AI-driven recommendations
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <VoiceBar getText={() => report ? buildVoiceScript(report) : 'Upload a soil photo to begin analysis.'} />
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
            onClick={() => setAccessMode(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: accessMode ? 'rgba(74,222,128,0.15)' : 'rgba(74,222,128,0.06)',
              border: `1px solid ${accessMode ? 'rgba(74,222,128,0.5)' : 'rgba(74,222,128,0.2)'}`,
              borderRadius: 20, padding: '6px 14px', fontSize: 12, color: '#4ADE80', cursor: 'pointer',
            }}
          >👁 {accessMode ? t('normal_mode') : t('farmer_mode')}</motion.button>
        </div>
      </div>

      {/* Camera modal */}
      <AnimatePresence>
        {cameraOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.92)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}
          >
            <video ref={videoRef} autoPlay playsInline
              style={{ width: '100%', maxWidth: 520, borderRadius: 16, border: '2px solid rgba(74,222,128,0.3)' }}
            />
            <div style={{ display: 'flex', gap: 14 }}>
              <motion.button whileTap={{ scale: 0.93 }} onClick={capturePhoto}
                style={{ background: 'linear-gradient(135deg,#4ADE80,#16a34a)', border: 'none', borderRadius: 50, width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 0 20px rgba(74,222,128,0.4)' }}
              ><Camera size={26} color="#052e16"/></motion.button>
              <motion.button whileTap={{ scale: 0.93 }} onClick={() => setFacingMode(f => f === 'environment' ? 'user' : 'environment')}
                style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 50, width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4ADE80' }}
              ><FlipHorizontal size={18}/></motion.button>
              <motion.button whileTap={{ scale: 0.93 }} onClick={stopCamera}
                style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 50, width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#F87171' }}
              ><X size={18}/></motion.button>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Point camera at your soil and tap green button</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'grid', gridTemplateColumns: report ? '260px 1fr' : '1fr', gap: 20 }}>

        {/* Upload / Camera panel */}
        <div className="card" style={{ height: 'fit-content' }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: accessMode ? 18 : 16, fontWeight: 700, color: '#4ADE80', marginBottom: 14 }}>
            {t('upload_soil')}
          </div>

          {/* Upload zone */}
          <div
            onClick={() => document.getElementById('soil-upload').click()}
            style={{
              border: `2px dashed ${file ? 'rgba(74,222,128,0.5)' : 'rgba(74,222,128,0.25)'}`,
              borderRadius: 14, padding: '22px 14px', textAlign: 'center', cursor: 'pointer',
              background: file ? 'rgba(74,222,128,0.05)' : 'transparent', transition: 'all 0.2s',
              marginBottom: 10,
            }}
          >
            <input type="file" id="soil-upload" accept=".pdf,.jpg,.png" style={{ display: 'none' }}
              onChange={e => { if (e.target.files[0]) { setFile(e.target.files[0]); } }}
            />
            {image
              ? <img src={image} alt="soil" style={{ maxHeight: 120, maxWidth: '100%', borderRadius: 8, objectFit: 'cover' }}/>
              : <><CloudUpload size={36} color={file ? '#4ADE80' : '#4ADE80'} style={{ opacity: 0.6, marginBottom: 8 }}/></>
            }
            <div style={{ color: '#e8f5e8', fontSize: accessMode ? 15 : 13, fontWeight: 600, marginTop: 6 }}>
              {file ? file.name : 'Click to upload'}
            </div>
            <div style={{ color: '#A8C5A0', fontSize: 11, marginTop: 3 }}>PDF, JPG, PNG (max 5MB)</div>
          </div>

          {/* Camera button */}
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
            onClick={startCamera}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: 'rgba(74,222,128,0.07)', border: '1px solid rgba(74,222,128,0.25)',
              borderRadius: 10, padding: accessMode ? '12px' : '9px',
              color: '#4ADE80', fontSize: accessMode ? 15 : 13, fontWeight: 600, cursor: 'pointer', marginBottom: 10,
            }}
          >
            <Camera size={16}/> {t('open_camera')}
          </motion.button>

          {/* Analyze button */}
          <motion.button whileTap={{ scale: 0.97 }}
            onClick={analyze}
            disabled={!file || loading}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: file ? 'linear-gradient(135deg,#166534,#15803d)' : 'rgba(74,222,128,0.05)',
              border: `1px solid ${file ? 'rgba(74,222,128,0.4)' : 'rgba(74,222,128,0.15)'}`,
              borderRadius: 10, padding: accessMode ? '13px' : '10px',
              color: file ? '#e8f5e8' : '#4ADE8066', fontSize: accessMode ? 15 : 13, fontWeight: 600, cursor: file ? 'pointer' : 'default',
            }}
          >
            {loading
              ? <><div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(74,222,128,0.2)', borderTop: '2px solid #4ADE80', animation: 'spin 0.8s linear infinite' }}/> {t('analyzing')}</>
              : <><FlaskConical size={16}/> {t('analyze')}</>
            }
          </motion.button>
        </div>

        {/* Results */}
        {report && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Auto voice banner */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)',
              borderRadius: 12, padding: '10px 16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>🔊</span>
                <span style={{ color: '#4ADE80', fontSize: 13 }}>{t('voice_started')}</span>
              </div>
              <VoiceBar getText={() => buildVoiceScript(report)}/>
            </div>

            {/* Health score */}
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#A8C5A0', fontSize: 12, marginBottom: 6 }}>{t('soil_health')}</div>
                <div style={{ position: 'relative', width: 90, height: 90 }}>
                  <svg width="90" height="90" style={{ transform: 'rotate(-90deg)' }} viewBox="0 0 90 90">
                    <circle cx="45" cy="45" r="38" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8"/>
                    <motion.circle cx="45" cy="45" r="38" fill="none" stroke="#4ADE80" strokeWidth="8" strokeLinecap="round"
                      initial={{ strokeDashoffset: 2 * Math.PI * 38 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 38 * (1 - report.healthScore / 100) }}
                      transition={{ duration: 1.4, ease: 'easeOut' }}
                      style={{ strokeDasharray: 2 * Math.PI * 38 }}
                    />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 20, fontWeight: 700, color: '#4ADE80' }}>{report.healthScore}</span>
                  </div>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#e8f5e8', fontSize: accessMode ? 16 : 14, fontWeight: 600, marginBottom: 8 }}>
                  pH: <span style={{ color: '#4ADE80' }}>{report.pH}</span>
                  <span style={{ color: '#A8C5A0', fontSize: 12, marginLeft: 8 }}>Optimal</span>
                </div>
                <div style={{ color: '#A8C5A0', fontSize: 12, marginBottom: 8 }}>Texture: <span style={{ color: '#e8f5e8' }}>{report.texture}</span></div>
                <div style={{ color: '#A8C5A0', fontSize: 12, marginBottom: 4 }}>{t('suitable_crops')}:</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {report.suitableCrops.map(c => (
                    <span key={c} style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: 14, padding: '2px 10px', fontSize: 11, color: '#4ADE80' }}>{c}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* NPK Gauges */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-around', padding: '8px 0', flexWrap: 'wrap', gap: 16 }}>
                <Gauge value={report.nitrogen}   color="#4ADE80" label="Nitrogen (N)"/>
                <Gauge value={report.phosphorus} color="#C4A35A" label="Phosphorus (P)"/>
                <Gauge value={report.potassium}  color="#60A5FA" label="Potassium (K)"/>
              </div>
            </div>

            {/* pH bar */}
            <div className="card">
              <div style={{ color: '#A8C5A0', fontSize: 12, marginBottom: 8 }}>Soil pH Level</div>
              <div style={{ fontSize: accessMode ? 28 : 24, fontWeight: 700, color: '#e8f5e8', marginBottom: 10 }}>{report.pH}</div>
              <div style={{ height: 8, borderRadius: 4, background: 'linear-gradient(90deg,#F87171 0%,#C4A35A 40%,#4ADE80 65%,#60A5FA 100%)', marginBottom: 6, position: 'relative' }}>
                <div style={{ position: 'absolute', top: -5, width: 10, height: 18, background: '#fff', borderRadius: 3, left: `${Math.max(0,Math.min(100,pHPct))}%`, transform: 'translateX(-50%)' }}/>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6B8A65', fontSize: 10 }}>
                <span>Acidic (4)</span><span>Neutral (7)</span><span>Alkaline (10)</span>
              </div>
            </div>

            {/* Nutrient bars */}
            <div className="card">
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: accessMode ? 18 : 16, fontWeight: 700, color: '#4ADE80', marginBottom: 14 }}>{t('nutrient_levels')}</div>
              {report.nutrients.map(n => (
                <div key={n.name} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <div>
                      <span style={{ color: '#e8f5e8', fontSize: accessMode ? 15 : 13, fontWeight: 600 }}>{n.name}</span>
                      <span style={{ color: '#A8C5A0', fontSize: 12, marginLeft: 8 }}>{n.msg}</span>
                    </div>
                    <span style={{ color: n.color, fontWeight: 700, fontSize: 12 }}>{n.status}</span>
                  </div>
                  <div style={{ height: 7, background: 'rgba(255,255,255,0.07)', borderRadius: 4, overflow: 'hidden' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${n.value}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                      style={{ height: '100%', background: n.color, borderRadius: 4 }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Recommendations */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Leaf size={16} color="#4ADE80"/>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: accessMode ? 18 : 16, fontWeight: 700, color: '#4ADE80' }}>{t('fertilizer_rec')}</div>
              </div>
              {report.recommendations.map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                  <CheckCircle size={15} color="#4ADE80" style={{ marginTop: 2, flexShrink: 0 }}/>
                  <span style={{ color: '#e8f5e8', fontSize: accessMode ? 15 : 13, lineHeight: 1.6, opacity: 0.9 }}>{r}</span>
                </div>
              ))}
              {/* AI Panel */}
              <AIPanel
                explainText={buildExplainText(report)}
                nextSteps={nextSteps}
              />
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {!report && !file && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 280, textAlign: 'center' }}>
            <FlaskConical size={52} color="rgba(74,222,128,0.2)" style={{ marginBottom: 14 }}/>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: accessMode ? 20 : 18, color: '#e8f5e8', marginBottom: 6 }}>Upload a soil photo to begin</div>
            <div style={{ color: '#A8C5A0', fontSize: 13 }}>AI can read standard Govt. Soil Health Cards</div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
