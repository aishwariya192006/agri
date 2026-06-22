import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Search, Leaf, X, FileText, ShoppingCart, Wrench, Info, Home } from 'lucide-react';
import { useLang } from '../../i18n/LangContext';

const NAV = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Services', path: '/services' },
  { label: 'Blog', path: '/blog' },
  { label: 'Shop', path: '/shop' }
];

/* ── Searchable content index ── */
const SEARCH_ITEMS = [
  { title: 'Home', desc: 'Landing page – AgriMate AI Intelligence', path: '/', icon: Home, category: 'Pages' },
  { title: 'About Us', desc: 'Our mission, vision, and the story behind AgriMate', path: '/about', icon: Info, category: 'Pages' },
  { title: 'Services', desc: 'AI-powered tools for disease detection, market intelligence & more', path: '/services', icon: Wrench, category: 'Pages' },
  { title: 'Blog', desc: 'Insights, research, and stories from the field', path: '/blog', icon: FileText, category: 'Pages' },
  { title: 'Shop / Marketplace', desc: 'Premium seeds, fertilizers, and IoT devices', path: '/shop', icon: ShoppingCart, category: 'Pages' },
  { title: 'Dashboard', desc: 'Your personal farm intelligence dashboard', path: '/app/dashboard', icon: Home, category: 'App' },
  { title: 'AI Copilot', desc: 'Chat with AgriMate AI for farming advice', path: '/app/copilot', icon: Wrench, category: 'App' },
  { title: 'Disease Detection', desc: 'Instantly diagnose crop diseases using AI', path: '/app/disease', icon: Wrench, category: 'Services' },
  { title: 'Market Intelligence', desc: 'Predict mandi prices and find the optimal time to sell', path: '/app/market', icon: Wrench, category: 'Services' },
  { title: 'Hyperlocal Weather', desc: 'Accurate weather forecasts and smart irrigation scheduling', path: '/app/weather', icon: Wrench, category: 'Services' },
  { title: 'Govt Schemes', desc: 'Match with government subsidies and apply with one click', path: '/app/schemes', icon: FileText, category: 'Services' },
  { title: 'Soil Analysis', desc: 'Analyze your soil health with AI recommendations', path: '/app/soil', icon: Wrench, category: 'Services' },
  { title: 'Seed Recommendation', desc: 'Get the best seed recommendations for your region', path: '/app/seeds', icon: Wrench, category: 'Services' },
  { title: 'Managing Nitrogen Levels in Wheat', desc: 'Agronomy blog post about wheat nitrogen management', path: '/blog', icon: FileText, category: 'Blog Posts' },
  { title: 'Cotton Price Forecast for Winter', desc: 'Market blog post on cotton price predictions', path: '/blog', icon: FileText, category: 'Blog Posts' },
  { title: 'How AI is Changing Pest Control', desc: 'Technology blog post on AI-driven pest management', path: '/blog', icon: FileText, category: 'Blog Posts' },
  { title: 'Organic NPK Fertilizer', desc: '50kg bag of premium organic NPK fertilizer – ₹1,250', path: '/shop', icon: ShoppingCart, category: 'Products' },
  { title: 'Drought-Resistant Wheat Seeds', desc: 'High-yield drought-resistant wheat seeds – ₹850', path: '/shop', icon: ShoppingCart, category: 'Products' },
  { title: 'Smart Soil Moisture Sensor', desc: 'IoT soil moisture sensor for precision farming – ₹3,400', path: '/shop', icon: ShoppingCart, category: 'Products' },
];

