import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Eye, EyeOff, ArrowRight, ArrowLeft, User, Mail, Lock, Phone, MapPin } from 'lucide-react';

const HERO_BG =
  'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=1920&q=80';

export default function Auth() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [mode, setMode] = useState(params.get('mode') === 'signup' ? 'signup' : 'signin');
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '', state: '', district: '', village: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, signup } = useAuth();

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'signin') {
        await login(form.email, form.password);
      } else {
        await signup(form);
      }
      navigate('/app/dashboard');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const G = '#00ff88';
  const CARD = 'rgba(3,14,7,0.82)';
  const BORDER = 'rgba(0,255,136,0.2)';
  const MUTED = 'rgba(180,255,210,0.5)';

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', system-ui, sans-serif", position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: `url(${HERO_BG})`, backgroundSize: 'cover', backgroundPosition: 'center bottom' }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: 'rgba(1,8,4,0.88)' }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none', background: 'radial-gradient(ellipse 80% 40% at 50% 105%, rgba(0,80,35,0.5) 0%, transparent 65%)' }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(0,255,136,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.025) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

      <button
        onClick={() => navigate('/')}
        style={{ position: 'fixed', top: 24, left: 28, zIndex: 10, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,255,136,0.08)', border: `1px solid ${BORDER}`, color: G, fontSize: 13, fontWeight: 600, padding: '8px 14px', borderRadius: 20, cursor: 'pointer' }}
      >
        <ArrowLeft size={14} /> Back to Home
      </button>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 440, margin: '0 20px' }}
      >
        <div style={{ background: CARD, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: `1px solid ${BORDER}`, borderRadius: 24, padding: '36px 36px 32px', boxShadow: `0 0 40px rgba(0,255,136,0.1), 0 20px 60px rgba(0,0,0,0.6)` }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, justifyContent: 'center' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#00ff88,#00cc66)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 14px rgba(0,255,136,0.4)` }}>
              <Leaf size={19} color="#010e05" />
            </div>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>AgriMate</span>
          </div>

          {/* Tab toggle */}
          <div style={{ display: 'flex', background: 'rgba(0,255,136,0.06)', border: `1px solid ${BORDER}`, borderRadius: 12, padding: 4, marginBottom: 28 }}>
            {['signin', 'signup'].map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  flex: 1, padding: '9px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                  background: mode === m ? G : 'transparent',
                  color: mode === m ? '#010e05' : MUTED,
                  transition: 'all 0.2s',
                }}
              >
                {m === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
              {mode === 'signin' ? 'Welcome back 👋' : 'Create your account 🌱'}
            </h2>
            <p style={{ fontSize: 13, color: MUTED }}>
              {mode === 'signin'
                ? 'Sign in to access your smart farm dashboard.'
                : 'Join 50,000+ farmers using AI-powered agriculture.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div key="name" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                  <Field icon={User} name="name" placeholder="Full Name" value={form.name} onChange={handle} G={G} BORDER={BORDER} MUTED={MUTED} />
                </motion.div>
              )}
            </AnimatePresence>

            <Field icon={Mail} name="email" type="email" placeholder="Email Address" value={form.email} onChange={handle} G={G} BORDER={BORDER} MUTED={MUTED} required />

            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div key="phone" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                  <Field icon={Phone} name="phone" type="tel" placeholder="Phone Number" value={form.phone} onChange={handle} G={G} BORDER={BORDER} MUTED={MUTED} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Password */}
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: MUTED, pointerEvents: 'none' }}>
                <Lock size={15} />
              </div>
              <input
                name="password" type={showPass ? 'text' : 'password'}
                placeholder="Password" value={form.password} onChange={handle} required
                style={{ width: '100%', padding: '12px 44px', borderRadius: 12, background: 'rgba(0,255,136,0.06)', border: `1px solid ${BORDER}`, color: '#d4ffe8', fontSize: 14, outline: 'none', transition: 'all 0.2s' }}
                onFocus={e => e.target.style.borderColor = G}
                onBlur={e => e.target.style.borderColor = BORDER}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: MUTED, cursor: 'pointer' }}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* Location fields — signup only (Feature 6) */}
            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div key="location" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ color: MUTED, fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 2 }}>📍 Farm Location</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <Field icon={MapPin} name="state" placeholder="State" value={form.state} onChange={handle} G={G} BORDER={BORDER} MUTED={MUTED} />
                    <Field icon={MapPin} name="district" placeholder="District" value={form.district} onChange={handle} G={G} BORDER={BORDER} MUTED={MUTED} />
                  </div>
                  <Field icon={MapPin} name="village" placeholder="Village / Area" value={form.village} onChange={handle} G={G} BORDER={BORDER} MUTED={MUTED} />
                </motion.div>
              )}
            </AnimatePresence>

            {mode === 'signin' && (
              <div style={{ textAlign: 'right', marginTop: -6 }}>
                <a href="#" style={{ color: G, fontSize: 12, textDecoration: 'none', fontWeight: 500 }}>Forgot password?</a>
              </div>
            )}

            {error && (
              <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.35)', color: '#FCA5A5', fontSize: 13 }}>
                {error}
              </div>
            )}

            <motion.button
              type="submit" disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.03, boxShadow: `0 0 24px rgba(0,255,136,0.5)` }}
              whileTap={{ scale: 0.97 }}
              style={{
                marginTop: 4, padding: '13px', borderRadius: 12, border: 'none', cursor: loading ? 'wait' : 'pointer',
                background: `linear-gradient(135deg, ${G}, #00cc66)`,
                color: '#010e05', fontWeight: 800, fontSize: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: `0 0 16px rgba(0,255,136,0.3)`,
                transition: 'all 0.2s',
              }}
            >
              {loading
                ? <><span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(1,14,5,0.3)', borderTop: '2px solid #010e05', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} /> Processing...</>
                : <>{mode === 'signin' ? 'Sign In to Dashboard' : 'Create Account'} <ArrowRight size={16} /></>
              }
            </motion.button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: MUTED }}>
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} style={{ background: 'none', border: 'none', color: G, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
              {mode === 'signin' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>

        </div>
      </motion.div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function Field({ icon: Icon, name, type = 'text', placeholder, value, onChange, G, BORDER, MUTED, required }) {
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: MUTED, pointerEvents: 'none' }}>
        <Icon size={15} />
      </div>
      <input
        name={name} type={type} placeholder={placeholder} value={value} onChange={onChange} required={required}
        style={{ width: '100%', padding: '12px 16px 12px 40px', borderRadius: 12, background: 'rgba(0,255,136,0.06)', border: `1px solid ${BORDER}`, color: '#d4ffe8', fontSize: 14, outline: 'none', transition: 'all 0.2s' }}
        onFocus={e => e.target.style.borderColor = G}
        onBlur={e => e.target.style.borderColor = BORDER}
      />
    </div>
  );
}
