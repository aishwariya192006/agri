import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Calculator, TrendingUp, IndianRupee, Zap, ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';
import { farmApi } from '../api';

const dummyResult = {
  revenue: 360000, cost: 125000, profit: 235000, roi: 188, yield: 240,
  breakdown: [
    { name: 'Seed', cost: 15000 }, { name: 'Fertilizer', cost: 35000 },
    { name: 'Labor', cost: 45000 }, { name: 'Machinery', cost: 20000 }, { name: 'Pesticides', cost: 10000 },
  ],
  monthly: [
    { m: 'Oct', v: 0 }, { m: 'Nov', v: 0 }, { m: 'Dec', v: -40000 },
    { m: 'Jan', v: -80000 }, { m: 'Feb', v: -125000 }, { m: 'Mar', v: 60000 }, { m: 'Apr', v: 235000 },
  ],
  suggestions: [
    'Switching to direct seeding could save ₹15,000 in labor costs.',
    'Selling in 2nd week of July could increase revenue by 8%.',
    'Apply for PM-Kisan scheme to add ₹6,000 to net profit.',
  ],
};

const CT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(13,27,10,0.95)', border: '1px solid rgba(196,163,90,0.3)', borderRadius: 10, padding: '8px 12px' }}>
      <div style={{ color: '#A8C5A0', fontSize: 11 }}>{label}</div>
      <div style={{ color: '#C4A35A', fontWeight: 700 }}>₹{payload[0].value?.toLocaleString('en-IN')}</div>
    </div>
  );
};

