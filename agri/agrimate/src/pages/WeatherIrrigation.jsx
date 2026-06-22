import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Cloud, CloudRain, CloudLightning, Wind, Droplets, MapPin, CheckCircle, AlertTriangle, RefreshCw, Thermometer } from 'lucide-react';
import { weatherApi } from '../api';
import { useAuth } from '../context/AuthContext';

const ICON_MAP = {
  sun:   { Icon: Sun,            color: '#F4C842' },
  cloud: { Icon: Cloud,          color: '#A8C5A0' },
  rain:  { Icon: CloudRain,      color: '#7A9BB5' },
  storm: { Icon: CloudLightning, color: '#F87171' },
};

function WeatherIcon({ icon, size = 24, style = {} }) {
  const { Icon, color } = ICON_MAP[icon] || ICON_MAP.cloud;
  return <Icon size={size} color={color} style={style} />;
}

export default function WeatherIrrigation() {
  const { user } = useAuth();
  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState(null);
  const [lastFetch,  setLastFetch]  = useState(null);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const res = await weatherApi.forecast();
      setData(res);
      setLastFetch(new Date());
    } catch (e) {
      setError('Could not load weather data. Showing cached forecast.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  /* Auto-refresh every 10 min */
  useEffect(() => {
    const id = setInterval(() => load(true), 10 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid rgba(196,163,90,0.2)', borderTop: '3px solid #C4A35A', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const { current, forecast7 = [], rainAlerts = [], irrigationSchedule = [], location } = data || {};
  const loc = location ? `${location.city}, ${location.state}` : 'Your Location';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .weather-grid { grid-template-columns: repeat(4,1fr) !important; gap: 8px !important; }
          .weather-stats { grid-template-columns: 1fr 1fr !important; }
          .irr-grid { grid-template-columns: 1fr 1fr auto !important; font-size: 12px !important; }
        }
        @media (max-width: 480px) {
          .weather-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(20px,4vw,28px)', fontWeight: 700, color: '#C4A35A' }}>
            Weather &amp; Irrigation
          </div>
          <div style={{ color: '#A8C5A0', fontSize: 13, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <MapPin size={12} /> {loc}
            {data?.fallback && <span style={{ color: '#F87171', fontSize: 11, marginLeft: 8 }}>⚠ Cached data</span>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {lastFetch && (
            <span style={{ color: '#6B8A65', fontSize: 11 }}>
              Updated {lastFetch.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => load(true)}
            style={{ background: 'rgba(196,163,90,0.1)', border: '1px solid rgba(196,163,90,0.25)', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', color: '#C4A35A', display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}
          >
            <RefreshCw size={12} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />
            Refresh
          </motion.button>
        </div>
      </div>

      {/* Smart Rain Alerts */}
      <AnimatePresence>
        {rainAlerts.length > 0 && rainAlerts.slice(0, 2).map((alert, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              background: alert.rainPct >= 80 ? 'rgba(248,113,113,0.1)' : 'rgba(122,155,181,0.12)',
              border: `1px solid ${alert.rainPct >= 80 ? 'rgba(248,113,113,0.4)' : 'rgba(122,155,181,0.4)'}`,
              borderRadius: 14, padding: '12px 16px',
              display: 'flex', alignItems: 'flex-start', gap: 12,
            }}
          >
            <AlertTriangle size={20} color={alert.rainPct >= 80 ? '#F87171' : '#7A9BB5'} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ color: alert.rainPct >= 80 ? '#F87171' : '#7A9BB5', fontWeight: 700, fontSize: 14 }}>
                🌧 Rain Alert — {alert.day} ({alert.date}): {alert.rainPct}% chance
              </div>
              <div style={{ color: '#A8C5A0', fontSize: 13, marginTop: 2 }}>
                {alert.message}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Current Weather */}
      {current && (
        <div className="card" style={{
          background: 'linear-gradient(135deg, rgba(26,46,16,0.6) 0%, rgba(15,30,10,0.8) 100%)',
          borderColor: 'rgba(196,163,90,0.25)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}>
                <WeatherIcon icon={current.icon} size={72} style={{ filter: 'drop-shadow(0 0 16px rgba(244,200,66,0.5))' }} />
              </motion.div>
              <div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(44px,8vw,68px)', fontWeight: 700, color: '#F5ECD7', lineHeight: 1 }}>
                  {current.temp}°
                </div>
                <div style={{ color: '#A8C5A0', fontSize: 16, marginTop: 4 }}>{current.label}</div>
                <div style={{ color: '#6B8A65', fontSize: 12 }}>Feels like {current.feelsLike}°C</div>
              </div>
            </div>
            <div className="weather-stats" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { icon: Droplets,    label: 'Humidity',     value: `${current.humidity}%`           },
                { icon: Wind,        label: 'Wind',         value: `${current.windspeed} km/h`       },
                { icon: CloudRain,   label: 'Precipitation', value: `${current.precipitation} mm`   },
                { icon: Thermometer, label: 'Soil Moisture', value: `${current.soilMoisture}%`       },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(196,163,90,0.1)', border: '1px solid rgba(196,163,90,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={15} color="#C4A35A" />
                  </div>
                  <div>
                    <div style={{ color: '#A8C5A0', fontSize: 10 }}>{label}</div>
                    <div style={{ color: '#F5ECD7', fontWeight: 600, fontSize: 13 }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7-Day Forecast */}
      <div className="card">
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, color: '#C4A35A', marginBottom: 14 }}>
          7-Day Forecast
        </div>
        <div className="weather-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 8 }}>
          {forecast7.map(({ day, date, icon, hi, lo, rain, rainPct }) => (
            <motion.div
              key={day}
              whileHover={{ scale: 1.05, borderColor: 'rgba(196,163,90,0.4)' }}
              style={{
                background: rainPct >= 60 ? 'rgba(122,155,181,0.1)' : 'rgba(13,27,10,0.5)',
                border: `1px solid ${rainPct >= 60 ? 'rgba(122,155,181,0.3)' : 'rgba(196,163,90,0.12)'}`,
                borderRadius: 12, padding: '10px 6px', textAlign: 'center', transition: 'border-color 0.2s',
              }}
            >
              <div style={{ color: '#C4A35A', fontSize: 11, fontWeight: 700 }}>{day}</div>
              <div style={{ color: '#6B8A65', fontSize: 9, marginBottom: 6 }}>{date}</div>
              <WeatherIcon icon={icon} size={22} style={{ margin: '0 auto 6px' }} />
              <div style={{ color: '#F5ECD7', fontSize: 13, fontWeight: 700 }}>{hi}°</div>
              <div style={{ color: '#A8C5A0', fontSize: 10 }}>{lo}°</div>
              <div style={{ color: rainPct >= 60 ? '#7A9BB5' : '#6B8A65', fontSize: 10, marginTop: 4 }}>{rain}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Irrigation Recommendations */}
      <div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#C4A35A', marginBottom: 12 }}>
          Irrigation Recommendations
        </div>

        {/* Today's status */}
        {irrigationSchedule[0] && (
          <div style={{
            background: irrigationSchedule[0].skip ? 'rgba(122,155,181,0.1)' : 'rgba(74,155,63,0.1)',
            border: `1px solid ${irrigationSchedule[0].skip ? 'rgba(122,155,181,0.3)' : 'rgba(74,155,63,0.3)'}`,
            borderRadius: 14, padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14,
          }}>
            {irrigationSchedule[0].skip
              ? <AlertTriangle size={20} color="#7A9BB5" />
              : <CheckCircle size={20} color="#4A9B3F" />
            }
            <div>
              <div style={{ color: irrigationSchedule[0].skip ? '#7A9BB5' : '#4A9B3F', fontWeight: 700, fontSize: 14 }}>
                {irrigationSchedule[0].skip ? 'Skip Irrigation Today' : 'Irrigation Recommended Today'}
              </div>
              <div style={{ color: '#A8C5A0', fontSize: 12, marginTop: 2 }}>
                {irrigationSchedule[0].status} — Soil moisture: {current?.soilMoisture || 68}%
              </div>
            </div>
          </div>
        )}

        {/* Schedule table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 18px', borderBottom: '1px solid rgba(196,163,90,0.12)', fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: '#C4A35A' }}>
            Weekly Irrigation Schedule
          </div>
          {irrigationSchedule.map((row, i) => (
            <div
              key={i}
              className="irr-grid"
              style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                padding: '11px 18px', alignItems: 'center',
                background: row.skip ? 'rgba(122,155,181,0.05)' : i % 2 === 0 ? 'rgba(196,163,90,0.03)' : 'transparent',
                borderBottom: i < irrigationSchedule.length - 1 ? '1px solid rgba(196,163,90,0.06)' : 'none',
              }}
            >
              <div>
                <span style={{ color: '#F5ECD7', fontSize: 13 }}>{row.day}</span>
                <span style={{ color: '#6B8A65', fontSize: 10, marginLeft: 6 }}>{row.date}</span>
              </div>
              <span style={{ color: '#A8C5A0', fontSize: 13 }}>{row.amount}</span>
              <span style={{ color: row.statusColor, fontSize: 12, fontWeight: 600 }}>
                {row.skip && '🌧 '}{row.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
