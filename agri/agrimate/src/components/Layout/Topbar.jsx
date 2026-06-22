import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, Bot, Globe, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang } from '../../i18n/LangContext';
import { useAuth } from '../../context/AuthContext';

export default function Topbar({ sidebarWidth = 72 }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, lang, setLang, LANGUAGES } = useLang();
  const { user } = useAuth();
  const [langOpen, setLangOpen] = useState(false);
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'AM';

  const pageTitles = {
    '/app/dashboard':     t('dashboard'),
    '/app/copilot':       t('copilot'),
    '/app/assistant':     t('assistant'),
    '/app/seeds':         t('seeds'),
    '/app/soil':          t('soil'),
    '/app/disease':       t('disease'),
    '/app/pests':         'Pest Forecasting',
    '/app/weather':       t('weather'),
    '/app/market':        t('market'),
    '/app/profit':        t('profit'),
    '/app/schemes':       t('schemes'),
    '/app/calendar':      t('calendar'),
    '/app/community':     t('community'),
    '/app/notifications': t('notifications'),
    '/app/profile':       t('profile'),
  };

  const title   = pageTitles[location.pathname] || 'AgriMate';
  const dateStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const curLang = LANGUAGES.find(l => l.code === lang);

  return (
    <div style={{
      position: 'fixed', top: 0, left: sidebarWidth, right: 0, height: 64, zIndex: 30,
      background: 'rgba(1,8,4,0.88)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(0,255,136,0.12)',
      display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16, transition: 'left 0.3s',
    }}>
      {/* Page Title */}
      <div style={{ flexShrink: 0 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#00ff88', lineHeight: 1 }}>{title}</div>
        <div style={{ fontSize: 11, color: 'rgba(180,255,210,0.5)', marginTop: 2 }}>{dateStr}</div>
      </div>

      {/* Search */}
      <div style={{ flex: 1, maxWidth: 360, margin: '0 auto', position: 'relative' }}>
        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6B8A65' }} />
        <input type="text" placeholder={t('search')}
          style={{
            width: '100%', padding: '8px 16px 8px 36px', borderRadius: 24,
            background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.18)',
            color: '#d4ffe8', fontSize: 13, outline: 'none',
          }}
          onFocus={e => e.target.style.borderColor = '#00ff88'}
          onBlur={e => e.target.style.borderColor = 'rgba(0,255,136,0.18)'}
        />
      </div>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>

        {/* ── Language Selector ── */}
        <div style={{ position: 'relative' }}>
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
            onClick={() => setLangOpen(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 10,
              background: langOpen ? 'rgba(0,255,136,0.15)' : 'rgba(0,255,136,0.07)',
              border: '1px solid rgba(0,255,136,0.22)',
              color: '#00ff88', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            <Globe size={14}/>
            <span>{curLang?.flag} {curLang?.native}</span>
            <ChevronDown size={12} style={{ transition: 'transform 0.2s', transform: langOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}/>
          </motion.button>

          <AnimatePresence>
            {langOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.95 }}
                transition={{ duration: 0.18 }}
                style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  width: 220, maxHeight: 340, overflowY: 'auto',
                  background: 'rgba(5,18,8,0.98)', border: '1px solid rgba(0,255,136,0.25)',
                  borderRadius: 14, padding: '6px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(16px)', zIndex: 9999,
                }}
              >
                <div style={{ padding: '6px 10px 8px', fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {t('select_language')}
                </div>
                {LANGUAGES.map(l => (
                  <motion.button key={l.code}
                    whileHover={{ background: 'rgba(0,255,136,0.1)' }}
                    onClick={() => { setLang(l.code); setLangOpen(false); }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 10px', borderRadius: 8, border: 'none',
                      background: lang === l.code ? 'rgba(0,255,136,0.12)' : 'transparent',
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{l.flag}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: lang === l.code ? '#00ff88' : '#e8f5e8', fontSize: 13, fontWeight: 600 }}>{l.native}</div>
                      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10 }}>{l.label}</div>
                    </div>
                    {lang === l.code && <Check size={14} color="#00ff88"/>}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Copilot */}
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/app/copilot')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10,
            background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.25)',
            color: '#00ff88', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}
        >
          <Bot size={15}/> {t('copilot')}
        </motion.button>

        {/* Notifications */}
        <button onClick={() => navigate('/app/notifications')}
          style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: 'rgba(180,255,210,0.6)' }}
        >
          <Bell size={20}/>
          <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: '50%', background: '#F87171', border: '2px solid #010804' }}/>
        </button>

        {/* Avatar & Name */}
        <button onClick={() => navigate('/app/profile')}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'none', border: 'none', cursor: 'pointer', padding: 0
          }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(0,80,40,0.8)', border: '2px solid #00ff88',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#00ff88', fontWeight: 700, fontSize: 12,
          }}>{initials}</div>
          <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#d4ffe8', fontSize: 13, fontWeight: 600 }}>{user?.name || 'Guest User'}</span>
            <span style={{ color: 'rgba(0,255,136,0.6)', fontSize: 10, fontWeight: 500 }}>{user ? t('farmer') : 'Not signed in'}</span>
          </div>
        </button>
      </div>
    </div>
  );
}
