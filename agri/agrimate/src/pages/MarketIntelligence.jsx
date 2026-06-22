import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, MapPin, Search, RefreshCw, Bell, ArrowUpRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useAuth } from '../context/AuthContext';

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

/* Simulated live price engine — adds small random fluctuations on each refresh */
const BASE_PRICES = {
  Wheat:    { base: 2350, unit: '₹/qtl', msp: 2275 },
  Rice:     { base: 1960, unit: '₹/qtl', msp: 2183 },
  Cotton:   { base: 6800, unit: '₹/qtl', msp: 6620 },
  Maize:    { base: 1820, unit: '₹/qtl', msp: 1962 },
  Mustard:  { base: 5420, unit: '₹/qtl', msp: 5650 },
  Soybean:  { base: 4200, unit: '₹/qtl', msp: 4600 },
  Sugarcane:{ base: 315,  unit: '₹/qtl', msp: 305  },
};

function generatePriceHistory(base) {
  let p = base * 0.92;
  return ['1','5','10','15','20','25','30'].map(d => {
    p = p + (Math.random() - 0.46) * base * 0.012;
    return { d, p: Math.round(p) };
  });
}

function getLivePrice(base) {
  const delta = (Math.random() - 0.48) * base * 0.008;
  return Math.round(base + delta);
}

const MANDIS_BY_STATE = {
  Punjab: [
    { name: 'Khanna Mandi',    district: 'Ludhiana',  distance: '12 km' },
    { name: 'Ludhiana APMC',   district: 'Ludhiana',  distance: '5 km'  },
    { name: 'Bathinda Mandi',  district: 'Bathinda',  distance: '85 km' },
    { name: 'Abohar Mandi',    district: 'Fazilka',   distance: '120 km'},
    { name: 'Moga APMC',       district: 'Moga',      distance: '45 km' },
  ],
  Maharashtra: [
    { name: 'Pune APMC',       district: 'Pune',      distance: '8 km'  },
    { name: 'Nashik Mandi',    district: 'Nashik',    distance: '35 km' },
    { name: 'Nagpur APMC',     district: 'Nagpur',    distance: '12 km' },
  ],
  default: [
    { name: 'Local APMC',      district: 'District',  distance: '10 km' },
    { name: 'State Mandi',     district: 'Nearby',    distance: '25 km' },
  ],
};

const SELL_ADVICE = {
  Wheat:   'Hold 15–20 days — festival demand expected to push prices +8%.',
  Cotton:  'Good time to sell 50% — prices near seasonal peak.',
  Rice:    'Market stable — sell gradually over next 2 weeks.',
  Mustard: 'Prices below MSP — wait for govt procurement window.',
  Maize:   'Prices steady — sell if storage costs are high.',
  Soybean: 'Export demand improving — hold for 10 more days.',
};

const CT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(13,27,10,0.95)', border: '1px solid rgba(196,163,90,0.3)', borderRadius: 10, padding: '8px 14px' }}>
      <div style={{ color: '#A8C5A0', fontSize: 11 }}>Day {label}</div>
      <div style={{ color: '#C4A35A', fontWeight: 700 }}>₹{payload[0].value}/qtl</div>
    </div>
  );
};