export default function PublicNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLang();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  const NAV = [
    { label: 'Home',        path: '/'         },
    { label: 'About',       path: '/about'    },
    { label: t('our_services').split(' ').slice(-1)[0] || 'Services', path: '/services' },
    { label: t('blog_title').split(' ').slice(-1)[0] || 'Blog',       path: '/blog'     },
    { label: 'Shop',        path: '/shop'     },
  ];

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [searchOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') setSearchOpen(false);
    };
    if (searchOpen) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [searchOpen]);

  // Filter results
  const results = query.trim().length > 0
    ? SEARCH_ITEMS.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.desc.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  // Group results by category
  const grouped = results.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const handleSelect = (path) => {
    setSearchOpen(false);
    setQuery('');
    navigate(path);
  };

  return (
    <>
      <nav style={{
        position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '22px 36px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}>
        {/* Logo */}
        <div
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}
        >
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'linear-gradient(135deg,#7eff6a,#4a9b3f)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Leaf size={16} color="#0d1b0a" />
          </div>
          <span style={{ fontSize: 19, fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>
            AgriMate
          </span>
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', gap: 32 }}>
          {NAV.map(({ label, path }) => {
            const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
            return (
              <button key={label} onClick={() => navigate(path)} style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                fontSize: 14, fontWeight: isActive ? 700 : 500,
                color: isActive ? '#fff' : 'rgba(255,255,255,0.75)',
                textDecoration: 'none',
                transition: 'color 0.18s',
              }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = isActive ? '#fff' : 'rgba(255,255,255,0.75)'}
              >{label}</button>
            );
          })}
        </div>

        {/* Right: search + CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => setSearchOpen(true)}
            style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#fff', transition: 'background 0.18s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
          >
            <Search size={16} />
          </button>

          {/* Sign In */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/auth?mode=signin')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '9px 18px', borderRadius: 30,
              background: 'transparent',
              border: '1.5px solid rgba(255,255,255,0.45)',
              color: '#fff', fontWeight: 600, fontSize: 13,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
          Sign In
          </motion.button>

          {/* Sign Up */}
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(126,255,106,0.5)' }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/auth?mode=signup')}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '9px 20px', borderRadius: 30,
              background: '#7eff6a',
              border: 'none',
              color: '#0d1b0a', fontWeight: 800, fontSize: 13,
              cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: '0 4px 14px rgba(126,255,106,0.35)',
            }}
          >
            Sign Up <ArrowUpRight size={14} />
          </motion.button>
        </div>
      </nav>

      {/* ══════════════════════════════════════════
          SEARCH OVERLAY
      ══════════════════════════════════════════ */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSearchOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
              paddingTop: 100,
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%', maxWidth: 580,
                background: 'linear-gradient(145deg, #1e2e10, #253615)',
                border: '1px solid rgba(200,232,106,0.2)',
                borderRadius: 20,
                boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 40px rgba(126,255,106,0.08)',
                overflow: 'hidden',
              }}
            >
              {/* Search input row */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '18px 24px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
              }}>
                <Search size={20} color="rgba(200,232,106,0.7)" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search pages, services, blog posts, products..."
                  style={{
                    flex: 1, background: 'transparent', border: 'none', outline: 'none',
                    color: '#fff', fontSize: 16, fontWeight: 500,
                    fontFamily: "'Inter', system-ui, sans-serif",
                  }}
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: 'rgba(255,255,255,0.5)',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Results area */}
              <div style={{
                maxHeight: 400, overflowY: 'auto',
                padding: query.trim() ? '8px 0' : '24px',
              }}>
                {query.trim().length === 0 && (
                  <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
                    <Search size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
                    <p style={{ fontWeight: 500 }}>Start typing to search...</p>
                    <p style={{ fontSize: 12, marginTop: 6 }}>Search pages, services, blog posts, and products</p>
                  </div>
                )}

                {query.trim().length > 0 && results.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 14, padding: '20px 0' }}>
                    <p style={{ fontWeight: 500, marginBottom: 6 }}>No results found</p>
                    <p style={{ fontSize: 12 }}>Try searching for "blog", "services", "seeds", or "weather"</p>
                  </div>
                )}

                {Object.entries(grouped).map(([category, items]) => (
                  <div key={category}>
                    <div style={{
                      padding: '10px 24px 6px',
                      fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                      color: 'rgba(200,232,106,0.5)', letterSpacing: '0.08em',
                    }}>
                      {category}
                    </div>
                    {items.map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={`${item.title}-${i}`}
                          onClick={() => handleSelect(item.path)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 14,
                            width: '100%', padding: '12px 24px',
                            background: 'transparent', border: 'none',
                            cursor: 'pointer', textAlign: 'left',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(200,232,106,0.08)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: 'rgba(200,232,106,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            <Icon size={16} color="#c8e86a" />
                          </div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{
                              fontSize: 14, fontWeight: 600, color: '#fff',
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            }}>
                              {item.title}
                            </div>
                            <div style={{
                              fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2,
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            }}>
                              {item.desc}
                            </div>
                          </div>
                          <div style={{
                            fontSize: 11, color: 'rgba(255,255,255,0.25)',
                            fontWeight: 500, flexShrink: 0,
                          }}>
                            {item.path}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Footer hint */}
              <div style={{
                padding: '12px 24px',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                fontSize: 11, color: 'rgba(255,255,255,0.25)',
              }}>
                <span>↑↓ Navigate &nbsp; ↵ Select &nbsp; Esc Close</span>
                <span>{results.length} result{results.length !== 1 ? 's' : ''}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
