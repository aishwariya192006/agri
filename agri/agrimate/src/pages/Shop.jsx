import { motion } from 'framer-motion';
import PublicNavbar from '../components/Public/PublicNavbar';
import { ShoppingCart, Star } from 'lucide-react';
import { useLang } from '../i18n/LangContext';

const handleImgError = (e) => {
  e.target.onerror = null;
  e.target.style.display = 'none';
  e.target.parentElement.style.background = 'linear-gradient(135deg, rgba(200,232,106,0.12), rgba(74,155,63,0.12))';
};

export default function Shop() {
  const { t } = useLang();

  const products = [
    {
      nameKey: 'prod_npk_name',
      name: 'Organic NPK Fertilizer (50kg)',
      price: '₹1,250', rating: 4.8, reviews: 234,
      img: 'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?auto=format&fit=crop&w=400&q=80',
    },
    {
      nameKey: 'prod_wheat_name',
      name: 'Drought-Resistant Wheat Seeds',
      price: '₹850', rating: 4.6, reviews: 189,
      img: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80',
    },
  ];

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
            AgriMate <span style={{ color: '#c8e86a' }}>{t('marketplace').replace('AgriMate ', '')}</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)' }}>
            {t('shop_subtitle')}
          </motion.p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
          {products.map((p, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ width: '100%', height: 220, position: 'relative', background: 'linear-gradient(135deg, rgba(200,232,106,0.08), rgba(74,155,63,0.08))' }}>
                <img
                  src={p.img}
                  alt={p.name}
                  onError={handleImgError}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
              <div style={{ padding: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{p.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <Star size={14} color="#c8e86a" fill="#c8e86a" />
                  <span style={{ color: '#c8e86a', fontSize: 13, fontWeight: 600 }}>{p.rating}</span>
                  <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>({p.reviews} {t('reviews')})</span>
                </div>
                <div style={{ color: '#c8e86a', fontSize: 18, fontWeight: 800, marginBottom: 16 }}>{p.price}</div>
                <button onClick={() => alert('Add to cart coming soon!')} style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '12px', borderRadius: 12, background: 'rgba(200,232,106,0.1)', color: '#c8e86a',
                  border: '1px solid rgba(200,232,106,0.3)', cursor: 'pointer', fontWeight: 600, transition: 'background 0.2s'
                }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(200,232,106,0.2)'}
                   onMouseLeave={e => e.currentTarget.style.background = 'rgba(200,232,106,0.1)'}>
                  <ShoppingCart size={16} /> {t('add_to_cart')}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
