import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ScanLine, CloudUpload, Bug, Shield, CheckCircle,
  AlertTriangle, X, Camera, FlipHorizontal, BookOpen,
} from 'lucide-react';
import VoiceBar from '../components/VoiceBar';
import AIPanel  from '../components/AIPanel';
import { useLang } from '../i18n/LangContext';
import { analysisApi } from '../api';

/* ─── dummy result ─────────────────────────────────────────── */
const dummyResult = {
  disease: 'Wheat Leaf Rust (Puccinia triticina)',
  confidence: 96.8,
  severity: 'High',
  affectedArea: '30–40%',
  treatments: [
    { name: 'Propiconazole 25% EC', dosage: '0.1% solution', method: 'Foliar spray immediately', type: 'Chemical' },
    { name: 'Tebuconazole 25.9% EC', dosage: '0.1% solution', method: 'Alternate spray', type: 'Chemical' },
    { name: 'Pseudomonas fluorescens', dosage: '10g/liter', method: 'For mild early stages', type: 'Biological' },
  ],
  preventive: [
    'Use resistant varieties (HD-2967, PBW-550) next season',
    'Avoid excessive nitrogen application',
    'Ensure proper spacing for aeration',
  ],
};

const sampleResults = [
  { disease: 'Yellow Rust',    crop: 'Wheat',   confidence: '94%', severity: 'Medium', color: '#C4A35A' },
  { disease: 'Leaf Blight',    crop: 'Cotton',  confidence: '91%', severity: 'High',   color: '#F87171' },
  { disease: 'Powdery Mildew', crop: 'Mustard', confidence: '88%', severity: 'Low',    color: '#4ADE80' },
];

/* ─── voice script builder ─────────────────────────────────── */
function buildVoiceScript(r) {
  return `
    Disease detected: ${r.disease}.
    Confidence level: ${r.confidence} percent.
    Severity: ${r.severity}.
    Affected area: ${r.affectedArea}.
    Recommended treatment: ${r.treatments[0].name}, apply ${r.treatments[0].dosage} by ${r.treatments[0].method}.
    Prevention tips: ${r.preventive.join('. ')}.
    Act quickly to save your crop.
  `.trim();
}

function buildExplainText(r) {
  return `Your crop has ${r.disease}. This is a fungal disease that attacks wheat leaves and spreads quickly in humid weather. Right now ${r.affectedArea} of your field is affected and the severity is ${r.severity}. You should immediately spray ${r.treatments[0].name} at ${r.treatments[0].dosage}. This will stop the disease from spreading further. Next season, use resistant wheat varieties like HD-2967 to prevent this from happening again. Do not over-water and keep enough space between plants so air can flow freely.`;
}

const nextSteps = [
  'Buy Propiconazole 25% EC from your nearest agri-shop today.',
  'Mix 1ml per liter of water and spray on all affected leaves.',
  'Repeat spray after 10 days if symptoms persist.',
  'Separate the most affected plants to stop spread.',
  'Take a new photo after 7 days and analyze again.',
  'Consult your nearest Krishi Vigyan Kendra for subsidy on fungicides.',
];

