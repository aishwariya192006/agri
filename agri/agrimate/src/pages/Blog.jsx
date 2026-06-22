import { motion } from 'framer-motion';
import PublicNavbar from '../components/Public/PublicNavbar';
import { useLang } from '../i18n/LangContext';

const posts = [
  {
    img: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
    tag: 'Agronomy',
    title: 'Managing Nitrogen Levels in Wheat',
    date: 'Oct 12, 2026',
    excerpt: 'Learn how precision nitrogen management can boost wheat yields by up to 30% while reducing environmental impact.',
  },
  {
    img: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=600&q=80',
    tag: 'Market',
    title: 'Cotton Price Forecast for Winter',
    date: 'Oct 08, 2026',
    excerpt: 'Our AI models predict a 12% price surge in raw cotton by December. Here is what farmers should know.',
  },
  {
    img: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=600&q=80',
    tag: 'Technology',
    title: 'How AI is Changing Pest Control',
    date: 'Oct 02, 2026',
    excerpt: 'From drone surveillance to predictive analytics, discover how machine learning is revolutionizing pest management.',
  },
  {
    img: 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=600&q=80',
    tag: 'Sustainability',
    title: 'Water-Efficient Rice Cultivation',
    date: 'Sep 25, 2026',
    excerpt: 'New techniques in alternate wetting and drying (AWD) can save 30% water without compromising rice yield.',
  },
  {
    img: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=600&q=80',
    tag: 'Science',
    title: 'Understanding Your Soil Microbiome',
    date: 'Sep 18, 2026',
    excerpt: 'Healthy soil teems with billions of microorganisms. Here is how to nurture them for better crops.',
  },
  {
    img: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=600&q=80',
    tag: 'Innovation',
    title: 'IoT Sensors Every Farm Needs in 2026',
    date: 'Sep 10, 2026',
    excerpt: 'Affordable IoT sensors are transforming small farms. We review the top 5 devices under ₹5,000.',
  },
];

const FALLBACK_ICONS = {
  'Agronomy': '🌾', 'Market': '📈', 'Technology': '🤖',
  'Sustainability': '💧', 'Science': '🔬', 'Innovation': '📡',
};

const handleImgError = (e, tag) => {
  e.target.onerror = null;
  e.target.style.display = 'none';
  const parent = e.target.parentElement;
  parent.style.background = 'linear-gradient(135deg, rgba(200,232,106,0.08), rgba(74,155,63,0.12))';
  parent.style.display = 'flex';
  parent.style.alignItems = 'center';
  parent.style.justifyContent = 'center';
  parent.style.flexDirection = 'column';
  parent.style.gap = '8px';
  const icon = document.createElement('div');
  icon.innerText = FALLBACK_ICONS[tag] || '🌿';
  icon.style.cssText = 'font-size:48px;opacity:0.5;';
  parent.appendChild(icon);
};

export default function Blog() {
  const { t } = useLang();

  return (
    <div style={{
      minHeight: '100vh', background: '#1c2a0e', fontFamily: "'Inter', system-ui, sans-serif",
      display: 'flex', flexDirection: 'column'
    }}>
      <PublicNavbar />
      
      <div style={{ padding: '60px 40px', maxWidth: 1100, margin: '0 auto', color: '#fff', flex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 50 }}>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: 48, fontWeight: 900, marginBottom: 16 }}>
            {t('blog_title').split(' ').map((w, i) => (
              <span key={i} style={i >= 2 ? { color: '#c8e86a' } : {}}>{w} </span>
            ))}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)' }}>
            {t('blog_subtitle')}
          </motion.p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 32 }}>
          {posts.map((p, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              whileHover={{ y: -8 }}
              style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}>
              <div style={{ width: '100%', height: 200, position: 'relative', background: 'linear-gradient(135deg, rgba(200,232,106,0.1), rgba(74,155,63,0.1))' }}>
                <img
                  src={p.img}
                  alt={p.title}
                  onError={e => handleImgError(e, p.tag)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
              <div style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ background: 'rgba(200,232,106,0.15)', color: '#c8e86a', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{p.tag}</span>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{p.date}</span>
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#fff', lineHeight: 1.4, marginBottom: 8 }}>{p.title}</h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{p.excerpt}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
