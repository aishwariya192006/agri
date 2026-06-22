import { motion } from 'framer-motion';
import PublicNavbar from '../components/Public/PublicNavbar';
import { ShieldAlert, TrendingUp, Cloud, BookOpen } from 'lucide-react';
import { useLang } from '../i18n/LangContext';

export default function Services() {
  const { t } = useLang();

  const services = [
    { icon: ShieldAlert, titleKey: 'svc1_title', descKey: 'svc1_desc' },
    { icon: TrendingUp,  titleKey: 'svc2_title', descKey: 'svc2_desc' },
    { icon: Cloud,       titleKey: 'svc3_title', descKey: 'svc3_desc' },
    { icon: BookOpen,    titleKey: 'svc4_title', descKey: 'svc4_desc' },
  ];

  return (
    <div style={{
      minHeight: '100vh', background: '#1c2a0e', fontFamily: "'Inter', system-ui, sans-serif",
      display: 'flex', flexDirection: 'column'
    }}>
      <PublicNavbar />
      
      <div style={{ padding: '60px 40px', maxWidth: 1000, margin: '0 auto', color: '#fff', flex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: 48, fontWeight: 900, marginBottom: 16 }}>
            {t('our_services').split(' ').map((w, i) => (
              <span key={i} style={i > 0 ? { color: '#c8e86a' } : {}}>{w} </span>
            ))}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', maxWidth: 600, margin: '0 auto' }}>
            {t('services_subtitle')}
          </motion.p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
          {services.map((s, i) => (
            <motion.div key={s.titleKey} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.03, borderColor: 'rgba(200,232,106,0.4)' }}
              style={{
                background: 'rgba(255,255,255,0.03)', padding: 32, borderRadius: 24,
                border: '1px solid rgba(255,255,255,0.1)', cursor: 'default'
              }}>
              <div style={{ width: 50, height: 50, borderRadius: 12, background: 'rgba(200,232,106,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <s.icon size={24} color="#c8e86a" />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: '#fff' }}>{t(s.titleKey)}</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, fontSize: 14 }}>{t(s.descKey)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
