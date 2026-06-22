/* ─────────────────────────────────────────────────────────────
   src/components/AIPanel.jsx
   Reusable "Smart AI Assistant" strip under any result.
   Props:
     explainText  – plain text the AI "explains"
     nextSteps    – string[] list of next actions
──────────────────────────────────────────────────────────── */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import VoiceBar from './VoiceBar';
import { useLang } from '../i18n/LangContext';

export default function AIPanel({ explainText = '', nextSteps = [] }) {
  const [open, setOpen] = useState(false);
  const [tab,  setTab]  = useState('explain');
  const { t } = useLang();
  const green  = '#4ADE80';
  const border = 'rgba(74,222,128,0.18)';

  return (
    <div style={{ marginTop: 12 }}>
      {/* Trigger bar */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Explain More */}
        <motion.button
          whileHover={{ scale: 1.04, borderColor: 'rgba(74,222,128,0.5)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { setTab('explain'); setOpen(v => tab === 'explain' ? !v : true); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(74,222,128,0.07)', border: `1px solid ${border}`,
            borderRadius: 20, padding: '6px 14px', fontSize: 12,
            color: green, cursor: 'pointer',
          }}
        >
          <BookOpen size={13}/> {t('explain_more')}
        </motion.button>

        {/* Listen */}
        <VoiceBar getText={() => explainText} compact/>

        {/* What Next */}
        <motion.button
          whileHover={{ scale: 1.04, borderColor: 'rgba(74,222,128,0.5)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { setTab('next'); setOpen(v => tab === 'next' ? !v : true); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(74,222,128,0.07)', border: `1px solid ${border}`,
            borderRadius: 20, padding: '6px 14px', fontSize: 12,
            color: green, cursor: 'pointer',
          }}
        >
          <Lightbulb size={13}/> {t('what_next')}
        </motion.button>

        <motion.button
          onClick={() => setOpen(v => !v)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 0 }}
        >
          {open ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
        </motion.button>
      </div>

      {/* Expandable panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              marginTop: 10,
              background: 'rgba(10,22,10,0.85)',
              border: `1px solid ${border}`,
              borderRadius: 14, padding: '14px 16px',
              backdropFilter: 'blur(10px)',
            }}>
              {tab === 'explain' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <BookOpen size={14} color={green}/>
                    <span style={{ color: green, fontSize: 13, fontWeight: 600 }}>AI Explanation — {t('farmer_mode')}</span>
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 13, lineHeight: 1.75, margin: 0 }}>
                    {explainText}
                  </p>
                </div>
              )}
              {tab === 'next' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <Lightbulb size={14} color={green}/>
                    <span style={{ color: green, fontSize: 13, fontWeight: 600 }}>{t('what_next')}</span>
                  </div>
                  {nextSteps.map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                        background: 'rgba(74,222,128,0.15)', border: `1px solid ${border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 700, color: green,
                      }}>{i + 1}</div>
                      <span style={{ color: 'rgba(255,255,255,0.78)', fontSize: 13, lineHeight: 1.65 }}>{s}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
