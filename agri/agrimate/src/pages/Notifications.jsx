import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, CloudRain, Bug, TrendingUp, Building2, Calendar, CheckCircle2, Trash2 } from 'lucide-react';
import { useLang } from '../i18n/LangContext';

const STORAGE_KEY = 'agrimate_notifs_read';
const CLEARED_KEY = 'agrimate_notifs_cleared';

const allNotifs = [
  { id: 1, type: 'alert',    icon: CloudRain,  title: 'Heavy Rain Alert',       desc: '80% chance of heavy rain tomorrow. Delay scheduled irrigation for Wheat Field A.',         time: '2 hours ago', iconColor: '#7A9BB5', iconBg: 'rgba(122,155,181,0.15)' },
  { id: 2, type: 'alert',    icon: Bug,        title: 'Disease Risk: High',      desc: 'Conditions are favorable for Leaf Rust in your area. Inspect wheat crops immediately.',     time: '5 hours ago', iconColor: '#F87171', iconBg: 'rgba(248,113,113,0.15)' },
  { id: 3, type: 'market',   icon: TrendingUp, title: 'Price Spike: Cotton',     desc: 'Cotton prices in Bathinda mandi are up by ₹150/qtl today. Current: ₹6,950/qtl.',           time: '1 day ago',   iconColor: '#C4A35A', iconBg: 'rgba(196,163,90,0.15)'  },
  { id: 4, type: 'govt',     icon: Building2,  title: 'New Scheme Matched',      desc: 'You are eligible for 50% subsidy on solar water pumps. Apply by July 31st.',              time: '2 days ago',  iconColor: '#9B7AAF', iconBg: 'rgba(155,122,175,0.15)' },
  { id: 5, type: 'reminder', icon: Calendar,   title: 'Task Reminder',           desc: 'Scheduled: Apply NPK Fertilizer to Cotton Field B tomorrow at 05:30 PM.',                  time: '2 days ago',  iconColor: '#4A9B3F', iconBg: 'rgba(74,155,63,0.15)'   },
  { id: 6, type: 'alert',    icon: CloudRain,  title: 'Optimal Sowing Window',   desc: 'Weather forecast shows optimal conditions for Rabi sowing next week (Oct 15–20).',          time: '3 days ago',  iconColor: '#7A9BB5', iconBg: 'rgba(122,155,181,0.15)' },
  { id: 7, type: 'market',   icon: TrendingUp, title: 'Wheat MSP Updated',       desc: 'Govt. has increased Wheat MSP to ₹2,275/qtl for Rabi 2026. +3.5% from last year.',         time: '4 days ago',  iconColor: '#C4A35A', iconBg: 'rgba(196,163,90,0.15)'  },
  { id: 8, type: 'govt',     icon: Building2,  title: 'PM Kisan Installment',    desc: 'PM-Kisan 17th installment of ₹2,000 has been credited to your registered account.',       time: '5 days ago',  iconColor: '#4A9B3F', iconBg: 'rgba(74,155,63,0.15)'   },
];

// tab keys map to translation keys
const TAB_KEYS = [
  { id: 'All',       key: 'all_tab',       type: null        },
  { id: 'Alerts',    key: 'alerts_tab',    type: 'alert'     },
  { id: 'Reminders', key: 'reminders_tab', type: 'reminder'  },
  { id: 'Market',    key: 'market_tab',    type: 'market'    },
  { id: 'Govt',      key: 'govt_tab',      type: 'govt'      },
];

/* ── helpers ── */
function loadReadIds() {
  try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')); } catch { return new Set(); }
}
function saveReadIds(ids) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}
function isCleared() {
  return localStorage.getItem(CLEARED_KEY) === 'true';
}

