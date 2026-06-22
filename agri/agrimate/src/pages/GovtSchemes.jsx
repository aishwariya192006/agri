import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Search, CheckCircle, ChevronRight, FileText, IndianRupee, ShieldCheck } from 'lucide-react';

const schemes = [
  { id: 1, title: 'PM Kisan Samman Nidhi', category: 'Income Support', benefit: '₹6,000/year', eligibility: 'All landholding farmers', deadline: 'Ongoing', match: 98, desc: 'Direct income support of ₹6,000 per year in 3 equal installments to all landholding farmer families in India.' },
  { id: 2, title: 'PM Fasal Bima Yojana', category: 'Crop Insurance', benefit: 'Full coverage', eligibility: 'Farmers growing notified crops', deadline: '31 Jul 2026', match: 95, desc: 'Comprehensive crop insurance covering all non-preventable natural risks from pre-sowing to post-harvest.' },
  { id: 3, title: 'Kisan Credit Card', category: 'Credit & Loans', benefit: 'Up to ₹3 Lakh @ 4%', eligibility: 'Farmers, Tenant Farmers, Sharecroppers', deadline: 'Ongoing', match: 90, desc: 'Provides adequate and timely credit for agriculture operations, post-harvest expenses and maintenance.' },
  { id: 4, title: 'Soil Health Card Scheme', category: 'Farm Health', benefit: 'Free soil testing', eligibility: 'All farmers across India', deadline: 'Ongoing', match: 88, desc: 'Free soil health cards providing nutrient status of soil along with recommendations for appropriate dosage of nutrients.' },
  { id: 5, title: 'PM Krishi Sinchai Yojana', category: 'Irrigation', benefit: 'Subsidy on irrigation', eligibility: 'Farmers with water source access', deadline: '15 Mar 2027', match: 83, desc: 'Ensures access to some means of protective irrigation to all agricultural farms to produce "more crop per drop".' },
  { id: 6, title: 'National Food Security Mission', category: 'Production Boost', benefit: 'Up to ₹15,000 assistance', eligibility: 'Wheat/Rice/Pulses farmers', deadline: 'Ongoing', match: 79, desc: 'Aims to increase production of wheat, rice and pulses through area expansion and productivity enhancement.' },
];

const categories = ['All', 'Income Support', 'Crop Insurance', 'Credit & Loans', 'Farm Health', 'Irrigation'];

export default function GovtSchemes() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = schemes.filter(s =>
    (filter === 'All' || s.category === filter) &&
    (s.title.toLowerCase().includes(search.toLowerCase()) || s.desc.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#C4A35A' }}>Government Schemes &amp; Subsidies</div>
        <div style={{ color: '#A8C5A0', fontSize: 14, marginTop: 4 }}>AI-matched benefits based on your farmer profile</div>
      </div>

      {/* AI Match Banner */}
      <div className="card" style={{
        background: 'linear-gradient(120deg, rgba(74,155,63,0.15) 0%, rgba(196,163,90,0.08) 100%)',
        display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
      }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(74,155,63,0.15)', border: '2px solid rgba(74,155,63,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <ShieldCheck size={28} color="#4A9B3F" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#F5ECD7' }}>You are eligible for ₹1.2 Lakhs in benefits</div>
          <div style={{ color: '#A8C5A0', fontSize: 13, marginTop: 4 }}>Based on your profile (12 acres, Punjab, Wheat/Cotton), our AI found 6 relevant schemes. Apply before deadlines.</div>
        </div>
        <button 
          onClick={() => alert('Starting batch application process for all eligible schemes. Please wait...')}
          className="btn-primary" 
          style={{ flexShrink: 0 }}
        >
          Apply for All <ChevronRight size={14} />
        </button>
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6B8A65' }} />
          <input
            className="input-field"
            style={{ paddingLeft: 36, borderRadius: 24 }}
            placeholder="Search schemes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none',
                background: filter === c ? '#C4A35A' : 'rgba(196,163,90,0.1)',
                color: filter === c ? '#0A1508' : '#A8C5A0',
                transition: 'all 0.2s',
              }}
            >{c}</button>
          ))}
        </div>
      </div>

      {/* Scheme Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
        {filtered.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="card card-hover"
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#C4A35A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.category}</span>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: '#F5ECD7', marginTop: 2 }}>{s.title}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(74,155,63,0.12)', border: '1px solid rgba(74,155,63,0.3)', borderRadius: 20, padding: '3px 8px', flexShrink: 0 }}>
                <CheckCircle size={11} color="#4A9B3F" />
                <span style={{ color: '#4A9B3F', fontSize: 11, fontWeight: 700 }}>{s.match}% Match</span>
              </div>
            </div>

            <p style={{ color: '#A8C5A0', fontSize: 13, lineHeight: 1.6, flex: 1, marginBottom: 14 }}>{s.desc}</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, background: 'rgba(13,27,10,0.5)', borderRadius: 12, padding: '12px 14px', border: '1px solid rgba(196,163,90,0.1)', marginBottom: 14 }}>
              <div>
                <div style={{ color: '#6B8A65', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Benefit</div>
                <div style={{ color: '#C4A35A', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <IndianRupee size={12} />{s.benefit}
                </div>
              </div>
              <div>
                <div style={{ color: '#6B8A65', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Deadline</div>
                <div style={{ color: '#F5ECD7', fontWeight: 600, fontSize: 13 }}>{s.deadline}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#A8C5A0', fontSize: 12 }}>Eligibility: {s.eligibility}</span>
              <button 
                onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(s.title + ' official portal apply online')}`, '_blank')}
                className="btn-primary" 
                style={{ padding: '6px 14px', fontSize: 12 }}
              >
                Apply Now <ChevronRight size={12} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