/* ─── main component ───────────────────────────────────────── */
export default function DiseaseDetection() {
  const [image,        setImage]        = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [result,       setResult]       = useState(null);
  const [dragging,     setDragging]     = useState(false);
  const [cameraOpen,   setCameraOpen]   = useState(false);
  const [facingMode,   setFacingMode]   = useState('environment');
  const [accessMode,   setAccessMode]   = useState(false);
  const [autoSpoke,    setAutoSpoke]    = useState(false);
  const { t } = useLang();

  const videoRef  = useRef(null);
  const streamRef = useRef(null);
  const voiceText = result ? buildVoiceScript(result) : '';

  /* ── camera helpers ── */
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraOpen(true);
    } catch {
      alert('Camera permission denied or not available on this device.');
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraOpen(false);
  };

  const capturePhoto = () => {
    const video  = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    setImage(canvas.toDataURL('image/jpeg'));
    stopCamera();
  };

  const flipCamera = () => {
    setFacingMode(f => f === 'environment' ? 'user' : 'environment');
  };

  useEffect(() => {
    if (cameraOpen) startCamera();
  }, [facingMode, cameraOpen]);  // eslint-disable-line

  /* ── file upload ── */
  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => setImage(e.target.result);
    reader.readAsDataURL(file);
  };

  /* ── analyze ── */
  const analyze = async () => {
    if (!image) return;
    setLoading(true);
    setAutoSpoke(false);
    try {
      const data = await analysisApi.disease(image);
      setResult(data);
    } catch {
      setResult(dummyResult);
    } finally {
      setLoading(false);
    }
  };

  /* ── auto-voice after result ── */
  useEffect(() => {
    if (result && !autoSpoke) {
      setAutoSpoke(true);
      // small delay so UI renders first
      setTimeout(() => {
        const utt = new SpeechSynthesisUtterance(buildVoiceScript(result));
        utt.lang = 'en-IN'; utt.rate = 0.9;
        window.speechSynthesis.speak(utt);
      }, 800);
    }
  }, [result, autoSpoke]);

  const FS = accessMode ? 16 : 14; // font scale

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Header row ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: accessMode ? 34 : 28, fontWeight: 700, color: '#4ADE80' }}>
            🌿 {t('disease')}
          </div>
          <div style={{ color: '#A8C5A0', fontSize: FS, marginTop: 4 }}>
            {t('upload_photo')} {t('analyze').toLowerCase()} {t('disease').toLowerCase()}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Global page voice */}
          <VoiceBar getText={() => result ? buildVoiceScript(result) : 'Upload a crop photo to detect disease.'} />
          {/* Accessibility toggle */}
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
            onClick={() => setAccessMode(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: accessMode ? 'rgba(74,222,128,0.15)' : 'rgba(74,222,128,0.06)',
              border: `1px solid ${accessMode ? 'rgba(74,222,128,0.5)' : 'rgba(74,222,128,0.2)'}`,
              borderRadius: 20, padding: '6px 14px', fontSize: 12, color: '#4ADE80', cursor: 'pointer',
            }}
          >
            👁 {accessMode ? t('normal_mode') : t('farmer_mode')}
          </motion.button>
        </div>
      </div>

      {/* ── CAMERA MODAL ── */}
      <AnimatePresence>
        {cameraOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 200,
              background: 'rgba(0,0,0,0.92)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16,
            }}
          >
            <video ref={videoRef} autoPlay playsInline
              style={{ width: '100%', maxWidth: 520, borderRadius: 16, border: '2px solid rgba(74,222,128,0.3)' }}
            />
            <div style={{ display: 'flex', gap: 14 }}>
              <motion.button whileTap={{ scale: 0.93 }} onClick={capturePhoto}
                style={{
                  background: 'linear-gradient(135deg,#4ADE80,#16a34a)',
                  border: 'none', borderRadius: 50, width: 64, height: 64,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', boxShadow: '0 0 20px rgba(74,222,128,0.4)',
                }}
              ><Camera size={26} color="#052e16"/></motion.button>
              <motion.button whileTap={{ scale: 0.93 }} onClick={flipCamera}
                style={{
                  background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)',
                  borderRadius: 50, width: 48, height: 48,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#4ADE80',
                }}
              ><FlipHorizontal size={18}/></motion.button>
              <motion.button whileTap={{ scale: 0.93 }} onClick={stopCamera}
                style={{
                  background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
                  borderRadius: 50, width: 48, height: 48,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#F87171',
                }}
              ><X size={18}/></motion.button>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
              Point camera at crop and tap the green button to capture
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Upload / Camera zone ── */}
      {!image && !cameraOpen && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Upload */}
          <motion.div
            whileHover={{ borderColor: 'rgba(74,222,128,0.6)' }}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
            onClick={() => document.getElementById('disease-upload').click()}
            style={{
              height: accessMode ? 220 : 200, borderRadius: 20,
              border: `2px dashed ${dragging ? '#4ADE80' : 'rgba(74,222,128,0.25)'}`,
              background: dragging ? 'rgba(74,222,128,0.06)' : 'rgba(74,222,128,0.02)',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 10, cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            <input type="file" id="disease-upload" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])}/>
            <CloudUpload size={accessMode ? 52 : 44} color="#4ADE80" style={{ opacity: 0.7 }}/>
            <div style={{ color: '#e8f5e8', fontSize: accessMode ? 16 : 15, fontWeight: 600 }}>{t('upload_photo')}</div>
            <div style={{ color: '#A8C5A0', fontSize: 12 }}>JPG, PNG, WebP</div>
          </motion.div>

          {/* Camera */}
          <motion.div
            whileHover={{ borderColor: 'rgba(74,222,128,0.6)' }}
            onClick={startCamera}
            style={{
              height: accessMode ? 220 : 200, borderRadius: 20,
              border: '2px dashed rgba(74,222,128,0.25)',
              background: 'rgba(74,222,128,0.02)',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 10, cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            <Camera size={accessMode ? 52 : 44} color="#4ADE80" style={{ opacity: 0.7 }}/>
            <div style={{ color: '#e8f5e8', fontSize: accessMode ? 16 : 15, fontWeight: 600 }}>{t('open_camera')}</div>
            <div style={{ color: '#A8C5A0', fontSize: 12 }}>Take live photo</div>
          </motion.div>
        </div>
      )}

      {/* ── Image preview + analyze ── */}
      {image && !result && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#e8f5e8', fontWeight: 600, fontSize: FS }}>📸 Image Preview</span>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => { setImage(null); setResult(null); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A8C5A0' }}
            ><X size={18}/></motion.button>
          </div>
          <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', textAlign: 'center', background: 'rgba(10,20,10,0.5)' }}>
            <img src={image} alt="Crop" style={{ maxHeight: 280, maxWidth: '100%', objectFit: 'contain' }}/>
            {loading && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,20,10,0.8)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid rgba(74,222,128,0.2)', borderTop: '3px solid #4ADE80', animation: 'spin 0.8s linear infinite' }}/>
                <span style={{ color: '#4ADE80', fontWeight: 600 }}>AI Analyzing your crop...</span>
                <div style={{ display: 'flex', gap: 3 }}>
                  {Array.from({ length: 14 }).map((_, i) => (
                    <motion.div key={i}
                      animate={{ scaleY: [0.3, 1 + (i % 3) * 0.5, 0.3] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.04 }}
                      style={{ width: 3, height: 14, background: 'rgba(74,222,128,0.5)', borderRadius: 2, transformOrigin: 'center' }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          {!loading && (
            <motion.button whileTap={{ scale: 0.97 }} onClick={analyze}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: 'linear-gradient(135deg,#166534,#15803d)',
                border: '1px solid rgba(74,222,128,0.4)', borderRadius: 12,
                padding: accessMode ? '14px 20px' : '10px 20px',
                color: '#e8f5e8', fontSize: accessMode ? 16 : 14, fontWeight: 600, cursor: 'pointer',
              }}
            >
              <ScanLine size={accessMode ? 20 : 16}/> {t('analyze')}
            </motion.button>
          )}
        </div>
      )}

      {/* ── RESULT ── */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>

            {/* Auto-voice banner */}
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)',
                borderRadius: 12, padding: '10px 16px', marginBottom: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>🔊</span>
                <span style={{ color: '#4ADE80', fontSize: 13 }}>{t('voice_started')}</span>
              </div>
              <VoiceBar getText={() => voiceText}/>
            </motion.div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Disease banner */}
              <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 14, padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div style={{ color: '#F87171', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>⚠ {t('disease_detected')}</div>
                  {result.model && (
                    <span className="cnn-badge">🧠 {result.architecture || 'CNN'}</span>
                  )}
                </div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: accessMode ? 18 : 16, fontWeight: 700, color: '#e8f5e8', marginBottom: 10 }}>{result.disease}</div>
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  <div><div style={{ color: '#A8C5A0', fontSize: 11 }}>{t('confidence')}</div><div style={{ color: '#4ADE80', fontWeight: 700, fontSize: accessMode ? 18 : 16 }}>{result.confidence}%</div></div>
                  <div><div style={{ color: '#A8C5A0', fontSize: 11 }}>{t('severity')}</div><div style={{ color: '#F87171', fontWeight: 700, fontSize: accessMode ? 16 : 14, display: 'flex', alignItems: 'center', gap: 4 }}><AlertTriangle size={13}/>{result.severity}</div></div>
                  <div><div style={{ color: '#A8C5A0', fontSize: 11 }}>{t('area_affected')}</div><div style={{ color: '#e8f5e8', fontWeight: 600, fontSize: accessMode ? 16 : 14 }}>{result.affectedArea}</div></div>
                </div>
              </div>

              {/* Treatments */}
              <div>
                <div style={{ color: '#4ADE80', fontSize: 13, fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Shield size={14}/> {t('treatment')}
                </div>
                {result.treatments.map((t, i) => (
                  <div key={i} style={{ background: 'rgba(10,20,10,0.6)', border: '1px solid rgba(74,222,128,0.1)', borderRadius: 10, padding: '10px 12px', marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ color: '#e8f5e8', fontSize: accessMode ? 15 : 13, fontWeight: 600 }}>{t.name}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 8, background: t.type === 'Chemical' ? 'rgba(205,133,63,0.2)' : 'rgba(74,222,128,0.15)', color: t.type === 'Chemical' ? '#CD853F' : '#4ADE80' }}>{t.type}</span>
                    </div>
                    <div style={{ color: '#A8C5A0', fontSize: 12, marginTop: 4 }}>{t.dosage} · {t.method}</div>
                  </div>
                ))}
              </div>

              {/* Prevention */}
              {result.preventive.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <CheckCircle size={14} color="#4ADE80" style={{ marginTop: 2, flexShrink: 0 }}/>
                  <span style={{ color: '#A8C5A0', fontSize: accessMode ? 15 : 13, lineHeight: 1.6 }}>{p}</span>
                </div>
              ))}

              {/* ── AI Panel ── */}
              <AIPanel
                explainText={buildExplainText(result)}
                nextSteps={nextSteps}
              />

              <motion.button whileTap={{ scale: 0.97 }}
                onClick={() => { setImage(null); setResult(null); setAutoSpoke(false); window.speechSynthesis.cancel(); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: 'rgba(74,222,128,0.07)', border: '1px solid rgba(74,222,128,0.25)',
                  borderRadius: 12, padding: '10px 20px',
                  color: '#4ADE80', fontSize: FS, fontWeight: 600, cursor: 'pointer', marginTop: 4,
                }}
              >
                📷 {t('analyze_another')}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Sample cards ── */}
      {!image && (
        <div>
          <div style={{ color: '#A8C5A0', fontSize: 13, marginBottom: 14 }}>Sample detection results:</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 14 }}>
            {sampleResults.map((r, i) => (
              <motion.div key={i} whileHover={{ scale: 1.02, y: -4 }} className="card card-hover">
                <div style={{ height: 70, background: 'rgba(74,222,128,0.04)', borderRadius: 10, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bug size={32} color={r.color} style={{ opacity: 0.5 }}/>
                </div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: r.color, marginBottom: 4 }}>{r.disease}</div>
                <div style={{ color: '#A8C5A0', fontSize: 12, marginBottom: 8 }}>Crop: {r.crop}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ height: 4, width: 70, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
                    <div style={{ height: '100%', background: r.color, borderRadius: 2, width: r.confidence }}/>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: r.color, background: `${r.color}18`, border: `1px solid ${r.color}40`, borderRadius: 20, padding: '2px 8px' }}>{r.severity}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