export default function Notifications() {
  const { t } = useLang();
  const [cleared, setCleared]   = useState(isCleared);
  const [readIds, setReadIds]   = useState(loadReadIds);
  const [filter, setFilter]     = useState('All');

  /* persist read IDs whenever they change */
  useEffect(() => { saveReadIds(readIds); }, [readIds]);

  /* mark a single notification as read */
  const markRead = (id) => setReadIds(prev => new Set([...prev, id]));

  /* mark all as read */
  const markAllRead = () => {
    const all = new Set(allNotifs.map(n => n.id));
    setReadIds(all);
  };

  /* clear all notifications */
  const clearAll = () => {
    setCleared(true);
    localStorage.setItem(CLEARED_KEY, 'true');
  };

  /* restore notifications */
  const restore = () => {
    setCleared(false);
    setReadIds(new Set());
    localStorage.removeItem(CLEARED_KEY);
    localStorage.removeItem(STORAGE_KEY);
  };

  /* build displayed list */
  const notifs = cleared ? [] : allNotifs.map(n => ({ ...n, read: readIds.has(n.id) }));
  const unread = notifs.filter(n => !n.read).length;
  const activeTab = TAB_KEYS.find(tab => tab.id === filter);
  const filtered = notifs.filter(n => {
    if (filter === 'All') return true;
    return n.type === activeTab?.type;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 780 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#C4A35A' }}>{t('notifications')}</div>
            {unread > 0 && <span className="badge-red">{unread} unread</span>}
          </div>
          <div style={{ color: '#A8C5A0', fontSize: 14, marginTop: 4 }}>{t('stay_updated')}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {!cleared && (
            <button
              onClick={markAllRead}
              className="btn-outline"
              style={{ padding: '7px 14px', fontSize: 12 }}
            >
              <CheckCircle2 size={13} /> {t('mark_all_read')}
            </button>
          )}
          <button
            onClick={cleared ? restore : clearAll}
            style={{
              padding: '7px 14px', fontSize: 12,
              background: cleared ? 'rgba(74,155,63,0.1)' : 'rgba(248,113,113,0.1)',
              border: `1px solid ${cleared ? 'rgba(74,155,63,0.3)' : 'rgba(248,113,113,0.3)'}`,
              color: cleared ? '#4A9B3F' : '#F87171',
              borderRadius: 10, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <Trash2 size={13} /> {cleared ? t('restore_notifs') : t('clear_notifs')}
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {TAB_KEYS.map(tab => (
          <button key={tab.id} onClick={() => setFilter(tab.id)} style={{
            padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none',
            background: filter === tab.id ? '#C4A35A' : 'rgba(196,163,90,0.1)',
            color: filter === tab.id ? '#0A1508' : '#A8C5A0',
            transition: 'all 0.2s',
          }}>{t(tab.key)}</button>
        ))}
      </div>

      {/* Notification List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' }}>
            <Bell size={44} color="rgba(196,163,90,0.2)" style={{ marginBottom: 16 }} />
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: '#F5ECD7', marginBottom: 6 }}>
              {cleared ? t('all_cleared') : t('all_caught_up')}
            </div>
            <div style={{ color: '#A8C5A0', fontSize: 13 }}>
              {cleared
                ? <button onClick={restore} style={{ background: 'none', border: 'none', color: '#C4A35A', cursor: 'pointer', textDecoration: 'underline', fontSize: 13 }}>{t('restore_link')}</button>
                : `No ${filter.toLowerCase()} notifications`}
            </div>
          </div>
        ) : (
          filtered.map((n, i) => {
            const Icon = n.icon;
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => markRead(n.id)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px 20px',
                  borderLeft: n.read ? '3px solid transparent' : '3px solid #C4A35A',
                  borderBottom: i < filtered.length - 1 ? '1px solid rgba(196,163,90,0.08)' : 'none',
                  background: n.read ? 'transparent' : 'rgba(196,163,90,0.04)',
                  cursor: 'pointer', transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(196,163,90,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(196,163,90,0.04)'}
              >
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: n.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={20} color={n.iconColor} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ color: n.read ? '#A8C5A0' : '#F5ECD7', fontSize: 14, fontWeight: n.read ? 500 : 700 }}>{n.title}</div>
                    <span style={{ color: '#6B8A65', fontSize: 11, whiteSpace: 'nowrap' }}>{n.time}</span>
                  </div>
                  <div style={{ color: n.read ? '#6B8A65' : '#A8C5A0', fontSize: 13, marginTop: 3, lineHeight: 1.5 }}>{n.desc}</div>
                </div>
                {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#C4A35A', flexShrink: 0, marginTop: 4 }} />}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