export default function MarketIntelligence() {
  const { user } = useAuth();
  const userState = user?.location?.state || user?.farm?.state || 'Punjab';

  const [crop,        setCrop]        = useState('Wheat');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [refreshing,  setRefreshing]  = useState(false);
  const [livePrices,  setLivePrices]  = useState({});
  const [priceHistory,setPriceHistory]= useState({});
  const [alertCrop,   setAlertCrop]   = useState(null);

  /* Initialise price data */
  const refreshPrices = useCallback((silent = false) => {
    if (!silent) setRefreshing(true);
    const prices = {};
    const history = {};
    Object.entries(BASE_PRICES).forEach(([name, { base, unit, msp }]) => {
      const live = getLivePrice(base);
      const prev = getLivePrice(base);
      prices[name] = { price: live, prev, unit, msp, change: live - prev, changePct: (((live - prev) / prev) * 100).toFixed(1) };
      history[name] = generatePriceHistory(base);
    });
    setLivePrices(prices);
    setPriceHistory(history);
    setLastUpdated(new Date());
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  useEffect(() => { refreshPrices(); }, [refreshPrices]);
  useEffect(() => {
    const id = setInterval(() => refreshPrices(true), REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, [refreshPrices]);

  const mandis = (MANDIS_BY_STATE[userState] || MANDIS_BY_STATE.default).map(m => ({
    ...m,
    price: `₹${getLivePrice(BASE_PRICES[crop]?.base || 2350).toLocaleString('en-IN')}/qtl`,
    trend: Math.random() > 0.4 ? 'up' : 'down',
  }));

  const filteredMandis = mandis.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentLive = livePrices[crop];
  const ticker = Object.entries(livePrices).map(([n, v]) =>
    `${n} ₹${v?.price?.toLocaleString('en-IN') || '--'}/${BASE_PRICES[n]?.unit?.replace('₹/','') || 'qtl'} ${Number(v?.changePct) >= 0 ? '↑' : '↓'}  •  `
  ).join('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>{`
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.2} }
        @keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        .ticker-wrap{overflow:hidden;white-space:nowrap}
        .ticker-content{display:inline-block;animation:ticker 40s linear infinite}
        @media(max-width:768px){
          .mkt-grid{grid-template-columns:1fr !important}
          .crop-btns{flex-wrap:wrap}
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(20px,4vw,28px)', fontWeight: 700, color: '#C4A35A' }}>
            Market Intelligence
          </div>
          <div style={{ color: '#A8C5A0', fontSize: 13, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <MapPin size={12} /> {userState} Region
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ background: 'rgba(74,155,63,0.15)', border: '1px solid rgba(74,155,63,0.35)', color: '#4A9B3F', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4A9B3F', display: 'inline-block', animation: 'pulse-dot 1.5s infinite' }} />
            LIVE
          </span>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => refreshPrices()}
            style={{ background: 'rgba(196,163,90,0.1)', border: '1px solid rgba(196,163,90,0.25)', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', color: '#C4A35A', display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}
          >
            <RefreshCw size={12} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />
            Refresh
          </motion.button>
          <span style={{ color: '#6B8A65', fontSize: 11 }}>
            {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Live Ticker */}
      {ticker && (
        <div className="ticker-wrap" style={{ background: 'rgba(196,163,90,0.08)', borderTop: '1px solid rgba(196,163,90,0.2)', borderBottom: '1px solid rgba(196,163,90,0.2)', padding: '8px 0', borderRadius: 10 }}>
          <span className="ticker-content" style={{ color: '#C4A35A', fontSize: 13, fontWeight: 600, letterSpacing: '0.02em' }}>
            {ticker}{ticker}
          </span>
        </div>
      )}

      {/* Price Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 10 }}>
        {Object.entries(livePrices).map(([name, v]) => (
          <motion.div
            key={name}
            whileHover={{ scale: 1.04, borderColor: 'rgba(196,163,90,0.45)' }}
            onClick={() => setCrop(name)}
            style={{
              background: crop === name ? 'rgba(196,163,90,0.12)' : 'rgba(13,27,10,0.5)',
              border: `1px solid ${crop === name ? 'rgba(196,163,90,0.4)' : 'rgba(196,163,90,0.12)'}`,
              borderRadius: 12, padding: '12px', cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            <div style={{ color: '#A8C5A0', fontSize: 11, marginBottom: 4 }}>{name}</div>
            <div style={{ color: '#F5ECD7', fontWeight: 700, fontSize: 15 }}>₹{v?.price?.toLocaleString('en-IN')}</div>
            <div style={{ color: Number(v?.changePct) >= 0 ? '#4A9B3F' : '#F87171', fontSize: 11, display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
              {Number(v?.changePct) >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {v?.changePct}%
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mkt-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 18 }}>

        {/* Left: Chart + AI Advice */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Chart */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, color: '#C4A35A' }}>
                {crop} — Price Trend (30 Days)
              </div>
              <div className="crop-btns" style={{ display: 'flex', gap: 5 }}>
                {Object.keys(BASE_PRICES).map(c => (
                  <button key={c} onClick={() => setCrop(c)} style={{
                    padding: '4px 10px', borderRadius: 16, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: 'none',
                    background: crop === c ? '#C4A35A' : 'rgba(196,163,90,0.1)',
                    color: crop === c ? '#0A1508' : '#A8C5A0', transition: 'all 0.2s',
                  }}>{c}</button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={priceHistory[crop] || []}>
                <defs>
                  <linearGradient id="mktGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#C4A35A" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C4A35A" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(196,163,90,0.07)" vertical={false} />
                <XAxis dataKey="d" stroke="transparent" tick={{ fill: '#A8C5A0', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis stroke="transparent" tick={{ fill: '#A8C5A0', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
                <Tooltip content={<CT />} />
                <Area type="monotone" dataKey="p" stroke="#C4A35A" strokeWidth={2} fill="url(#mktGrad)" dot={false}
                  activeDot={{ r: 4, fill: '#C4A35A', stroke: '#0D1B0A', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* AI Sell Advice + MSP */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="card" style={{ background: 'rgba(196,163,90,0.08)', borderColor: 'rgba(196,163,90,0.3)' }}>
              <div style={{ color: '#A8C5A0', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                🤖 AI Sell Advice
              </div>
              <div style={{ color: '#F5ECD7', fontSize: 13, lineHeight: 1.6 }}>
                {SELL_ADVICE[crop] || 'Monitor market trends before selling.'}
              </div>
            </div>
            <div className="card">
              <div style={{ color: '#A8C5A0', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                MSP vs Live Price
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div>
                  <div style={{ color: '#6B8A65', fontSize: 10 }}>Live</div>
                  <div style={{ color: '#4A9B3F', fontWeight: 700, fontSize: 15 }}>₹{currentLive?.price?.toLocaleString('en-IN') || '--'}</div>
                </div>
                <ArrowUpRight size={16} color={currentLive?.price > BASE_PRICES[crop]?.msp ? '#4A9B3F' : '#F87171'} />
                <div>
                  <div style={{ color: '#6B8A65', fontSize: 10 }}>MSP</div>
                  <div style={{ color: '#C4A35A', fontWeight: 700, fontSize: 15 }}>₹{BASE_PRICES[crop]?.msp?.toLocaleString('en-IN') || '--'}</div>
                </div>
              </div>
              <div style={{ color: currentLive?.price > BASE_PRICES[crop]?.msp ? '#4A9B3F' : '#F87171', fontSize: 11, marginTop: 6 }}>
                {currentLive?.price > BASE_PRICES[crop]?.msp ? `+₹${(currentLive.price - BASE_PRICES[crop].msp).toLocaleString('en-IN')} above MSP ✓` : 'Below MSP — wait for govt procurement'}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Mandi List */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: '#C4A35A' }}>
            Nearby Mandis — {userState}
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#6B8A65' }} />
            <input
              className="input-field"
              style={{ paddingLeft: 30, fontSize: 12 }}
              placeholder="Search mandi..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, overflowY: 'auto' }}>
            <AnimatePresence>
              {filteredMandis.length === 0
                ? <div style={{ color: '#A8C5A0', fontSize: 13, textAlign: 'center', marginTop: 20 }}>No mandis found</div>
                : filteredMandis.map((m, i) => (
                  <motion.div
                    key={m.name}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    style={{
                      background: 'rgba(13,27,10,0.5)', border: '1px solid rgba(196,163,90,0.12)',
                      borderRadius: 10, padding: '10px 12px', cursor: 'pointer', transition: 'border-color 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(196,163,90,0.35)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(196,163,90,0.12)'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ color: '#F5ECD7', fontSize: 13, fontWeight: 600 }}>{m.name}</div>
                        <div style={{ color: '#A8C5A0', fontSize: 10, marginTop: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
                          <MapPin size={9} />{m.district} · {m.distance}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: '#C4A35A', fontWeight: 700, fontSize: 13 }}>{m.price}</div>
                        <div style={{ color: m.trend === 'up' ? '#4A9B3F' : '#F87171', fontSize: 10 }}>
                          {m.trend === 'up' ? <TrendingUp size={11} style={{ display: 'inline' }} /> : <TrendingDown size={11} style={{ display: 'inline' }} />}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              }
            </AnimatePresence>
          </div>
          <div style={{ color: '#6B8A65', fontSize: 10, textAlign: 'center', marginTop: 4 }}>
            Prices auto-update every 5 minutes
          </div>
        </div>
      </div>
    </div>
  );
}
