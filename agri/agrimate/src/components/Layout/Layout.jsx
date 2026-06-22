import { Suspense, useState } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import VoiceBar from '../VoiceBar';
import { BookOpen, X } from 'lucide-react';
import { useLang } from '../../i18n/LangContext';

const SIDEBAR_OFFSET = 72;

/* ─── Holographic farm field image ─────────────────────
   Same image used in the dashboard reference photo.
   We use an Unsplash URL that closely matches the dark
   field + glowing crops look.  ─────────────────────── */
const BG_IMAGE =
  'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=1920&q=80';

function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        border: '3px solid rgba(0,255,136,0.15)',
        borderTop: '3px solid #00ff88',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function GlobalAIBar() {
  const [open, setOpen] = useState(false);
  const { t } = useLang();
  const getPageText = () => document.body.innerText.slice(0, 2000);
  return (
    <div style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 300, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.92 }}
            style={{
              background: 'rgba(10,22,10,0.96)', border: '1px solid rgba(74,222,128,0.3)',
              borderRadius: 18, padding: '16px 18px', backdropFilter: 'blur(14px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)', minWidth: 260,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ color: '#4ADE80', fontSize: 13, fontWeight: 700 }}>🤖 {t('ai_assistant')}</span>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 0 }}
              ><X size={14}/></motion.button>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, lineHeight: 1.6, margin: '0 0 12px' }}>
              {t('explain_page')} 🔊
            </p>
            <VoiceBar getText={getPageText} />
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
        onClick={() => setOpen(v => !v)}
        style={{
          width: 52, height: 52, borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: open ? 'linear-gradient(135deg,#166534,#15803d)' : 'linear-gradient(135deg,#4ADE80,#16a34a)',
          boxShadow: '0 4px 20px rgba(74,222,128,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        title={t('explain_page')}
      >
        <BookOpen size={20} color="#052e16"/>
      </motion.button>
    </div>
  );
}

export default function Layout() {
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/auth" replace />;

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>

      {/* ── Fixed farm field background ── */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: `url(${BG_IMAGE})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center bottom',
        backgroundRepeat: 'no-repeat',
      }} />

      {/* ── Dark overlay: keeps text/cards readable ── */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1,
        background: 'rgba(1, 7, 3, 0.86)',
      }} />

      {/* ── Subtle green glow from bottom (the holographic light source) ── */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 80% 40% at 50% 105%, rgba(0,80,35,0.45) 0%, transparent 65%)',
      }} />

      {/* ── Grid scan-lines for the holographic feel ── */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(rgba(0,255,136,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,255,136,0.025) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
      }} />

      {/* ── UI layer ── */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Sidebar />
        <Topbar sidebarWidth={SIDEBAR_OFFSET} />

        {/* Global floating AI bar */}
        <GlobalAIBar />

        <main style={{ marginLeft: SIDEBAR_OFFSET, paddingTop: 64, minHeight: '100vh' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.32, ease: 'easeOut' }}
              style={{ padding: '24px 28px', maxWidth: 1400 }}
            >
              <Suspense fallback={<Spinner />}>
                <Outlet />
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
