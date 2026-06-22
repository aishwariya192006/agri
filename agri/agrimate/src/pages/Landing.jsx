import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import PublicNavbar from '../components/Public/PublicNavbar';

/* ── Agriculture images from Unsplash (direct CDN, stable IDs) ── */
const HERO_BG     = 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=1920&q=80'; // green wheat field
const WHEAT_CARD  = 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80'; // wheat ears close-up
const PLANT_SMALL = 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=400&q=80'; // farm rows
const WHEAT_TALL  = 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=500&q=80'; // tall wheat stalks

/* Farmer avatars */
const AVATARS = ['#4a9b3f', '#8bc34a', '#2d6a1f', '#6aaf5a'];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1c2a0e',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '28px',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>

      {/* ══ MAIN CARD ══ */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 1160,
        minHeight: 700,
        borderRadius: 28,
        overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(0,0,0,0.55)',
      }}>

        {/* Background hero image */}
        <img
          src={HERO_BG}
          alt="farm field"
          onError={e => { e.target.style.display = 'none'; }}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center',
          }}
        />

        {/* Olive-green overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(40,55,10,0.82) 0%, rgba(80,95,20,0.55) 45%, rgba(30,45,8,0.80) 100%)',
        }} />

        {/* Watermark text */}
        <div style={{
          position: 'absolute', bottom: 12, left: 0, right: 0,
          textAlign: 'center', zIndex: 1,
          fontSize: 'clamp(36px,7vw,90px)',
          fontWeight: 900,
          color: 'rgba(255,255,255,0.07)',
          letterSpacing: '0.04em',
          userSelect: 'none',
          whiteSpace: 'nowrap',
        }}>
          AgriMate Intelligence
        </div>

        {/* ── NAVBAR ── */}
        <PublicNavbar />

        {/* ── HERO BODY ── */}
        <div style={{
          position: 'relative', zIndex: 5,
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          padding: '10px 36px 90px',
          gap: 24,
          minHeight: 580,
        }}>

          {/* LEFT: Headline + CTA */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            style={{ alignSelf: 'flex-end', paddingBottom: 24 }}
          >
            <h1 style={{
              fontSize: 'clamp(40px, 5.5vw, 72px)',
              fontWeight: 900,
              color: '#fff',
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
              marginBottom: 22,
            }}>
              Rooted in<br />
              <span style={{ color: '#c8e86a' }}>Intelligence,</span><br />
              Growing the Future
            </h1>

            <p style={{
              color: 'rgba(255,255,255,0.72)',
              fontSize: 14,
              lineHeight: 1.75,
              maxWidth: 340,
              marginBottom: 36,
            }}>
              AgriMate AI brings you the untouched precision
              of machine intelligence. Every insight is crafted
              to ensure growth, safety, and true smart farming
              for a prosperous harvest.
            </p>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <motion.button
                whileHover={{ scale: 1.04, background: 'rgba(255,255,255,0.22)' }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate('/app/dashboard')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 9,
                  padding: '13px 26px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.14)',
                  border: '1.5px solid rgba(255,255,255,0.4)',
                  color: '#fff', fontWeight: 700, fontSize: 14,
                  cursor: 'pointer', backdropFilter: 'blur(8px)',
                  transition: 'all 0.2s',
                }}
              >
                Enter Dashboard <ArrowUpRight size={16} />
              </motion.button>
            </div>

            {/* Small decorative farm image bottom-left */}
            <div style={{ marginTop: 48, width: 130, height: 110, position: 'relative' }}>
              <img
                src={PLANT_SMALL}
                alt="crops"
                onError={e => { e.target.parentElement.style.display = 'none'; }}
                style={{
                  width: '100%', height: '100%',
                  objectFit: 'cover', borderRadius: 14,
                  opacity: 0.85,
                  filter: 'saturate(1.3) brightness(0.9)',
                }}
              />
              <div style={{ position: 'absolute', inset: 0, borderRadius: 14, background: 'linear-gradient(to top, rgba(30,45,8,0.6), transparent)' }} />
            </div>
          </motion.div>

          {/* CENTER: Tall arched crop image */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', alignSelf: 'flex-end' }}
          >
            <img
              src={WHEAT_TALL}
              alt="wheat crop"
              onError={e => { e.target.parentElement.style.display = 'none'; }}
              style={{
                width: 'clamp(180px, 22vw, 300px)',
                height: 'clamp(320px, 45vw, 520px)',
                objectFit: 'cover',
                borderRadius: '180px 180px 0 0',
                filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5)) saturate(1.2) brightness(1.05)',
              }}
            />
          </motion.div>

          {/* RIGHT: Info card + farmer stat */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'flex-end', gap: 28,
              alignSelf: 'flex-start', paddingTop: 20,
            }}
          >
            {/* Glass info card */}
            <motion.div
              whileHover={{ scale: 1.03, y: -4 }}
              style={{
                width: 230,
                background: 'rgba(255,255,255,0.14)',
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: 20,
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                cursor: 'pointer',
              }}
            >
              <img
                src={WHEAT_CARD}
                alt="wheat"
                onError={e => { e.target.style.display = 'none'; e.target.parentElement.style.minHeight = '100px'; e.target.parentElement.style.background = 'rgba(200,232,106,0.1)'; }}
                style={{ width: '100%', height: 148, objectFit: 'cover', display: 'block', filter: 'brightness(0.95) saturate(1.2)' }}
              />
              <div style={{ padding: '14px 16px' }}>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: 15, lineHeight: 1.4 }}>
                  The Future Begins<br />in the Field
                </p>
              </div>
            </motion.div>

            {/* Avatar + farmer count */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
                {AVATARS.map((c, i) => (
                  <div key={i} style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: `radial-gradient(circle at 35% 35%, ${c}, ${c}aa)`,
                    border: '2px solid rgba(30,45,8,0.9)',
                    marginLeft: i === 0 ? 0 : -10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, color: '#fff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    zIndex: AVATARS.length - i,
                    position: 'relative',
                  }}>
                    {['RK', 'AS', 'MV', 'PK'][i]}
                  </div>
                ))}
              </div>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: 17, lineHeight: 1.35 }}>
                Empowering 50,000+<br />Farmers with Growth & Hope
              </p>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 5 }}>
                Across 15 states in India
              </p>
            </div>
          </motion.div>

        </div>

        {/* Bottom centre label */}
        <div style={{
          position: 'absolute', bottom: 60, left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 6, textAlign: 'center',
          color: 'rgba(255,255,255,0.65)',
          fontSize: 13, fontWeight: 500,
          letterSpacing: '0.02em',
          whiteSpace: 'nowrap',
        }}>
          Explore AI-Powered Farm Intelligence
        </div>

      </div>
    </div>
  );
}