export default function ProfitPrediction() {
  const [form, setForm] = useState({ crop: 'Wheat', area: '12', season: 'Rabi', cost: '125000' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const calc = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await farmApi.profit(form);
      setResult(data);
    } catch {
      setResult(dummyResult);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#C4A35A' }}>Profit Prediction Dashboard</div>
        <div style={{ color: '#A8C5A0', fontSize: 14, marginTop: 4 }}>Forecast earnings based on your crop, area, and live market data</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24 }}>
        {/* Form */}
        <div className="card" style={{ height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Calculator size={15} color="#C4A35A" />
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: '#C4A35A' }}>Investment Details</span>
          </div>
          <form onSubmit={calc} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Crop Name', name: 'crop', type: 'select', options: ['Wheat', 'Cotton', 'Rice', 'Maize', 'Mustard'] },
              { label: 'Land Area (Acres)', name: 'area', type: 'number' },
              { label: 'Season', name: 'season', type: 'select', options: ['Rabi', 'Kharif', 'Zaid'] },
              { label: 'Expected Input Cost (₹)', name: 'cost', type: 'number' },
            ].map(({ label, name, type, options }) => (
              <div key={name}>
                <label style={{ color: '#A8C5A0', fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 5 }}>{label}</label>
                {type === 'select'
                  ? <div style={{ position: 'relative' }}>
                      <select name={name} value={form[name]} onChange={handle} className="input-field" style={{ paddingRight: 28 }}>
                        {options.map(o => <option key={o}>{o}</option>)}
                      </select>
                      <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#6B8A65', pointerEvents: 'none' }} />
                    </div>
                  : <input name={name} value={form[name]} onChange={handle} type={type} className="input-field" />
                }
              </div>
            ))}
            <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }} className="btn-primary" style={{ justifyContent: 'center', marginTop: 6 }}>
              {loading ? 'Calculating...' : <><BarChart3 size={15} />Calculate Profit</>}
            </motion.button>
          </form>
        </div>

        {/* Results */}
        <div>
          {!result && !loading && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320, textAlign: 'center' }}>
              <BarChart3 size={52} color="rgba(196,163,90,0.2)" style={{ marginBottom: 16 }} />
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: '#F5ECD7', marginBottom: 6 }}>Awaiting Data</div>
              <div style={{ color: '#A8C5A0', fontSize: 13 }}>Fill the details on the left to see your AI profit forecast</div>
            </div>
          )}

          {loading && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320, textAlign: 'center', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid rgba(196,163,90,0.2)', borderTop: '3px solid #C4A35A', animation: 'spin 0.8s linear infinite' }} />
              <div style={{ color: '#F5ECD7', fontWeight: 600 }}>Analyzing market trends & costs...</div>
            </div>
          )}

          {result && !loading && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Profit Banner */}
              <div className="card copilot-glow" style={{ background: 'linear-gradient(135deg, rgba(74,155,63,0.15), rgba(196,163,90,0.08))', borderColor: 'rgba(196,163,90,0.3)', textAlign: 'center', padding: '28px 24px' }}>
                <div style={{ color: '#A8C5A0', fontSize: 13, marginBottom: 4 }}>Expected Profit</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 52, fontWeight: 700, color: '#C4A35A', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <IndianRupee size={38} />2.35L
                </div>
                <div style={{ color: '#4A9B3F', fontSize: 14, marginTop: 6 }}>ROI: {result.roi}% on ₹{(result.cost / 1000).toFixed(0)}K invested</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                {[
                  { label: 'Total Revenue', value: `₹${(result.revenue / 1000).toFixed(0)}K`, color: '#7A9BB5', note: `${result.yield} Quintals` },
                  { label: 'Total Cost', value: `₹${(result.cost / 1000).toFixed(0)}K`, color: '#F87171', note: 'Input & Labor' },
                  { label: 'Net Profit', value: `₹${(result.profit / 1000).toFixed(0)}K`, color: '#4A9B3F', note: `${result.roi}% ROI` },
                ].map(({ label, value, color, note }) => (
                  <div key={label} className="card">
                    <div style={{ color: '#A8C5A0', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{label}</div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
                    <div style={{ color: '#6B8A65', fontSize: 11, marginTop: 4 }}>{note}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="card">
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: '#C4A35A', marginBottom: 14 }}>Cost Breakdown</div>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={result.breakdown}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(196,163,90,0.08)" vertical={false} />
                      <XAxis dataKey="name" stroke="transparent" tick={{ fill: '#A8C5A0', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis stroke="transparent" tick={{ fill: '#A8C5A0', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v / 1000}K`} />
                      <Tooltip content={<CT />} cursor={{ fill: 'rgba(196,163,90,0.05)' }} />
                      <Bar dataKey="cost" fill="#8B5A2B" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="card">
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: '#C4A35A', marginBottom: 14 }}>Monthly Cashflow</div>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={result.monthly}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(196,163,90,0.08)" vertical={false} />
                      <XAxis dataKey="m" stroke="transparent" tick={{ fill: '#A8C5A0', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis stroke="transparent" tick={{ fill: '#A8C5A0', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v / 1000}K`} />
                      <Tooltip content={<CT />} />
                      <Line type="monotone" dataKey="v" stroke="#C4A35A" strokeWidth={2} dot={{ r: 4, fill: '#C4A35A', stroke: '#0D1B0A', strokeWidth: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Risk Scenarios */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                {[
                  { label: 'Best Case', profit: '₹2.9L', note: 'High yield + good prices', color: '#4A9B3F', bg: 'rgba(74,155,63,0.08)' },
                  { label: 'Expected Case', profit: '₹2.35L', note: 'Normal conditions', color: '#C4A35A', bg: 'rgba(196,163,90,0.08)' },
                  { label: 'Worst Case', profit: '₹1.2L', note: 'Disease / price drop', color: '#F87171', bg: 'rgba(248,113,113,0.08)' },
                ].map(({ label, profit, note, color, bg }) => (
                  <div key={label} className="card" style={{ background: bg, borderColor: `${color}30`, textAlign: 'center' }}>
                    <div style={{ color: '#A8C5A0', fontSize: 11, marginBottom: 6 }}>{label}</div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color }}>{profit}</div>
                    <div style={{ color: '#6B8A65', fontSize: 11, marginTop: 4 }}>{note}</div>
                  </div>
                ))}
              </div>

              {/* AI Suggestions */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Zap size={15} color="#C4A35A" />
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: '#C4A35A' }}>AI Suggestions to Maximize Profit</span>
                </div>
                {result.suggestions.map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(196,163,90,0.15)', color: '#C4A35A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                    <span style={{ color: '#F5ECD7', fontSize: 13, lineHeight: 1.5, opacity: 0.9 }}>{s}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
