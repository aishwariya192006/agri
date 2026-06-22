import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Pause, Play, Square } from 'lucide-react';
import { useLang } from '../i18n/LangContext';

export default function VoiceBar({ getText, compact = false }) {
  const { langObj } = useLang();
  const voiceLang = langObj?.voice || 'en-IN';

  const [speaking, setSpeaking] = useState(false);
  const [paused,   setPaused]   = useState(false);

  const speak = useCallback(() => {
    if (!window.speechSynthesis) return;
    if (paused) { window.speechSynthesis.resume(); setPaused(false); return; }
    window.speechSynthesis.cancel();
    const text = typeof getText === 'function' ? getText() : getText;
    if (!text) return;
    const utt  = new SpeechSynthesisUtterance(text);
    utt.lang   = voiceLang;
    utt.rate   = 0.9;
    utt.pitch  = 1.05;
    utt.onstart = () => { setSpeaking(true); setPaused(false); };
    utt.onend   = () => { setSpeaking(false); setPaused(false); };
    utt.onerror = () => { setSpeaking(false); setPaused(false); };
    window.speechSynthesis.speak(utt);
  }, [getText, voiceLang, paused]);

  const pause = () => { window.speechSynthesis.pause(); setPaused(true); };
  const stop  = () => { window.speechSynthesis.cancel(); setSpeaking(false); setPaused(false); };

  const G = '#4ADE80';

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'rgba(10,22,10,0.92)',
        border: `1px solid ${speaking ? 'rgba(74,222,128,0.45)' : 'rgba(74,222,128,0.18)'}`,
        borderRadius: 40, padding: compact ? '4px 10px' : '6px 14px',
        backdropFilter: 'blur(12px)',
        boxShadow: speaking ? '0 0 14px rgba(74,222,128,0.2)' : 'none',
        transition: 'all 0.3s',
      }}
    >
      {/* Waveform */}
      <AnimatePresence>
        {speaking && !paused && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {[0.5,1,1.4,0.9,0.6,1.2,0.8].map((h, i) => (
              <motion.div key={i}
                animate={{ scaleY: [0.3, h+0.4, 0.3] }}
                transition={{ duration: 0.35+i*0.04, repeat: Infinity, delay: i*0.05 }}
                style={{ width: 3, height: 16, background: G, borderRadius: 2, transformOrigin: 'center' }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      <Volume2 size={15} color={speaking ? G : 'rgba(255,255,255,0.35)'}/>

      {/* Play/Resume */}
      <motion.button whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }}
        onClick={speak}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: G, display: 'flex' }}
      >
        {paused ? <Play size={14}/> : speaking ? <Pause size={14} onClick={e => { e.stopPropagation(); pause(); }}/> : <Play size={14}/>}
      </motion.button>

      {/* Pause */}
      {speaking && !paused && (
        <motion.button whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }} onClick={pause}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'rgba(255,255,255,0.45)', display: 'flex' }}
        ><Pause size={13}/></motion.button>
      )}

      {/* Stop */}
      {speaking && (
        <motion.button whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }} onClick={stop}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#F87171', display: 'flex' }}
        ><Square size={12}/></motion.button>
      )}

      {/* Lang label */}
      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginLeft: 2 }}>
        {langObj?.flag}
      </span>
    </motion.div>
  );
}
