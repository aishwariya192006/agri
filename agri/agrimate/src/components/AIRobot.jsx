import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MESSAGES = [
  'Ask me anything! 🌾',
  'Rain expected tomorrow 🌧️',
  'Soil moisture is 68% ✅',
  'Market prices updated 📈',
  'Good farming day! ☀️',
];

const ORBIT_ICONS = ['🌱', '💧', '☀️', '📊', '🌾'];

export default function AIRobot() {
  const [hovered, setHovered] = useState(false);
  const [bubble, setBubble] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setMsgIndex(i => (i + 1) % MESSAGES.length);
      setBubble(true);
      setTimeout(() => setBubble(false), 3500);
    }, 8000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ position: 'absolute', bottom: 90, right: 80, zIndex: 50, userSelect: 'none' }}>

      {/* Speech bubble */}
      <AnimatePresence>
        {(bubble || hovered) && (
          <motion.div
            key={hovered ? 'hover' : msgIndex}
            initial={{ opacity: 0, y: 10, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.85 }}
            transition={{ duration: 0.22 }}
            style={{
              position: 'absolute', bottom: '100%', left: '50%',
              transform: 'translateX(-50%)', marginBottom: 12,
              background: 'rgba(13,27,10,0.97)', border: '1px solid #C4A35A',
              borderRadius: 12, padding: '6px 12px', fontSize: 11,
              color: '#F5ECD7', whiteSpace: 'nowrap', textAlign: 'center',
              boxShadow: '0 4px 16px rgba(0,0,0,0.5)', pointerEvents: 'none',
            }}
          >
            {hovered ? 'Hello Farmer! 👋' : MESSAGES[msgIndex]}
            <div style={{
              position: 'absolute', bottom: -7, left: '50%', transform: 'translateX(-50%)',
              width: 0, height: 0,
              borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
              borderTop: '7px solid #C4A35A',
            }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Outer ambient glow */}
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', inset: -20, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(74,155,63,0.25) 0%, transparent 70%)',
          filter: 'blur(10px)', pointerEvents: 'none',
        }}
      />

      {/* Orbiting icons */}
      {ORBIT_ICONS.map((icon, i) => {
        const angle = (i / ORBIT_ICONS.length) * 360;
        const radius = 58;
        return (
          <motion.div
            key={i}
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear', delay: 0 }}
            style={{
              position: 'absolute', top: '50%', left: '50%',
              width: 0, height: 0,
              transformOrigin: '0 0',
            }}
          >
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
              style={{
                position: 'absolute',
                left: radius * Math.cos((angle * Math.PI) / 180),
                top: radius * Math.sin((angle * Math.PI) / 180),
                transform: 'translate(-50%, -50%)',
                fontSize: 14,
                filter: 'drop-shadow(0 0 4px rgba(196,163,90,0.7))',
              }}
            >
              {icon}
            </motion.div>
          </motion.div>
        );
      })}

      {/* Main orb */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        whileHover={{ scale: 1.1 }}
        style={{ cursor: 'pointer', position: 'relative', width: 80, height: 80 }}
      >
        {/* Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute', inset: -6, borderRadius: '50%',
            border: '2px dashed rgba(196,163,90,0.4)',
          }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute', inset: -14, borderRadius: '50%',
            border: '1px dashed rgba(74,155,63,0.3)',
          }}
        />

        {/* Core orb */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, #5DC54F, #2D6A1F 50%, #0D1B0A)',
          border: '2px solid rgba(196,163,90,0.6)',
          boxShadow: hovered
            ? '0 0 30px rgba(74,155,63,0.8), 0 0 60px rgba(196,163,90,0.4)'
            : '0 0 20px rgba(74,155,63,0.5), 0 0 40px rgba(74,155,63,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'box-shadow 0.3s',
          overflow: 'hidden', position: 'relative',
        }}>
          {/* Inner pulse rings */}
          {[1, 2, 3].map(i => (
            <motion.div
              key={i}
              animate={{ scale: [0.3, 1.4], opacity: [0.6, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.7, ease: 'easeOut' }}
              style={{
                position: 'absolute', width: '100%', height: '100%', borderRadius: '50%',
                border: '1px solid rgba(196,163,90,0.5)',
              }}
            />
          ))}

          {/* AI label */}
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 22, fontWeight: 700,
            color: '#F5ECD7',
            textShadow: '0 0 12px rgba(196,163,90,0.8)',
            zIndex: 1, letterSpacing: 1,
          }}>AI</div>
        </div>
      </motion.div>
    </div>
  );
}
