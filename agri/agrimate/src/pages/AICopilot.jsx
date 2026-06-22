import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Bot, Send, Mic, Trash2, Sparkles, AlertCircle, RefreshCw, ChevronRight, ThumbsUp, ThumbsDown, Copy, Volume2 } from 'lucide-react';
import { aiApi } from '../api';
import { useLang } from '../i18n/LangContext';

/* ─── DATA ─────────────────────────────────────────────────────── */
const initialMessages = [
  { id: 1, role: 'user', text: 'What is the best crop for Punjab in October?' },
  {
    id: 2, role: 'ai',
    text: 'For Punjab in October (early Rabi season), I recommend:\n\n🌾 **Wheat** — HD-2967 or PBW-550 are ideal varieties. Sow between Oct 15–Nov 5 for best yield (22–28 q/acre).\n\n🌱 **Mustard** — Pusa Bold or RH-30 for intercropping. Yield 12–15 q/acre, profit ₹22,000+/acre.\n\n💡 **Tip:** Apply DAP @ 2 bags/acre as basal dose. Current wheat MSP is ₹2,275/qtl.',
    chips: ['Best wheat variety?', 'When to sow mustard?', 'DAP dosage guide'],
  },
  { id: 3, role: 'user', text: 'How much water does wheat need?' },
  {
    id: 4, role: 'ai',
    text: '💧 **Wheat Irrigation Schedule for Punjab:**\n\nWheat needs 4–6 irrigations totalling 40–50 cm water.\n\n• **CRI Stage** (21 days): 1st irrigation — critical\n• **Tillering** (40–45 days): 2nd irrigation\n• **Jointing** (65 days): 3rd irrigation\n• **Flowering** (90 days): 4th — most critical\n• **Milky stage** (105 days): 5th irrigation\n\n📊 Your current soil moisture is 68% — no irrigation needed for 3 more days.',
    chips: ['Check soil moisture', 'Set irrigation reminder', 'Drip vs flood irrigation'],
  },
];

const FOLLOW_UP = ['Best wheat variety?', 'Soil health tips', 'Market prices today', 'Pest forecast'];

const PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  id: i, icon: ['🌾','🌱','💧','☀️','🍃','🌿','✨'][i % 7],
  x: Math.random() * 100, y: Math.random() * 100,
  size: 9 + Math.random() * 10, duration: 7 + Math.random() * 7, delay: Math.random() * 5,
}));

const fmt = t => t
  .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#4ADE80">$1</strong>')
  .replace(/\n/g, '<br/>');

/* ─── FLOATING BG ──────────────────────────────────────────────── */
function FloatingParticles() {
  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none', zIndex:0 }}>
      {PARTICLES.map(p => (
        <motion.div key={p.id}
          style={{ position:'absolute', left:`${p.x}%`, top:`${p.y}%`, fontSize:p.size }}
          animate={{ y:[-12,12,-12], x:[-5,5,-5], opacity:[0.04,0.13,0.04] }}
          transition={{ duration:p.duration, repeat:Infinity, delay:p.delay, ease:'easeInOut' }}
        >{p.icon}</motion.div>
      ))}
    </div>
  );
}

/* ─── TYPING EFFECT ────────────────────────────────────────────── */
function useTypingEffect(text, enabled) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!enabled) { setDisplayed(text); setDone(true); return; }
    setDisplayed(''); setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i += 4; setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(id); setDone(true); }
    }, 14);
    return () => clearInterval(id);
  }, [text, enabled]);
  return { displayed, done };
}

