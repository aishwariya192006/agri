import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, MessageSquare, ThumbsUp, Share2, Search, PenTool, Plus } from 'lucide-react';

const stats = [
  { label: 'Total Members', value: '52,000' },
  { label: 'Posts Today', value: '340' },
  { label: 'Questions Answered', value: '1,200' },
  { label: 'Experts Online', value: '28' },
];

const posts = [
  { id: 1, author: 'Gurpreet Singh', role: 'Expert Farmer', av: 'GS', avColor: '#C4A35A', location: 'Amritsar, Punjab', time: '2h ago', content: 'Just tried direct seeding method for rice as suggested by AgriMate AI. Saved water and labor costs significantly. Anyone else trying this in Punjab?', tags: ['Rice', 'WaterSaving', 'Punjab'], likes: 24, comments: 8 },
  { id: 2, author: 'Dr. Anita Sharma', role: 'Agronomist', av: 'AS', avColor: '#9B7AAF', location: 'Delhi', time: '5h ago', content: 'Warning for farmers: High risk of Fall Armyworm in maize crops due to recent weather changes. Please inspect your fields and apply recommended biological controls early.', tags: ['Alert', 'Maize', 'PestControl'], likes: 156, comments: 32 },
  { id: 3, author: 'Ramesh Kumar', role: 'Farmer', av: 'RK', avColor: '#4A9B3F', location: 'Ludhiana, Punjab', time: '1d ago', content: 'Can someone suggest a good organic fertilizer for cotton during the flowering stage? Soil analysis shows slightly low potassium levels.', tags: ['Cotton', 'Organic', 'Fertilizer'], likes: 12, comments: 5 },
  { id: 4, author: 'Rajesh Patel', role: 'Farmer', av: 'RP', avColor: '#8B5A2B', location: 'Surat, Gujarat', time: '2d ago', content: 'Wheat prices at Khanna mandi touched ₹2,380/qtl today. If you have stored stock, this might be a good time to sell. AI copilot also suggests same.', tags: ['Wheat', 'MarketUpdate', 'Sell'], likes: 89, comments: 14 },
];

const experts = [
  { name: 'Dr. Anita Sharma', role: 'Agronomist', av: 'AS', color: '#9B7AAF' },
  { name: 'Vikram Singh', role: 'Market Analyst', av: 'VS', color: '#7A9BB5' },
  { name: 'Priya Patel', role: 'Soil Scientist', av: 'PP', color: '#CD853F' },
];

export default function Community() {
  const [liked, setLiked] = useState({});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#C4A35A' }}>Farmer Community</div>
          <div style={{ color: '#A8C5A0', fontSize: 14, marginTop: 4 }}>Connect, share, and learn from farmers and experts</div>
        </div>
        <button className="btn-primary"><PenTool size={14} /> New Post</button>
      </div>

      {/* Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {stats.map(({ label, value }) => (
          <div key={label} className="card" style={{ textAlign: 'center', padding: '16px 12px' }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#C4A35A' }}>{value}</div>
            <div style={{ color: '#A8C5A0', fontSize: 12, marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
        {/* Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#6B8A65' }} />
            <input className="input-field" style={{ paddingLeft: 38, borderRadius: 24 }} placeholder="Search discussions, topics, or experts..." />
          </div>

          {/* Compose */}
          <div className="card" style={{ display: 'flex', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#4A9B3F', border: '2px solid #C4A35A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F5ECD7', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>RK</div>
            <div style={{ flex: 1 }}>
              <textarea placeholder="Share an update, ask a question, or post a photo..." style={{ width: '100%', background: 'rgba(13,27,10,0.5)', border: '1px solid rgba(196,163,90,0.15)', borderRadius: 12, padding: '10px 14px', color: '#F5ECD7', fontSize: 13, resize: 'none', minHeight: 72, outline: 'none' }}
                onFocus={e => e.target.style.borderColor = 'rgba(196,163,90,0.4)'}
                onBlur={e => e.target.style.borderColor = 'rgba(196,163,90,0.15)'}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <button className="btn-primary" style={{ padding: '7px 18px' }}>Post</button>
              </div>
            </div>
          </div>

          {/* Posts */}
          {posts.map(p => (
            <motion.div key={p.id} whileHover={{ scale: 1.01, y: -2 }} className="card card-hover">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: p.avColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: p.id === 1 ? '#0A1508' : '#F5ECD7', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{p.av}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: '#F5ECD7', fontSize: 13, fontWeight: 700 }}>{p.author}</span>
                    {p.role === 'Agronomist' && <span style={{ background: 'rgba(155,122,175,0.2)', color: '#9B7AAF', fontSize: 10, padding: '2px 6px', borderRadius: 6, fontWeight: 700 }}>Expert</span>}
                  </div>
                  <div style={{ color: '#A8C5A0', fontSize: 11 }}>{p.role} · {p.location} · {p.time}</div>
                </div>
              </div>
              <p style={{ color: '#F5ECD7', fontSize: 13, lineHeight: 1.65, marginBottom: 12, opacity: 0.9 }}>{p.content}</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                {p.tags.map(tag => (
                  <span key={tag} style={{ background: 'rgba(196,163,90,0.1)', color: '#C4A35A', border: '1px solid rgba(196,163,90,0.2)', borderRadius: 20, padding: '3px 10px', fontSize: 11 }}>#{tag}</span>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, paddingTop: 10, borderTop: '1px solid rgba(196,163,90,0.1)' }}>
                <button onClick={() => setLiked(l => ({ ...l, [p.id]: !l[p.id] }))} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: liked[p.id] ? '#C4A35A' : '#A8C5A0', fontSize: 13 }}>
                  <ThumbsUp size={14} /> {p.likes + (liked[p.id] ? 1 : 0)}
                </button>
                <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#A8C5A0', fontSize: 13 }}>
                  <MessageSquare size={14} /> {p.comments}
                </button>
                <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#A8C5A0', fontSize: 13, marginLeft: 'auto' }}>
                  <Share2 size={14} /> Share
                </button>
                <button className="badge-green" style={{ cursor: 'pointer', border: 'none' }}>Reply</button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card">
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: '#C4A35A', marginBottom: 12 }}>Top Experts</div>
            {experts.map(e => (
              <div key={e.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: e.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F5ECD7', fontSize: 12, fontWeight: 700 }}>{e.av}</div>
                  <div>
                    <div style={{ color: '#F5ECD7', fontSize: 13, fontWeight: 600 }}>{e.name}</div>
                    <div style={{ color: '#6B8A65', fontSize: 11 }}>{e.role}</div>
                  </div>
                </div>
                <button className="badge-green" style={{ cursor: 'pointer', border: 'none', fontSize: 11 }}>Follow</button>
              </div>
            ))}
          </div>

          <div className="card">
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: '#C4A35A', marginBottom: 12 }}>Popular Topics</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {['Monsoon Prep', 'Organic Farming', 'Wheat Prices', 'Govt Subsidies', 'Pest Control', 'Tractor Tips'].map(t => (
                <span key={t} style={{ background: 'rgba(13,27,10,0.5)', border: '1px solid rgba(196,163,90,0.15)', color: '#A8C5A0', borderRadius: 20, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(196,163,90,0.4)'; e.currentTarget.style.color = '#F5ECD7'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(196,163,90,0.15)'; e.currentTarget.style.color = '#A8C5A0'; }}
                >{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="copilot-glow"
        style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 50,
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, #C4A35A, #8B5A2B)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Plus size={24} color="#0A1508" />
      </motion.button>
    </div>
  );
}
