import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Shield, Settings, Edit2, Camera, LogOut, ChevronRight, Check, X, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../i18n/LangContext';

/* ── India states list ── */
const INDIA_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu',
  'Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry',
];

const activityStatKeys = [
  { labelKey: 'queries_asked',    value: '124' },
  { labelKey: 'diseases_detected', value: '8'  },
  { labelKey: 'schemes_applied',  value: '3'   },
  { labelKey: 'alerts_received',  value: '47'  },
];

const recentActivity = [
  { icon: '🌾', action: 'Ran Soil Analysis for Field A', time: '2 hours ago' },
  { icon: '🐛', action: 'Detected Wheat Leaf Rust in Field B', time: '1 day ago' },
  { icon: '📊', action: 'Checked Market Prices for Cotton', time: '2 days ago' },
  { icon: '🏛️', action: 'Applied for PM-Kisan 17th installment', time: '5 days ago' },
  { icon: '💬', action: 'Asked AI Copilot about irrigation schedule', time: '1 week ago' },
];

const tabDefs = [
  { id: 'personal', icon: User,     labelKey: 'personal_info' },
  { id: 'farm',     icon: MapPin,   labelKey: 'farm_details'  },
  { id: 'security', icon: Shield,   labelKey: 'security'      },
  { id: 'settings', icon: Settings, labelKey: 'preferences'   },
];