/* ─── AI MESSAGE ───────────────────────────────────────────────── */
function AIMessage({ msg, isLatest, onChip }) {
  const { displayed, done } = useTypingEffect(msg.text, isLatest);
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10, maxWidth:'82%' }}>
      <div style={{
        background:'rgba(15,30,15,0.85)', border:'1px solid rgba(74,222,128,0.15)',
        borderRadius:16, padding:'16px 18px', fontSize:14, lineHeight:1.7, color:'#e8f5e8',
        backdropFilter:'blur(12px)',
      }} dangerouslySetInnerHTML={{ __html: fmt(displayed) }}/>
      {!done && (
        <motion.span animate={{ opacity:[1,0] }} transition={{ duration:0.5, repeat:Infinity }}
          style={{ display:'inline-block', width:2, height:14, background:'#4ADE80', borderRadius:1, marginLeft:2 }}/>
      )}
      <AnimatePresence>
        {done && (
          <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.3 }}>
            {/* Action icons */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {(msg.chips || FOLLOW_UP.slice(0,3)).map((chip, i) => (
                  <motion.button key={chip}
                    initial={{ opacity:0, scale:0.85, y:5 }}
                    animate={{ opacity:1, scale:1, y:0 }}
                    transition={{ delay:i*0.07 }}
                    whileHover={{ scale:1.05, borderColor:'rgba(74,222,128,0.5)' }}
                    whileTap={{ scale:0.93 }}
                    onClick={() => onChip(chip)}
                    style={{
                      display:'flex', alignItems:'center', gap:5,
                      background:'rgba(74,222,128,0.06)', border:'1px solid rgba(74,222,128,0.2)',
                      borderRadius:20, padding:'5px 12px', fontSize:12, color:'#a0d8a0', cursor:'pointer',
                    }}
                  ><ChevronRight size={10}/>{chip}</motion.button>
                ))}
              </div>
              <div style={{ display:'flex', gap:12 }}>
                {[ThumbsUp, ThumbsDown, Copy, Volume2].map((Icon, i) => (
                  <motion.button key={i} whileHover={{ scale:1.2, color:'#4ADE80' }} whileTap={{ scale:0.9 }}
                    style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.25)', padding:0 }}
                  ><Icon size={15}/></motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── THE ROBOT ────────────────────────────────────────────────── */
function PeekBot({ state }) {
  const eyeCtrl  = useAnimation();
  const headCtrl = useAnimation();

  /* blink */
  useEffect(() => {
    const t = setInterval(() => {
      eyeCtrl.start({ scaleY:[1, 0.05, 1], transition:{ duration:0.12 } });
    }, 3200);
    return () => clearInterval(t);
  }, [eyeCtrl]);

  /* look around */
  useEffect(() => {
    const t = setInterval(() => {
      const dx = (Math.random()-0.5) * 10;
      headCtrl.start({ x:dx, transition:{ duration:0.45, ease:'easeInOut' } });
      setTimeout(() => headCtrl.start({ x:0, transition:{ duration:0.45 } }), 950);
    }, 3800);
    return () => clearInterval(t);
  }, [headCtrl]);

  const isThinking  = state === 'thinking';
  const isListening = state === 'listening';
  const isSpeaking  = state === 'speaking';
  const isError     = state === 'error';
  const isFocused   = state === 'focused';

  /* eye color */
  const eyeColor = isError ? '#F87171' : isListening ? '#F87171' : isThinking ? '#60A5FA' : '#00FFB3';
  const eyeGlow  = isError ? 'rgba(248,113,113,0.8)' : isListening ? 'rgba(248,113,113,0.7)' : isThinking ? 'rgba(96,165,250,0.8)' : 'rgba(0,255,179,0.9)';

  /* bob */
  const bobY = isThinking ? [0,-8,0] : isFocused ? [0,-10,0] : [0,-5,0];
  const bobD = isThinking ? 0.75 : 2.8;

  /* speech */
  const speech = {
    focused:   'How can I help you today? 🌾',
    thinking:  'Analyzing your request...',
    speaking:  "I've got an answer for you! ✅",
    listening: "I'm listening...",
    error:     'Something went wrong 😕',
  }[state];

  return (
    <div style={{
      position:'absolute', bottom:'100%', left:'50%',
      transform:'translateX(-50%)',
      marginBottom: -28,   /* hands overlap panel top edge */
      zIndex:30, pointerEvents:'none',
      display:'flex', flexDirection:'column', alignItems:'center',
    }}>

      {/* ── Speech bubbles (left + right like the image) ── */}
      <div style={{ display:'flex', alignItems:'flex-end', gap:0, marginBottom:4, width:480, justifyContent:'space-between' }}>

        {/* Left bubble */}
        <AnimatePresence>
          {(isListening || isFocused || isThinking) && (
            <motion.div
              key="left"
              initial={{ opacity:0, x:-20, scale:0.88 }}
              animate={{ opacity:1, x:0, scale:1 }}
              exit={{ opacity:0, x:-16, scale:0.9 }}
              transition={{ duration:0.28 }}
              style={{
                background:'rgba(12,25,14,0.96)',
                border:'1px solid rgba(74,222,128,0.35)',
                borderRadius:'16px 16px 16px 4px',
                padding:'10px 16px', maxWidth:190,
                fontSize:13, color:'#c8f0c8',
                boxShadow:'0 4px 20px rgba(0,0,0,0.5), 0 0 12px rgba(74,222,128,0.15)',
              }}
            >
              {isListening ? "I'm listening..." : isFocused ? 'How can I help you today? 🌾' : 'Analyzing your request...'}
              {isListening && (
                <div style={{ display:'flex', gap:5, marginTop:8 }}>
                  {[0,1,2].map(i => (
                    <motion.div key={i}
                      animate={{ scale:[0.6,1.3,0.6], opacity:[0.4,1,0.4] }}
                      transition={{ duration:0.7, repeat:Infinity, delay:i*0.2 }}
                      style={{ width:8, height:8, borderRadius:'50%', background:'#4ADE80' }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right bubble */}
        <AnimatePresence>
          {(isSpeaking || (!speech && !isListening && !isFocused && !isThinking)) && (
            <motion.div
              key="right"
              initial={{ opacity:0, x:20, scale:0.88 }}
              animate={{ opacity:1, x:0, scale:1 }}
              exit={{ opacity:0, x:16, scale:0.9 }}
              transition={{ duration:0.28 }}
              style={{
                background:'rgba(12,25,14,0.96)',
                border:'1px solid rgba(74,222,128,0.35)',
                borderRadius:'16px 16px 4px 16px',
                padding:'10px 16px', maxWidth:220,
                fontSize:13, color:'#c8f0c8',
                boxShadow:'0 4px 20px rgba(0,0,0,0.5), 0 0 12px rgba(74,222,128,0.15)',
              }}
            >
              {isSpeaking ? "I've got an answer for you! ✅" : 'Ask me anything about farming... 🌱'}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Robot ── */}
      <motion.div
        animate={{ y: bobY }}
        transition={{ duration:bobD, repeat:Infinity, ease:'easeInOut' }}
        style={{ position:'relative', width:220 }}
      >
        {/* Outer glow */}
        <motion.div
          animate={{ opacity:[0.25,0.55,0.25], scale:[0.9,1.05,0.9] }}
          transition={{ duration:2.4, repeat:Infinity, ease:'easeInOut' }}
          style={{
            position:'absolute', inset:-24, borderRadius:'50%',
            background:`radial-gradient(circle, ${eyeGlow.replace('0.9','0.18').replace('0.8','0.18')}, transparent 65%)`,
            filter:'blur(20px)', pointerEvents:'none',
          }}
        />

        <svg width="220" height="130" viewBox="0 0 220 130" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* White/grey dome gradient */}
            <radialGradient id="rb-dome" cx="40%" cy="25%" r="65%">
              <stop offset="0%" stopColor="#e8e8e8"/>
              <stop offset="40%" stopColor="#c0c0c0"/>
              <stop offset="100%" stopColor="#888"/>
            </radialGradient>
            {/* Black visor */}
            <radialGradient id="rb-visor" cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#1a1a2e"/>
              <stop offset="100%" stopColor="#050508"/>
            </radialGradient>
            {/* Hand gradient */}
            <radialGradient id="rb-hand" cx="40%" cy="30%" r="58%">
              <stop offset="0%" stopColor="#d8d8d8"/>
              <stop offset="100%" stopColor="#909090"/>
            </radialGradient>
            {/* Eye glow filter */}
            <filter id="rb-eyeglow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="3" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="rb-softglow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            {/* Dome shadow */}
            <filter id="rb-shadow">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="rgba(0,0,0,0.6)" floodOpacity="1"/>
            </filter>
          </defs>

          {/* ── LEFT HAND (4 round fingers gripping edge) ── */}
          <motion.g
            animate={{ rotate: isThinking ? [-10,6,-10] : [-5,5,-5] }}
            transition={{ duration: isThinking ? 0.65 : 2.5, repeat:Infinity, ease:'easeInOut' }}
            style={{ transformOrigin:'44px 112px' }}
          >
            {/* Palm */}
            <ellipse cx="44" cy="106" rx="22" ry="18" fill="url(#rb-hand)" filter="url(#rb-shadow)"/>
            {/* Fingers */}
            {[28, 37, 46, 55].map((cx, i) => (
              <motion.ellipse key={i} cx={cx} cy="118" rx="7" ry="10"
                fill="url(#rb-hand)" filter="url(#rb-shadow)"
                animate={{ ry: isThinking ? [10,8,10] : [10,9,10] }}
                transition={{ duration:0.8, repeat:Infinity, delay:i*0.1 }}
              />
            ))}
            {/* Knuckle shine */}
            {[28, 37, 46, 55].map((cx, i) => (
              <ellipse key={i} cx={cx-1} cy="115" rx="2.5" ry="1.5" fill="white" fillOpacity="0.4"/>
            ))}
          </motion.g>

          {/* ── RIGHT HAND ── */}
          <motion.g
            animate={{ rotate: isThinking ? [10,-6,10] : [5,-5,5] }}
            transition={{ duration: isThinking ? 0.65 : 2.5, repeat:Infinity, ease:'easeInOut', delay:0.2 }}
            style={{ transformOrigin:'176px 112px' }}
          >
            <ellipse cx="176" cy="106" rx="22" ry="18" fill="url(#rb-hand)" filter="url(#rb-shadow)"/>
            {[161, 170, 179, 188].map((cx, i) => (
              <motion.ellipse key={i} cx={cx} cy="118" rx="7" ry="10"
                fill="url(#rb-hand)" filter="url(#rb-shadow)"
                animate={{ ry: isThinking ? [10,8,10] : [10,9,10] }}
                transition={{ duration:0.8, repeat:Infinity, delay:i*0.1+0.1 }}
              />
            ))}
            {[161, 170, 179, 188].map((cx, i) => (
              <ellipse key={i} cx={cx-1} cy="115" rx="2.5" ry="1.5" fill="white" fillOpacity="0.4"/>
            ))}
          </motion.g>

          {/* ── ANTENNA stem ── */}
          <rect x="108" y="2" width="4" height="18" rx="2" fill="#c0c0c0"/>
          {/* Antenna ball */}
          <motion.circle cx="110" cy="2" r="6" fill={eyeColor} filter="url(#rb-eyeglow)"
            animate={{ r:[5,7.5,5], opacity:[0.8,1,0.8] }}
            transition={{ duration: isThinking ? 0.4 : 1.1, repeat:Infinity }}
          />
          {/* Antenna ring pulse */}
          <motion.circle cx="110" cy="2" r="10" stroke={eyeColor} strokeWidth="1" fill="none"
            animate={{ r:[10,16,10], opacity:[0.5,0,0.5] }}
            transition={{ duration:1.4, repeat:Infinity, ease:'easeOut' }}
          />

          {/* ── DOME (white helmet) ── */}
          <motion.g animate={headCtrl}>
            {/* Main dome shape - semicircle */}
            <path d="M 20 110 Q 20 18 110 18 Q 200 18 200 110 Z"
              fill="url(#rb-dome)" filter="url(#rb-shadow)"/>
            {/* Dome top shine */}
            <ellipse cx="85" cy="38" rx="28" ry="12" fill="white" fillOpacity="0.25" transform="rotate(-20,85,38)"/>
            <ellipse cx="78" cy="34" rx="14" ry="6" fill="white" fillOpacity="0.18" transform="rotate(-20,78,34)"/>

            {/* ── VISOR (black curved panel) ── */}
            <path d="M 42 88 Q 42 42 110 42 Q 178 42 178 88 Q 178 108 110 108 Q 42 108 42 88 Z"
              fill="url(#rb-visor)"/>
            {/* Visor gloss reflection */}
            <path d="M 52 60 Q 80 52 120 56 Q 100 50 72 54 Z" fill="white" fillOpacity="0.08"/>
            {/* Visor border */}
            <path d="M 42 88 Q 42 42 110 42 Q 178 42 178 88 Q 178 108 110 108 Q 42 108 42 88 Z"
              fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5"/>

            {/* ── EYES ── */}
            <motion.g animate={eyeCtrl}>
              {/* Left eye — outer ring */}
              <motion.circle cx="78" cy="78" r="20"
                stroke={eyeColor} strokeWidth="2" fill="rgba(0,0,0,0.6)"
                animate={{ r:[20,22,20], opacity:[0.6,1,0.6] }}
                transition={{ duration:2, repeat:Infinity, ease:'easeInOut' }}
              />
              {/* Left eye — inner */}
              <circle cx="78" cy="78" r="13" fill="rgba(0,0,0,0.9)"/>
              {/* Left iris glow */}
              <motion.circle cx="78" cy="78" r="9" fill={eyeColor} filter="url(#rb-eyeglow)"
                animate={
                  isThinking ? { r:[9,5,9], opacity:[1,0.6,1] } :
                  isListening ? { r:[9,11,9] } :
                  { opacity:[0.85,1,0.85] }
                }
                transition={{ duration: isThinking ? 0.55 : 1.8, repeat:Infinity }}
              />
              {/* Left pupil */}
              <circle cx="78" cy="78" r="4" fill="rgba(0,0,0,0.9)"/>
              {/* Left specular */}
              <circle cx="82" cy="74" r="2.5" fill="white" fillOpacity="0.8"/>
              <circle cx="74" cy="82" r="1.2" fill="white" fillOpacity="0.3"/>

              {/* Right eye — outer ring */}
              <motion.circle cx="142" cy="78" r="20"
                stroke={eyeColor} strokeWidth="2" fill="rgba(0,0,0,0.6)"
                animate={{ r:[20,22,20], opacity:[0.6,1,0.6] }}
                transition={{ duration:2, repeat:Infinity, ease:'easeInOut', delay:0.3 }}
              />
              <circle cx="142" cy="78" r="13" fill="rgba(0,0,0,0.9)"/>
              <motion.circle cx="142" cy="78" r="9" fill={eyeColor} filter="url(#rb-eyeglow)"
                animate={
                  isThinking ? { r:[9,5,9], opacity:[1,0.6,1] } :
                  isListening ? { r:[9,11,9] } :
                  { opacity:[0.85,1,0.85] }
                }
                transition={{ duration: isThinking ? 0.55 : 1.8, repeat:Infinity, delay:0.2 }}
              />
              <circle cx="142" cy="78" r="4" fill="rgba(0,0,0,0.9)"/>
              <circle cx="146" cy="74" r="2.5" fill="white" fillOpacity="0.8"/>
              <circle cx="138" cy="82" r="1.2" fill="white" fillOpacity="0.3"/>

              {/* Thinking: rotating arc around eyes */}
              {isThinking && (
                <>
                  <motion.circle cx="78" cy="78" r="24"
                    stroke={eyeColor} strokeWidth="1.5" fill="none"
                    strokeDasharray="12 8"
                    animate={{ rotate:[0,360] }}
                    transition={{ duration:1.2, repeat:Infinity, ease:'linear' }}
                    style={{ transformOrigin:'78px 78px' }}
                  />
                  <motion.circle cx="142" cy="78" r="24"
                    stroke={eyeColor} strokeWidth="1.5" fill="none"
                    strokeDasharray="12 8"
                    animate={{ rotate:[360,0] }}
                    transition={{ duration:1.2, repeat:Infinity, ease:'linear' }}
                    style={{ transformOrigin:'142px 78px' }}
                  />
                </>
              )}
            </motion.g>

            {/* Dome bottom edge chrome strip */}
            <rect x="20" y="107" width="180" height="5" rx="2.5" fill="rgba(255,255,255,0.15)"/>
          </motion.g>
        </svg>
      </motion.div>
    </div>
  );
}

/* ─── THINKING BUBBLE ──────────────────────────────────────────── */
function ThinkingBubble() {
  return (
    <motion.div
      initial={{ opacity:0, y:10, scale:0.95 }}
      animate={{ opacity:1, y:0, scale:1 }}
      exit={{ opacity:0, scale:0.92 }}
      style={{ display:'flex', gap:12, alignItems:'flex-start' }}
    >
      <div style={{ position:'relative', width:36, height:36, flexShrink:0 }}>
        <motion.div animate={{ scale:[1,1.7], opacity:[0.4,0] }}
          transition={{ duration:1.8, repeat:Infinity, ease:'easeOut' }}
          style={{ position:'absolute', inset:0, borderRadius:'50%', border:'1px solid rgba(96,165,250,0.5)' }}/>
        <div style={{
          width:36, height:36, borderRadius:'50%',
          background:'radial-gradient(circle at 35% 35%, #5DC54F, #2D6A1F 60%, #0D1B0A)',
          border:'1.5px solid rgba(96,165,250,0.6)',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}><Bot size={16} color="#F5ECD7"/></div>
      </div>
      <div style={{
        background:'rgba(15,30,15,0.9)', border:'1px solid rgba(74,222,128,0.15)',
        borderRadius:16, padding:'12px 18px', backdropFilter:'blur(12px)',
      }}>
        <div style={{ display:'flex', gap:6, alignItems:'center', marginBottom:8 }}>
          {[0,1,2].map(i => (
            <span key={i} className="typing-dot"
              style={{ width:7, height:7, borderRadius:'50%', background:'#60A5FA', display:'inline-block' }}/>
          ))}
          <span style={{ fontSize:11, color:'#60A5FA', marginLeft:4 }}>Analyzing…</span>
        </div>
        <div style={{ display:'flex', gap:3, alignItems:'center' }}>
          {Array.from({length:14}).map((_,i) => (
            <motion.div key={i}
              animate={{ scaleY:[0.3, 1+(i%3)*0.4, 0.3] }}
              transition={{ duration:0.55, repeat:Infinity, delay:i*0.045 }}
              style={{ width:3, height:14, background:'rgba(96,165,250,0.55)', borderRadius:2, transformOrigin:'center' }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── SUCCESS FLASH ────────────────────────────────────────────── */
function SuccessFlash({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity:0, scale:0.4 }}
          animate={{ opacity:[0,1,1,0], scale:[0.4,1.15,1,1.3] }}
          transition={{ duration:1.1, times:[0,0.3,0.7,1] }}
          style={{
            position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
            zIndex:999, pointerEvents:'none',
            width:80, height:80, borderRadius:'50%',
            background:'radial-gradient(circle, rgba(74,222,128,0.3), transparent 70%)',
            border:'2px solid rgba(74,222,128,0.7)',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:32,
          }}
        >✅</motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── VOICE BARS ───────────────────────────────────────────────── */
function VoiceVisualizer() {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:2, padding:'0 2px' }}>
      {[0.5,1,1.4,1,0.6,1.2,0.8].map((h,i) => (
        <motion.div key={i}
          animate={{ scaleY:[0.3, h+0.4, 0.3] }}
          transition={{ duration:0.32+i*0.04, repeat:Infinity, delay:i*0.05 }}
          style={{ width:3, height:18, background:'#F87171', borderRadius:2, transformOrigin:'center' }}
        />
      ))}
    </div>
  );
}

/* ─── MAIN ─────────────────────────────────────────────────────── */
export default function AICopilot() {
  const [messages, setMessages]     = useState(initialMessages);
  const [input, setInput]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [listening, setListening]   = useState(false);
  const [focused, setFocused]       = useState(false);
  const [robotState, setRobotState] = useState('idle');
  const [latestAIId, setLatestAIId] = useState(null);
  const [successFlash, setSuccess]  = useState(false);
  const [error, setError]           = useState(null);
  const { lang } = useLang();
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages, loading]);

  useEffect(() => {
    if (error)          setRobotState('error');
    else if (listening) setRobotState('listening');
    else if (loading)   setRobotState('thinking');
    else if (focused)   setRobotState('focused');
    else                setRobotState('idle');
  }, [error, listening, loading, focused]);

  const send = async (txt) => {
    const text = txt || input.trim();
    if (!text) return;
    setInput(''); setError(null);
    setMessages(m => [...m, { id:Date.now(), role:'user', text }]);
    setLoading(true);
    try {
      const { text: reply, chips } = await aiApi.chat(text, lang);
      const aiId = Date.now()+1;
      setMessages(m => [...m, {
        id:aiId, role:'ai',
        text: reply,
        chips: chips || ['Tell me more','Set a reminder','Market outlook'],
      }]);
      setLatestAIId(aiId);
      setRobotState('speaking');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 1400);
    } catch {
      setError('Connection lost. Please try again.');
      setMessages(m => [...m, { id:Date.now()+2, role:'error', text:'Connection lost. Please try again.' }]);
    } finally { setLoading(false); }
  };

  return (
    <motion.div
      initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.4 }}
      style={{
        display:'flex', flexDirection:'column',
        height:'calc(100vh - 112px)',
        position:'relative', borderRadius:16,
        background:'rgba(8,16,8,0.6)',
      }}
    >
      <FloatingParticles/>
      <SuccessFlash show={successFlash}/>

      {/* ── HEADER ── */}
      <motion.div
        initial={{ y:-24, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ duration:0.4 }}
        style={{
          display:'flex', alignItems:'center', gap:14,
          padding:'14px 20px',
          borderBottom:'1px solid rgba(74,222,128,0.1)',
          background:'rgba(10,20,10,0.85)', backdropFilter:'blur(16px)',
          borderRadius:'16px 16px 0 0', flexShrink:0, position:'relative', zIndex:2,
        }}
      >
        <div style={{ position:'relative', width:42, height:42, flexShrink:0 }}>
          {[1,2].map(i => (
            <motion.div key={i}
              animate={{ scale:[1,1.9], opacity:[0.5,0] }}
              transition={{ duration:2, repeat:Infinity, delay:i*0.7, ease:'easeOut' }}
              style={{ position:'absolute', inset:0, borderRadius:'50%', border:`1px solid rgba(74,222,128,0.5)` }}
            />
          ))}
          <div style={{
            width:42, height:42, borderRadius:'50%',
            background:'radial-gradient(circle at 35% 35%, #4ADE80, #166534 55%, #052e16)',
            border:'2px solid rgba(74,222,128,0.5)',
            boxShadow:'0 0 16px rgba(74,222,128,0.4)',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}><Bot size={18} color="#F5ECD7"/></div>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontFamily:"'Playfair Display', serif", fontSize:18, fontWeight:700, color:'#4ADE80' }}>
              AI Copilot
            </span>
            <motion.div animate={{ rotate:[0,20,-20,0], scale:[1,1.2,1] }} transition={{ duration:3, repeat:Infinity }}>
              <Sparkles size={14} color="#4ADE80"/>
            </motion.div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:2 }}>
            <span style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>Powered by Gemini AI</span>
            <span style={{ width:5, height:5, borderRadius:'50%', background:'#4ADE80', display:'inline-block' }}/>
            <motion.span
              animate={{ opacity:[0.7,1,0.7] }} transition={{ duration:1.5, repeat:Infinity }}
              style={{ fontSize:12, color:'#4ADE80' }}
            >Online</motion.span>
          </div>
        </div>
        <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
          onClick={() => { setMessages(initialMessages); setError(null); setLatestAIId(null); }}
          style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.3)', padding:8, borderRadius:8 }}
        ><Trash2 size={16}/></motion.button>
      </motion.div>

      {/* ── MESSAGES ── */}
      <div style={{
        flex:1, overflowY:'auto', overflowX:'hidden', padding:'24px 20px',
        display:'flex', flexDirection:'column', gap:20,
        position:'relative', zIndex:1,
      }}>
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => {
            if (msg.role === 'error') return (
              <motion.div key={msg.id}
                initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                style={{ display:'flex', gap:10, alignItems:'center' }}
              >
                <motion.div animate={{ rotate:[0,-8,8,0] }} transition={{ duration:0.4, repeat:3 }}>
                  <AlertCircle size={20} color="#F87171"/>
                </motion.div>
                <div style={{
                  background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.3)',
                  borderRadius:12, padding:'8px 14px', fontSize:13, color:'#F87171',
                  display:'flex', alignItems:'center', gap:10,
                }}>
                  {msg.text}
                  <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
                    onClick={() => { setError(null); setMessages(m => m.filter(x => x.role!=='error')); }}
                    style={{ background:'none', border:'none', cursor:'pointer', color:'#F87171', padding:0 }}
                  ><RefreshCw size={13}/></motion.button>
                </div>
              </motion.div>
            );
            return (
              <motion.div key={msg.id}
                initial={{ opacity:0, y:16, scale:0.97 }}
                animate={{ opacity:1, y:0, scale:1 }}
                transition={{ duration:0.3, delay: idx<4 ? idx*0.07 : 0, ease:'easeOut' }}
                style={{ display:'flex', gap:12, flexDirection: msg.role==='user' ? 'row-reverse' : 'row' }}
              >
                {msg.role === 'ai' && (
                  <div style={{ position:'relative', width:36, height:36, flexShrink:0, marginTop:2 }}>
                    <motion.div animate={{ scale:[1,1.7], opacity:[0.35,0] }}
                      transition={{ duration:2, repeat:Infinity, ease:'easeOut' }}
                      style={{ position:'absolute', inset:0, borderRadius:'50%', border:'1px solid rgba(74,222,128,0.4)' }}/>
                    <div style={{
                      width:36, height:36, borderRadius:'50%',
                      background:'radial-gradient(circle at 35% 35%, #4ADE80, #166534 60%, #052e16)',
                      border:'2px solid rgba(74,222,128,0.4)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      boxShadow:'0 0 12px rgba(74,222,128,0.3)',
                    }}><Bot size={15} color="#F5ECD7"/></div>
                  </div>
                )}

                {msg.role === 'ai'
                  ? <AIMessage msg={msg} isLatest={msg.id===latestAIId} onChip={send}/>
                  : (
                    <div>
                      <motion.div whileHover={{ scale:1.01 }}
                        style={{
                          background:'rgba(15,30,15,0.7)', border:'1px solid rgba(74,222,128,0.15)',
                          borderRadius:'16px 16px 4px 16px', padding:'12px 16px',
                          fontSize:14, color:'#e8f5e8', maxWidth:480, lineHeight:1.6,
                          backdropFilter:'blur(10px)',
                        }}
                        dangerouslySetInnerHTML={{ __html: fmt(msg.text) }}
                      />
                      <div style={{ textAlign:'right', marginTop:4, fontSize:11, color:'rgba(255,255,255,0.25)' }}>
                        {new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })} ✓
                      </div>
                    </div>
                  )}

                {msg.role === 'user' && (
                  <motion.div whileHover={{ scale:1.08 }}
                    style={{
                      width:36, height:36, borderRadius:'50%', flexShrink:0, alignSelf:'flex-start',
                      background:'rgba(15,30,15,0.8)', border:'2px solid rgba(74,222,128,0.3)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      color:'#4ADE80', fontSize:12, fontWeight:700,
                      boxShadow:'0 0 10px rgba(74,222,128,0.2)',
                    }}>RK</motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        <AnimatePresence>{loading && <ThinkingBubble/>}</AnimatePresence>
        <div ref={bottomRef}/>
      </div>

      {/* ── INPUT PANEL ── */}
      <motion.div
        initial={{ y:32, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ duration:0.4, delay:0.2 }}
        style={{
          borderTop:'1px solid rgba(74,222,128,0.1)',
          background:'rgba(10,20,10,0.92)', backdropFilter:'blur(20px)',
          borderRadius:'0 0 16px 16px', flexShrink:0,
          position:'relative', zIndex:2,
          overflow:'visible',
          paddingTop:8,
        }}
      >
  

        {/* Prompt chips */}
        <div style={{ display:'flex', gap:8, padding:'0 16px 10px', flexWrap:'wrap', justifyContent:'center' }}>
          {['Best crop for October?','Soil health tips','Market prices today','Pest forecast'].map((hint, i) => (
            <motion.button key={hint}
              initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35+i*0.07 }}
              whileHover={{ scale:1.05, borderColor:'rgba(74,222,128,0.45)' }} whileTap={{ scale:0.93 }}
              onClick={() => send(hint)}
              style={{
                background:'rgba(74,222,128,0.05)', border:'1px solid rgba(74,222,128,0.18)',
                borderRadius:20, padding:'5px 14px', fontSize:12, color:'#88c888', cursor:'pointer',
              }}
            >{hint}</motion.button>
          ))}
        </div>

        {/* Input row */}
        <div style={{ padding:'0 16px 14px', display:'flex', gap:12, alignItems:'center' }}>
          {/* Mic button */}
          <motion.button
            whileTap={{ scale:0.88 }}
            animate={listening ? { scale:[1,1.12,1], boxShadow:['0 0 0px rgba(248,113,113,0)','0 0 14px rgba(248,113,113,0.5)','0 0 0px rgba(248,113,113,0)'] } : {}}
            transition={listening ? { duration:0.8, repeat:Infinity } : {}}
            onClick={() => setListening(v => !v)}
            style={{
              width:46, height:46, borderRadius:'50%', border:'none', cursor:'pointer',
              background: listening ? 'rgba(248,113,113,0.15)' : 'rgba(74,222,128,0.08)',
              border: `1px solid ${listening ? 'rgba(248,113,113,0.4)' : 'rgba(74,222,128,0.2)'}`,
              display:'flex', alignItems:'center', justifyContent:'center',
              color: listening ? '#F87171' : '#4ADE80', flexShrink:0,
            }}
          >
            {listening ? <VoiceVisualizer/> : <Mic size={18}/>}
          </motion.button>

          {/* Text input */}
          <motion.div
            animate={
              focused ? { boxShadow:'0 0 0 2px rgba(74,222,128,0.25), 0 0 28px rgba(74,222,128,0.1)' }
              : error ? { boxShadow:'0 0 0 2px rgba(248,113,113,0.3)' }
              : { boxShadow:'none' }
            }
            transition={{ duration:0.2 }}
            style={{
              flex:1, display:'flex', alignItems:'center',
              background:'rgba(15,28,15,0.9)', borderRadius:28,
              border:`1px solid ${error ? 'rgba(248,113,113,0.35)' : 'rgba(74,222,128,0.15)'}`,
              padding:'10px 18px', transition:'border-color 0.3s',
            }}
          >
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key==='Enter' && !e.shiftKey && send()}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={error ? 'Try again...' : 'Ask me anything about farming...'}
              style={{
                flex:1, background:'none', border:'none', outline:'none',
                color: error ? '#F87171' : 'rgba(255,255,255,0.75)',
                fontSize:14, caretColor:'#4ADE80',
              }}
            />
          </motion.div>

          {/* Send button */}
          <motion.button
            whileTap={{ scale:0.88 }}
            whileHover={input.trim() ? { scale:1.06 } : {}}
            animate={input.trim() ? { boxShadow:['0 0 0px rgba(74,222,128,0)','0 0 18px rgba(74,222,128,0.6)','0 0 0px rgba(74,222,128,0)'] } : {}}
            transition={{ duration:1.5, repeat:Infinity }}
            onClick={() => send()}
            disabled={!input.trim()}
            style={{
              width:46, height:46, borderRadius:'50%', border:'none', cursor:'pointer',
              background: input.trim() ? 'linear-gradient(135deg, #4ADE80, #16a34a)' : 'rgba(74,222,128,0.08)',
              border:`1px solid ${input.trim() ? 'rgba(74,222,128,0.6)' : 'rgba(74,222,128,0.15)'}`,
              display:'flex', alignItems:'center', justifyContent:'center',
              flexShrink:0, transition:'background 0.2s',
            }}
          ><Send size={17} color={input.trim() ? '#052e16' : '#2d5a2d'}/></motion.button>
        </div>

        {/* Footer note */}
        <div style={{ textAlign:'center', paddingBottom:10, fontSize:11, color:'rgba(255,255,255,0.2)' }}>
          🔒 AI can make mistakes. Please verify important information.
        </div>
      </motion.div>
    </motion.div>
  );
}
