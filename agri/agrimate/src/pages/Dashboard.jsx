import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Thermometer, Droplets, IndianRupee, CalendarCheck,
  Bug, FlaskConical, Cloud, TrendingUp, Sprout, BarChart3,
  Sun, Wind, CloudRain, ChevronRight, Zap, Activity,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../i18n/LangContext';

/* ── data ─────────────────────────────────────────────── */
const profitData = [
  { month: 'Jan', profit: 10 }, { month: 'Feb', profit: 22 },
  { month: 'Mar', profit: 28 }, { month: 'Apr', profit: 32 },
  { month: 'May', profit: 38 }, { month: 'Jun', profit: 35 },
  { month: 'Jul', profit: 40 }, { month: 'Aug', profit: 43 },
  { month: 'Sep', profit: 48 },
];
const soilData = [
  { name: 'N', val: 65 }, { name: 'P', val: 42 },
  { name: 'K', val: 78 }, { name: 'pH', val: 68 },
];
const forecast7 = [
  { day: 'Mon', icon: Sun,       hi: 34, lo: 24, rain: '0%'  },
  { day: 'Tue', icon: Cloud,     hi: 32, lo: 25, rain: '20%' },
  { day: 'Wed', icon: CloudRain, hi: 29, lo: 23, rain: '80%' },
  { day: 'Thu', icon: CloudRain, hi: 28, lo: 22, rain: '90%' },
  { day: 'Fri', icon: Cloud,     hi: 31, lo: 23, rain: '30%' },
  { day: 'Sat', icon: Sun,       hi: 33, lo: 24, rain: '5%'  },
  { day: 'Sun', icon: Sun,       hi: 35, lo: 25, rain: '0%'  },
];

/* ── theme tokens ─────────────────────────────────────── */
const G  = '#00ff88';
const G2 = '#00cc66';
const G3 = 'rgba(0,255,136,0.12)';
const BORDER = 'rgba(0,255,136,0.18)';
const CARD = 'rgba(4,18,10,0.72)';
const TEXT  = '#d4ffe8';
const MUTED = 'rgba(180,255,210,0.5)';

