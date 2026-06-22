import { motion } from 'framer-motion';
import { Bug, Shield, AlertTriangle, CheckCircle, CloudRain, Thermometer } from 'lucide-react';

const pestAlerts = [
  { name: 'Aphids', crop: 'Wheat', risk: 'High', trigger: 'High humidity + mild temp 22°C', action: 'Apply Imidacloprid 17.8% SL @ 60ml/acre', color: '#F87171' },
  { name: 'Whitefly', crop: 'Cotton', risk: 'Medium', trigger: 'Dry weather + high temperature 34°C+', action: 'Apply Thiamethoxam 25% WG @ 40g/acre', color: '#C4A35A' },
  { name: 'Pink Bollworm', crop: 'Cotton', risk: 'Low', trigger: 'Bollworm pheromone trap count < 5', action: 'Continue monitoring with pheromone traps', color: '#4A9B3F' },
  { name: 'Yellow Rust', crop: 'Wheat', risk: 'Medium', trigger: 'Cool moist weather 10–15°C forecast', action: 'Prophylactic spray of Propiconazole 25% EC', color: '#C4A35A' },
];

const riskColors = { High: '#F87171', Medium: '#C4A35A', Low: '#4A9B3F' };

const tips = [
  'Regularly inspect field borders — pests often enter from edges',
  'Use yellow sticky traps to monitor whitefly and aphid populations',
  'Maintain field sanitation — remove crop debris after harvest',
  'Practice crop rotation to break pest and disease cycles',
  'Use bio-agents like Trichogramma cards for bollworm management',
];

// Mini grid for risk map
const riskGrid = Array.from({ length: 30 }, (_, i) => {
  const v = Math.random();
  if (v < 0.3) return 'high';
  if (v < 0.6) return 'medium';
  return 'low';
});
const cellColor = { high: '#F87171', medium: '#C4A35A', low: '#4A9B3F' };

export default function PestForecasting() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#C4A35A' }}>AI Pest Risk Forecasting</div>
        <div style={{ color: '#A8C5A0', fontSize: 14, marginTop: 4 }}>Real-time pest risk assessment for your farm in Punjab</div>
      </div>

      {/* Risk Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        {[
          { label: 'Current Risk Level', value: 'Medium', icon: Bug, color: '#C4A35A', bg: 'rgba(196,163,90,0.12)' },
          { label: 'Active Alerts', value: '2 Alerts', icon: AlertTriangle, color: '#F87171', bg: 'rgba(248,113,113,0.12)' },
          { label: 'Forecast Accuracy', value: '94%', icon: CheckCircle, color: '#4A9B3F', bg: 'rgba(74,155,63,0.12)' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <motion.div
            key={label}
            whileHover={{ scale: 1.02, y: -4 }}
            className="card card-hover"
            style={{ textAlign: 'center', padding: '28px 20px' }}
          >
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: bg, border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Icon size={26} color={color} />
            </div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color }}>{value}</div>
            <div style={{ color: '#A8C5A0', fontSize: 12, marginTop: 4 }}>{label}</div>
          </motion.div>
        ))}
      </div>

      {/* Farm Risk Map */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#C4A35A' }}>Farm Risk Map</div>
          <span style={{ color: '#A8C5A0', fontSize: 12 }}>12 Acres — Ludhiana, Punjab</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 4, marginBottom: 16 }}>
          {riskGrid.map((risk, i) => (
            <div key={i} title={`Zone ${i + 1}: ${risk} risk`} style={{
              height: 32, borderRadius: 6, background: cellColor[risk],
              opacity: 0.7, cursor: 'pointer', transition: 'opacity 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}
            />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          {[['low', '#4A9B3F', 'Low Risk'], ['medium', '#C4A35A', 'Medium Risk'], ['high', '#F87171', 'High Risk']].map(([k, c, l]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: c, opacity: 0.7 }} />
              <span style={{ color: '#A8C5A0', fontSize: 12 }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pest Alert Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {pestAlerts.map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="card card-hover"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: `${p.color}18`, border: `1px solid ${p.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Bug size={24} color={p.color} />
              </div>
              <div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: '#F5ECD7' }}>{p.name}</div>
                <div style={{ color: '#A8C5A0', fontSize: 12 }}>Affects: {p.crop}</div>
              </div>
              <span className="badge-gold" style={{ marginLeft: 'auto', color: riskColors[p.risk], background: `${riskColors[p.risk]}18`, borderColor: `${riskColors[p.risk]}40` }}>
                {p.risk}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: '#A8C5A0', fontSize: 12, marginBottom: 8 }}>
              <CloudRain size={13} />
              <span>Trigger: {p.trigger}</span>
            </div>
            <div style={{ color: '#4A9B3F', fontSize: 13, fontStyle: 'italic' }}>✓ {p.action}</div>
          </motion.div>
        ))}
      </div>

      {/* Prevention Tips */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Shield size={18} color="#4A9B3F" />
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#C4A35A' }}>Prevention Tips</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {tips.map((tip, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <CheckCircle size={16} color="#4A9B3F" style={{ marginTop: 2, flexShrink: 0 }} />
              <span style={{ color: '#A8C5A0', fontSize: 14, lineHeight: 1.5 }}>{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
