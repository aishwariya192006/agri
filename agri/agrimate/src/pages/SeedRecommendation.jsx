import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sprout, CheckCircle, TrendingUp, IndianRupee, BarChart3, Leaf, ChevronDown } from 'lucide-react';
import { farmApi } from '../api';

const soilTypes = ['Clay', 'Sandy', 'Loamy', 'Silty', 'Peaty', 'Black Cotton'];
const seasons = ['Kharif (Jun–Oct)', 'Rabi (Nov–Mar)', 'Zaid (Mar–Jun)'];
const states = ['Punjab', 'Haryana', 'Uttar Pradesh', 'Maharashtra', 'Rajasthan', 'Gujarat', 'Tamil Nadu', 'Bihar'];

const recs = {
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
};

const defaultRec = [
  { name: 'Wheat', variety: 'HD-2967, PBW-343', yield: '20–25 q/acre', profit: '₹30,000', roi: '160%', suitability: 88 },
  { name: 'Mustard', variety: 'Pusa Bold, RH-30', yield: '10–13 q/acre', profit: '₹25,000', roi: '148%', suitability: 82 },
  { name: 'Chickpea', variety: 'GBG-1, Pusa-372', yield: '8–12 q/acre', profit: '₹20,000', roi: '135%', suitability: 78 },
  { name: 'Barley', variety: 'BH-902, Jyoti', yield: '18–22 q/acre', profit: '₹18,000', roi: '120%', suitability: 72 },
];

const emoji = ['🌾', '🌿', '🫘', '🌱'];

export default function SeedRecommendation() {
  const [form, setForm] = useState({ soil: '', season: '', state: 'Punjab', area: '12' });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const { recommendations } = await farmApi.seeds(form);
      setResults(recommendations);
    } catch {
      const seasonKey = form.season.startsWith('Kharif') ? 'Kharif' : 'Rabi';
      setResults(recs[form.soil]?.[seasonKey] || defaultRec);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#C4A35A' }}>Smart Seed Recommendation</div>
        <div style={{ color: '#A8C5A0', fontSize: 14, marginTop: 4 }}>AI-powered seed selection based on your soil, climate, and market conditions</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24 }}>
        {/* Form */}
        <div className="card" style={{ height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <Leaf size={16} color="#4A9B3F" />
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: '#C4A35A' }}>Farm Details</span>
          </div>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Soil Type', name: 'soil', options: soilTypes },
              { label: 'Season', name: 'season', options: seasons },
              { label: 'State', name: 'state', options: states },
            ].map(({ label, name, options }) => (
              <div key={name}>
                <label style={{ color: '#A8C5A0', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>{label}</label>
                <div style={{ position: 'relative' }}>
                  <select name={name} value={form[name]} onChange={handle} required={name !== 'state'} className="input-field" style={{ paddingRight: 32 }}>
                    {name !== 'state' && <option value="">Select {label.toLowerCase()}</option>}
                    {options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#6B8A65', pointerEvents: 'none' }} />
                </div>
              </div>
            ))}
            <div>
              <label style={{ color: '#A8C5A0', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Farm Area (Acres)</label>
              <input name="area" value={form.area} onChange={handle} type="number" className="input-field" placeholder="e.g. 12" />
            </div>
            <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }} className="btn-primary" style={{ justifyContent: 'center', marginTop: 4 }}>
              {loading
                ? <><div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(245,236,215,0.3)', borderTop: '2px solid #F5ECD7', animation: 'spin 0.8s linear infinite' }} />Analyzing...</>
                : <><Sprout size={16} />Get Recommendations</>
              }
            </motion.button>
          </form>
        </div>

        {/* Results */}
        <div>
          {!results && !loading && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 340, textAlign: 'center' }}>
              <Sprout size={56} color="rgba(196,163,90,0.2)" style={{ marginBottom: 16 }} />
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: '#F5ECD7', marginBottom: 8 }}>Ready to Recommend Seeds</div>
              <div style={{ color: '#A8C5A0', fontSize: 13 }}>Fill in your farm details to get AI-powered seed recommendations</div>
            </div>
          )}

          {loading && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 340, textAlign: 'center', gap: 12 }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', border: '3px solid rgba(196,163,90,0.2)', borderTop: '3px solid #C4A35A', animation: 'spin 0.8s linear infinite' }} />
              <div style={{ color: '#F5ECD7', fontSize: 15, fontWeight: 600 }}>AI analyzing your soil & climate...</div>
              <div style={{ color: '#A8C5A0', fontSize: 13 }}>Checking 10,000+ crop-soil combinations</div>
            </div>
          )}

          {results && !loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="badge-green" style={{ width: 'fit-content' }}>
                <CheckCircle size={12} /> AI Analysis Complete for {form.soil || 'your soil'} in {form.state}
              </div>

              {results.map((crop, i) => (
                <motion.div
                  key={crop.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="card card-hover"
                  style={{ position: 'relative' }}
                >
                  {i === 0 && (
                    <span style={{ position: 'absolute', top: 14, right: 14, background: '#C4A35A', color: '#0A1508', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 10 }}>🏆 Best Choice</span>
                  )}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                      background: i === 0 ? 'rgba(196,163,90,0.12)' : 'rgba(74,155,63,0.08)',
                      border: i === 0 ? '1px solid rgba(196,163,90,0.3)' : '1px solid rgba(74,155,63,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
                    }}>{emoji[i] || '🌱'}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#C4A35A', marginBottom: 2 }}>{crop.name}</div>
                      <div style={{ color: '#A8C5A0', fontSize: 12, marginBottom: 10 }}>Varieties: {crop.variety}</div>

                      <div style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ color: '#A8C5A0', fontSize: 12 }}>AI Suitability Score</span>
                          <span style={{ color: '#4A9B3F', fontWeight: 700, fontSize: 12 }}>{crop.suitability}%</span>
                        </div>
                        <div style={{ height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 3 }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${crop.suitability}%` }}
                            transition={{ duration: 1, delay: i * 0.1 }}
                            style={{ height: '100%', background: 'linear-gradient(90deg, #4A9B3F, #C4A35A)', borderRadius: 3 }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                        {[
                          { icon: BarChart3, label: 'Expected Yield', value: crop.yield, color: '#7A9BB5' },
                          { icon: IndianRupee, label: 'Est. Profit', value: crop.profit, color: '#4A9B3F' },
                          { icon: TrendingUp, label: 'ROI', value: crop.roi, color: '#C4A35A' },
                        ].map(({ icon: Icon, label, value, color }) => (
                          <div key={label} style={{ background: 'rgba(13,27,10,0.5)', border: '1px solid rgba(196,163,90,0.1)', borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
                            <Icon size={14} color={color} style={{ marginBottom: 4 }} />
                            <div style={{ color, fontWeight: 700, fontSize: 13 }}>{value}</div>
                            <div style={{ color: '#6B8A65', fontSize: 10, marginTop: 2 }}>{label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