function HoloCard({ children, style = {}, glow = false }) {
  return (
    <div style={{
      background: CARD, backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
      border: `1px solid ${glow ? 'rgba(0,255,136,0.4)' : BORDER}`, borderRadius: 16,
      boxShadow: glow ? `0 0 28px rgba(0,255,136,0.18), inset 0 0 20px rgba(0,255,136,0.04)` : `0 4px 24px rgba(0,0,0,0.6)`,
      position: 'relative', overflow: 'hidden', ...style,
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, transparent, ${G}, transparent)`,
        animation: 'scanLine 3s linear infinite', opacity: 0.6,
      }} />
      {children}
    </div>
  );
}

function GreenTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(0,20,10,0.95)', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '6px 12px' }}>
      <div style={{ color: MUTED, fontSize: 11 }}>{label}</div>
      <div style={{ color: G, fontWeight: 700, fontSize: 13 }}>₹{payload[0].value}K</div>
    </div>
  );
}

function Counter({ to, suffix = '' }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = to / 40;
    const id = setInterval(() => {
      start += step;
      if (start >= to) { setV(to); clearInterval(id); } else setV(Math.floor(start));
    }, 30);
    return () => clearInterval(id);
  }, [to]);
  return <>{v}{suffix}</>;
}

function Gauge({ pct, color, size = 80, label }) {
  const r = (size / 2) - 8;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(0,255,136,0.1)" strokeWidth={6} />
        <motion.circle
          cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
          strokeWidth={6} strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
        />
      </svg>
      <div style={{ textAlign: 'center' }}>
        <div style={{ color, fontWeight: 800, fontSize: 16, lineHeight: 1 }}>{pct}%</div>
        <div style={{ color: MUTED, fontSize: 10, marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLang();
  const [show7Day, setShow7Day] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(tk => tk + 1), 800);
    return () => clearInterval(id);
  }, []);

  const quickActions = [
    { icon: Bug,          label: t('detect_disease'), path: '/app/disease' },
    { icon: FlaskConical, label: t('soil'),           path: '/app/soil'    },
    { icon: Cloud,        label: t('weather'),        path: '/app/weather' },
    { icon: TrendingUp,   label: t('market'),         path: '/app/market'  },
    { icon: Sprout,       label: t('seeds'),          path: '/app/seeds'   },
    { icon: BarChart3,    label: t('profit'),         path: '/app/profit'  },
  ];

  return (
    <div>
      <style>{`
        @keyframes scanLine { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        @keyframes pulse-dot { 0%,100% { opacity: 1; } 50% { opacity: 0.2; } }
        @keyframes holo-flicker { 0%,96%,100% { opacity: 1; } 97% { opacity: 0.85; } 98%{ opacity:1; } 99%{ opacity:0.9; } }
        .holo-flicker { animation: holo-flicker 4s infinite; }
      `}</style>

      <div style={{ padding: '0 0 32px' }}>

        {/* ── Hero banner ── */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 20 }}>
          <HoloCard glow style={{ padding: '22px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ color: G, fontSize: 12, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: G, display: 'inline-block', animation: 'pulse-dot 1.5s infinite' }} />
                {t('system_online')}
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                {t('good_morning')}, <span style={{ color: G }}>{user?.name || t('farmer')}</span>
              </div>
              <div style={{ color: MUTED, fontSize: 13, marginTop: 5 }}>
                {[user?.village, user?.district, user?.state].filter(Boolean).join(', ') || 'India'} · 12 Acres · Wheat & Cotton · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.06, boxShadow: `0 0 28px ${G}` }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/app/copilot')}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '11px 22px', borderRadius: 12,
                background: `linear-gradient(135deg, ${G2}, #007744)`,
                border: `1px solid ${G}`, color: '#001a0a', fontWeight: 800, fontSize: 14, cursor: 'pointer',
                boxShadow: `0 0 16px rgba(0,255,136,0.3)`,
              }}
            >
              <Bot size={18} /> {t('copilot')}
            </motion.button>
          </HoloCard>
        </motion.div>

        {/* ── Stats row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
          {[
            { icon: Thermometer,  label: t('temperature'),    value: 28, suffix: '°C', color: '#ff9f43', note: t('normal_range')     },
            { icon: Droplets,     label: t('soil_moisture'),  value: 68, suffix: '%',  color: '#48dbfb', note: t('optimal')           },
            { icon: IndianRupee,  label: t('monthly_profit'), value: 42, suffix: 'K',  color: G,         note: t('pct_this_month')    },
            { icon: CalendarCheck,label: t('next_task'),      value: null, suffix: '', color: '#a29bfe', note: t('tomorrow_6am'),
              label2: t('irrigation') },
          ].map(({ icon: Icon, label, value, suffix, color, note, label2 }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <HoloCard glow={i === 2} style={{ padding: '18px 20px' }} className="holo-flicker">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}18`, border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={19} color={color} />
                  </div>
                  <Activity size={13} color={MUTED} />
                </div>
                <div style={{ color: MUTED, fontSize: 11, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
                <div style={{ fontSize: 32, fontWeight: 900, color, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                  {value !== null ? <><Counter to={value} />{suffix}</> : <span style={{ fontSize: 20 }}>{label2}</span>}
                </div>
                <div style={{ fontSize: 10, color, marginTop: 5, opacity: 0.7 }}>{note}</div>
              </HoloCard>
            </motion.div>
          ))}
        </div>

        {/* ── Main charts row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 300px', gap: 14, marginBottom: 20 }}>

          {/* Profit chart */}
          <HoloCard glow style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{t('profit_forecast')}</div>
                <div style={{ color: MUTED, fontSize: 11, marginTop: 2 }}>{t('monthly_earnings')}</div>
              </div>
              <span style={{ background: `${G}18`, border: `1px solid ${G}40`, color: G, fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20 }}>+23% YoY</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={profitData}>
                <defs>
                  <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={G} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={G} stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="transparent" tick={{ fill: MUTED, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis stroke="transparent" tick={{ fill: MUTED, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}K`} />
                <Tooltip content={<GreenTip />} />
                <Area type="monotone" dataKey="profit" stroke={G} strokeWidth={2} fill="url(#pg)" dot={false}
                  activeDot={{ r: 5, fill: G, stroke: '#001a0a', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </HoloCard>

          {/* Soil NPK chart */}
          <HoloCard style={{ padding: '18px 20px' }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{t('soil_health_matrix')}</div>
              <div style={{ color: MUTED, fontSize: 11, marginTop: 2 }}>{t('npk_readings')}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 12 }}>
              <Gauge pct={65} color={G}      label="Nitrogen"   size={72} />
              <Gauge pct={42} color="#f9ca24"  label="Phosphorus" size={72} />
              <Gauge pct={78} color="#48dbfb"  label="Potassium"  size={72} />
              <Gauge pct={68} color="#a29bfe"  label="pH"         size={72} />
            </div>
            <ResponsiveContainer width="100%" height={80}>
              <BarChart data={soilData} barSize={28}>
                <XAxis dataKey="name" stroke="transparent" tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<GreenTip />} cursor={{ fill: 'rgba(0,255,136,0.05)' }} />
                <Bar dataKey="val" radius={[4,4,0,0]}>
                  {soilData.map((_, i) => (
                    <Cell key={i} fill={[G, '#f9ca24', '#48dbfb', '#a29bfe'][i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </HoloCard>

          {/* Weather widget */}
          <HoloCard glow style={{ padding: '18px 18px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{t('weather')}</div>
              <span style={{ color: MUTED, fontSize: 11 }}>{[user?.district, user?.state].filter(Boolean).join(', ') || 'Your Location'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <motion.div animate={{ rotate: [0, 8, -8, 0] }} transition={{ duration: 5, repeat: Infinity }}>
                <Sun size={52} color="#f9ca24" style={{ filter: 'drop-shadow(0 0 12px rgba(249,202,36,0.7))' }} />
              </motion.div>
              <div>
                <div style={{ fontSize: 42, fontWeight: 900, color: '#fff', lineHeight: 1 }}>28°</div>
                <div style={{ color: MUTED, fontSize: 12 }}>{t('partly_cloudy')}</div>
              </div>
            </div>
            {[
              { icon: Droplets,  l: t('humidity'), v: '65%',     c: '#48dbfb' },
              { icon: Wind,      l: t('wind'),     v: '12 km/h', c: '#74b9ff' },
              { icon: CloudRain, l: t('rain'),     v: '20%',     c: '#a29bfe' },
            ].map(({ icon: Icon, l, v, c }) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon size={13} color={c} />
                  <span style={{ color: MUTED, fontSize: 12 }}>{l}</span>
                </div>
                <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>{v}</span>
              </div>
            ))}
            <button onClick={() => setShow7Day(!show7Day)} style={{
              marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              padding: '7px', borderRadius: 8, background: G3, border: `1px solid ${BORDER}`,
              color: G, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>
              {t('day_forecast_7')} <ChevronRight size={13} style={{ transform: show7Day ? 'rotate(90deg)' : 'none', transition: '0.2s' }} />
            </button>
            <AnimatePresence>
              {show7Day && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden', marginTop: 10 }}>
                  <div style={{ display: 'flex', gap: 5, overflowX: 'auto' }}>
                    {forecast7.map(({ day, icon: Icon, hi, lo }) => (
                      <div key={day} style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '6px 7px', borderRadius: 8, background: G3, border: `1px solid ${BORDER}`, minWidth: 40 }}>
                        <span style={{ color: MUTED, fontSize: 9 }}>{day}</span>
                        <Icon size={13} color={G} />
                        <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>{hi}°</span>
                        <span style={{ color: MUTED, fontSize: 9 }}>{lo}°</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </HoloCard>
        </div>

        {/* ── Quick Actions ── */}
        <HoloCard style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Zap size={15} color={G} />
            <span style={{ color: G, fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t('quick_actions')}</span>
            <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${BORDER}, transparent)` }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 10 }}>
            {quickActions.map(({ icon: Icon, label, path }, i) => (
              <motion.button
                key={label}
                whileHover={{ scale: 1.08, y: -4, boxShadow: `0 8px 24px rgba(0,255,136,0.2)` }}
                whileTap={{ scale: 0.94 }}
                onClick={() => navigate(path)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  padding: '16px 8px', borderRadius: 14, cursor: 'pointer',
                  background: G3, border: `1px solid ${BORDER}`, transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = G}
                onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}
              >
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: `${G}15`, border: `1px solid ${G}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} color={G} />
                </div>
                <span style={{ color: TEXT, fontSize: 11, textAlign: 'center', lineHeight: 1.3 }}>{label}</span>
              </motion.button>
            ))}
          </div>
        </HoloCard>

      </div>
    </div>
  );
}
