import { motion } from 'framer-motion';
import PublicNavbar from '../components/Public/PublicNavbar';
import { ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';

export default function About() {
  const navigate = useNavigate();
  const { t } = useLang();

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1c2a0e',
      fontFamily: "'Inter', system-ui, sans-serif",
      display: 'flex', flexDirection: 'column'
    }}>
      <PublicNavbar />
      
      <div style={{ padding: '60px 40px', maxWidth: 900, margin: '0 auto', color: '#fff', flex: 1 }}>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: 56, fontWeight: 900, marginBottom: 24, lineHeight: 1.1 }}>
          {t('about_title')}
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: 40 }}>
          {t('about_desc')}
        </motion.p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 60 }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: 32, borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ fontSize: 24, color: '#c8e86a', marginBottom: 16 }}>{t('our_mission')}</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>{t('mission_text')}</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: 32, borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ fontSize: 24, color: '#c8e86a', marginBottom: 16 }}>{t('our_vision')}</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>{t('vision_text')}</p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/auth?mode=signup')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '14px 28px', borderRadius: 30, background: '#7eff6a', color: '#0d1b0a',
            fontWeight: 800, fontSize: 15, border: 'none', cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(126,255,106,0.3)',
          }}>
          {t('join_mission')} <ArrowUpRight size={18} />
        </motion.button>
      </div>
    </div>
  );
}