/* ── reusable field components ── */
function DisplayField({ label, value, span }) {
  return (
    <div style={span ? { gridColumn: 'span 2' } : {}}>
      <div style={{ color: '#6B8A65', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</div>
      <div style={{ color: '#F5ECD7', fontSize: 14, background: 'rgba(13,27,10,0.5)', border: '1px solid rgba(196,163,90,0.1)', borderRadius: 10, padding: '10px 14px' }}>
        {value || '—'}
      </div>
    </div>
  );
}

function EditField({ label, name, value, onChange, span, type = 'text', options }) {
  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    color: '#F5ECD7', fontSize: 14,
    background: 'rgba(13,27,10,0.7)',
    border: '1.5px solid rgba(196,163,90,0.4)',
    borderRadius: 10, padding: '10px 14px',
    outline: 'none', fontFamily: "'Inter', system-ui, sans-serif",
    transition: 'border-color 0.18s',
  };
  return (
    <div style={span ? { gridColumn: 'span 2' } : {}}>
      <div style={{ color: '#C4A35A', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</div>
      {options ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
          onFocus={e => e.target.style.borderColor = '#C4A35A'}
          onBlur={e => e.target.style.borderColor = 'rgba(196,163,90,0.4)'}
        >
          <option value="">— Select {label} —</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          style={inputStyle}
          onFocus={e => e.target.style.borderColor = '#C4A35A'}
          onBlur={e => e.target.style.borderColor = 'rgba(196,163,90,0.4)'}
        />
      )}
    </div>
  );
}

export default function Profile() {
  const [tab, setTab] = useState('personal');
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useLang();

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'AM';
  const farm = user?.farm || { state: user?.state || 'Punjab', area: 12, crops: ['Wheat', 'Cotton'] };

  /* ── Personal Info edit state ── */
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name:     user?.name     || '',
    phone:    user?.phone    || '',
    email:    user?.email    || '',
    state:    user?.state    || '',
    district: user?.district || '',
    village:  user?.village  || '',
  });
  const [draft, setDraft] = useState({ ...form });

  const handleChange = e => setDraft(d => ({ ...d, [e.target.name]: e.target.value }));

  const handleEdit = () => {
    setDraft({ ...form });
    setEditing(true);
  };

  const handleCancel = () => {
    setDraft({ ...form });
    setEditing(false);
  };

  const handleSave = () => {
    setForm({ ...draft });
    updateUser({ ...draft });
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#C4A35A' }}>{t('my_profile')}</div>
        <div style={{ color: '#A8C5A0', fontSize: 14, marginTop: 4 }}>{t('profile_manage')}</div>
      </div>

      {/* Saved toast */}
      {saved && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 9999,
          background: 'linear-gradient(135deg,#1a5a2b,#2d6a1f)',
          border: '1px solid rgba(200,232,106,0.4)',
          borderRadius: 12, padding: '12px 20px',
          display: 'flex', alignItems: 'center', gap: 10,
          color: '#c8e86a', fontWeight: 600, fontSize: 14,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          <Check size={16} /> {t('profile_saved')}
        </div>
      )}

      {/* Profile Banner */}
      <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(196,163,90,0.2)' }}>
        <div style={{ height: 100, background: 'linear-gradient(135deg, #1A5A2B 0%, #4A9B3F 50%, #2D6A1F 100%)' }} />
        <div style={{ background: 'rgba(13,27,10,0.85)', backdropFilter: 'blur(20px)', padding: '0 32px 24px', display: 'flex', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', marginTop: -36 }}>
            <div style={{ width: 88, height: 88, borderRadius: '50%', background: '#4A9B3F', border: '3px solid #C4A35A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F5ECD7', fontWeight: 700, fontSize: 28 }}>{initials}</div>
            <button style={{ position: 'absolute', bottom: 2, right: 2, width: 28, height: 28, borderRadius: '50%', background: '#C4A35A', border: '2px solid #0A1508', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Camera size={13} color="#0A1508" />
            </button>
          </div>
          <div style={{ flex: 1, paddingBottom: 4 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: '#F5ECD7' }}>{form.name || user?.name || 'Farmer'}</div>
            <div style={{ color: '#A8C5A0', fontSize: 13, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={12} />
              {[form.village, form.district, form.state].filter(Boolean).join(', ') || 'India'}
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
              {farm.crops.map(crop => <span key={crop} className="badge-gold">{crop} Farmer</span>)}
              <span className="badge-green">{farm.area} Acres</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 20 }}>
        {/* Left Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card" style={{ padding: 8 }}>
            {tabDefs.map(({ id, icon: Icon, labelKey }) => (
              <button key={id} onClick={() => setTab(id)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: tab === id ? 'rgba(196,163,90,0.12)' : 'transparent',
                color: tab === id ? '#C4A35A' : '#A8C5A0', fontSize: 13, fontWeight: 600,
                transition: 'all 0.15s', marginBottom: 2,
              }}>
                <Icon size={15} color={tab === id ? '#C4A35A' : '#6B8A65'} />
                {t(labelKey)}
                <ChevronRight size={13} style={{ marginLeft: 'auto', opacity: tab === id ? 1 : 0 }} />
              </button>
            ))}
            <div style={{ borderTop: '1px solid rgba(196,163,90,0.1)', marginTop: 6, paddingTop: 6 }}>
              <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'transparent', color: '#F87171', fontSize: 13, fontWeight: 600 }}>
                <LogOut size={15} color="#F87171" /> {t('sign_out')}
              </button>
            </div>
          </div>

          {/* Activity Stats */}
          <div className="card">
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: '#C4A35A', marginBottom: 14 }}>{t('activity_stats')}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {activityStatKeys.map(({ labelKey, value }) => (
                <div key={labelKey} style={{ textAlign: 'center', background: 'rgba(13,27,10,0.5)', borderRadius: 10, padding: '10px 8px', border: '1px solid rgba(196,163,90,0.1)' }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#C4A35A' }}>{value}</div>
                  <div style={{ color: '#6B8A65', fontSize: 10, marginTop: 2 }}>{t(labelKey)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#C4A35A' }}>
                {t(tabDefs.find(tb => tb.id === tab)?.labelKey || 'personal_info')}
              </div>

              {/* Edit / Save / Cancel buttons — only on Personal Info */}
              {tab === 'personal' && (
                <div style={{ display: 'flex', gap: 8 }}>
                  {editing ? (
                    <>
                      <button
                        onClick={handleCancel}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                          background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
                          color: '#F87171', cursor: 'pointer',
                        }}
                      >
                        <X size={13} /> {t('cancel')}
                      </button>
                      <button
                        onClick={handleSave}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                          background: 'linear-gradient(135deg,#c8e86a,#7eff6a)',
                          border: 'none', color: '#0d1b0a', cursor: 'pointer',
                          boxShadow: '0 4px 14px rgba(126,255,106,0.3)',
                        }}
                      >
                        <Save size={13} /> {t('save_changes')}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleEdit}
                      className="btn-outline"
                      style={{ padding: '6px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <Edit2 size={12} /> {t('edit')}
                    </button>
                  )}
                </div>
              )}

              {tab !== 'personal' && (
                <button className="btn-outline" style={{ padding: '6px 12px', fontSize: 12 }}>
                  <Edit2 size={12} /> {t('edit')}
                </button>
              )}
            </div>

            {/* ── Personal Info ── */}
            {tab === 'personal' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {editing ? (
                  <>
                    <EditField label={t('full_name')}     name="name"     value={draft.name}     onChange={handleChange} />
                    <EditField label={t('phone_number')}  name="phone"    value={draft.phone}    onChange={handleChange} type="tel" />
                    <EditField label={t('email_address')} name="email"    value={draft.email}    onChange={handleChange} type="email" span />
                    <EditField label={t('state')}         name="state"    value={draft.state}    onChange={handleChange} options={INDIA_STATES} />
                    <EditField label={t('district')}      name="district" value={draft.district} onChange={handleChange} />
                    <EditField label={t('village')}       name="village"  value={draft.village}  onChange={handleChange} span />
                  </>
                ) : (
                  <>
                    <DisplayField label={t('full_name')}     value={form.name || user?.name} />
                    <DisplayField label={t('phone_number')}  value={form.phone || user?.phone} />
                    <DisplayField label={t('email_address')} value={form.email || user?.email} span />
                    <DisplayField label={t('state')}         value={form.state} />
                    <DisplayField label={t('district')}      value={form.district} />
                    <DisplayField label={t('village')}       value={form.village} span />
                  </>
                )}
              </div>
            )}

            {/* ── Farm Details ── */}
            {tab === 'farm' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { label: t('farm_size'),      value: '12 Acres' },
                  { label: t('soil_type'),      value: 'Loamy' },
                  { label: t('primary_crops'),  value: 'Wheat, Cotton', span: true },
                  { label: t('irrigation_type'),value: 'Canal & Tube Well' },
                  { label: t('farm_established'),value: '2008' },
                ].map(({ label, value, span }) => (
                  <DisplayField key={label} label={label} value={value} span={span} />
                ))}
              </div>
            )}

            {/* ── Security / Settings ── */}
            {(tab === 'security' || tab === 'settings') && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', textAlign: 'center' }}>
                <Settings size={44} color="rgba(196,163,90,0.2)" style={{ marginBottom: 16 }} />
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: '#F5ECD7', marginBottom: 6 }}>{t('coming_soon')}</div>
                <div style={{ color: '#A8C5A0', fontSize: 13 }}>{t('coming_soon_desc')}</div>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="card">
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: '#C4A35A', marginBottom: 14 }}>{t('recent_activity')}</div>
            {recentActivity.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < recentActivity.length - 1 ? '1px solid rgba(196,163,90,0.06)' : 'none' }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{a.icon}</span>
                <span style={{ flex: 1, color: '#F5ECD7', fontSize: 13, opacity: 0.9 }}>{a.action}</span>
                <span style={{ color: '#6B8A65', fontSize: 11, whiteSpace: 'nowrap' }}>{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
