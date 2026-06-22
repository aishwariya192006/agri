import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Mic, MicOff, Send, Trash2, Plus, Sprout, CloudRain, Bug, TrendingUp } from 'lucide-react';
import { aiApi } from '../api';

const quickCommands = ['Check weather', 'Show market prices', 'My farm tasks', 'Soil health status'];

const recentActions = [
  { cmd: 'Check weather for Ludhiana', response: 'Clear skies, 28°C. No rain expected for 3 days. Good conditions for field work.', time: '10 min ago', icon: CloudRain },
  { cmd: 'Latest cotton prices', response: 'Cotton at Bathinda Mandi: ₹6,800/qtl, up 2.4% today. Good time to sell stored stock.', time: '1 hour ago', icon: TrendingUp },
  { cmd: 'Wheat sowing tips', response: 'Best time to sow wheat in Punjab is Oct 15–Nov 5. Use HD-2967 or PBW-550 varieties.', time: '3 hours ago', icon: Sprout },
  { cmd: 'Identify leaf spots on wheat', response: 'Based on recent weather, this may be Leaf Rust. Apply Propiconazole 25% EC immediately.', time: 'Yesterday', icon: Bug },
  { cmd: 'Irrigation schedule', response: 'No irrigation needed today. Soil moisture at 68%. Next irrigation recommended Friday.', time: 'Yesterday', icon: CloudRain },
];

const initialMessages = [
  { id: 1, role: 'ai', text: 'Namaskar Ramesh Ji! 🌾 I\'m your AgriMate AI Assistant. Tap the mic or type to ask anything about your farm.' },
];

const fmt = t => t.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#C4A35A">$1</strong>').replace(/\n/g, '<br/>');

export default function AIAssistant() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [view, setView] = useState('home'); // home | chat
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const send = async (txt) => {
    const text = txt || input.trim();
    if (!text) return;
    setView('chat');
    setInput('');
    setMessages(m => [...m, { id: Date.now(), role: 'user', text }]);
    setLoading(true);
    try {
      const { text: reply } = await aiApi.chat(text);
      setMessages(m => [...m, { id: Date.now() + 1, role: 'ai', text: reply }]);
    } catch {
      setMessages(m => [...m, { id: Date.now() + 1, role: 'ai', text: 'Connection lost. Please check that the backend is running and try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const tapMic = () => {
    setListening(l => !l);
    if (!listening) {
      setView('chat');
      setTimeout(() => {
        setListening(false);
        send('Check my farm weather and irrigation status');
      }, 2500);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#C4A35A', marginBottom: 4 }}>AI Assistant</div>
      <div style={{ color: '#A8C5A0', fontSize: 14, marginBottom: 24 }}>Voice and text powered farming assistant</div>

      {view === 'home' && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Voice Button */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '40px 0' }}>
            <motion.button
              onClick={tapMic}
              animate={listening ? {
                boxShadow: ['0 0 20px rgba(196,163,90,0.4)', '0 0 60px rgba(196,163,90,0.8)', '0 0 20px rgba(196,163,90,0.4)'],
              } : {
                boxShadow: '0 0 20px rgba(196,163,90,0.3)',
              }}
              transition={{ duration: 1, repeat: listening ? Infinity : 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                width: 120, height: 120, borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: listening ? 'linear-gradient(135deg, #C4A35A, #8B5A2B)' : 'linear-gradient(135deg, #4A9B3F, #2D6A1F)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {listening ? <MicOff size={44} color="#F5ECD7" /> : <Mic size={44} color="#F5ECD7" />}
            </motion.button>
            <div style={{ color: '#A8C5A0', fontSize: 15 }}>{listening ? 'Listening... speak now' : 'Tap to speak'}</div>
          </div>

          {/* Quick Commands */}
          <div>
            <div style={{ color: '#A8C5A0', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Quick Commands</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {quickCommands.map(cmd => (
                <motion.button
                  key={cmd}
                  whileHover={{ scale: 1.04, boxShadow: '0 0 14px rgba(196,163,90,0.3)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => send(cmd)}
                  style={{
                    padding: '8px 18px', borderRadius: 20, background: 'rgba(196,163,90,0.1)',
                    border: '1px solid rgba(196,163,90,0.25)', color: '#C4A35A',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}
                >{cmd}</motion.button>
              ))}
            </div>
          </div>

          {/* Recent Actions */}
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, color: '#C4A35A', marginBottom: 12 }}>Recent Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentActions.map((a, i) => {
                const Icon = a.icon;
                return (
                  <motion.div key={i} whileHover={{ scale: 1.01 }} className="card card-hover" style={{ cursor: 'pointer', padding: '14px 16px' }} onClick={() => send(a.cmd)}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(196,163,90,0.1)', border: '1px solid rgba(196,163,90,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={17} color="#C4A35A" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: '#F5ECD7', fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{a.cmd}</div>
                        <div style={{ color: '#A8C5A0', fontSize: 12, lineHeight: 1.5, opacity: 0.85 }}>{a.response}</div>
                      </div>
                      <span style={{ color: '#6B8A65', fontSize: 11, whiteSpace: 'nowrap', flexShrink: 0 }}>{a.time}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {view === 'chat' && (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)' }}>
          {/* Chat Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ADE80', animation: 'pulse 2s infinite' }} />
              <span style={{ color: '#4A9B3F', fontSize: 13, fontWeight: 600 }}>AI Assistant Online</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setView('home')} className="btn-outline" style={{ padding: '5px 12px', fontSize: 12 }}>← Home</button>
              <button onClick={() => { setMessages(initialMessages); setView('home'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A8C5A0', padding: 6 }}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14, padding: '4px 0' }}>
            <AnimatePresence initial={false}>
              {messages.map(msg => (
                <motion.div key={msg.id} initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', gap: 10, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                  {msg.role === 'ai' && (
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#C4A35A,#8B5A2B)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Bot size={16} color="#0A1508" />
                    </div>
                  )}
                  <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'} style={{ maxWidth: '75%', fontSize: 13, lineHeight: 1.65 }} dangerouslySetInnerHTML={{ __html: fmt(msg.text) }} />
                  {msg.role === 'user' && (
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#4A9B3F', border: '2px solid #C4A35A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F5ECD7', fontWeight: 700, fontSize: 11, flexShrink: 0 }}>RK</div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {loading && (
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#C4A35A,#8B5A2B)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bot size={16} color="#0A1508" />
                </div>
                <div className="chat-bubble-ai" style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                  {[0, 1, 2].map(i => <span key={i} className="typing-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: '#C4A35A', display: 'inline-block' }} />)}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div style={{ paddingTop: 14 }}>
            <div style={{ display: 'flex', gap: 8, background: 'rgba(13,27,10,0.8)', borderRadius: 24, border: '1px solid rgba(196,163,90,0.2)', padding: '6px 6px 6px 16px' }}>
              <motion.button whileTap={{ scale: 0.95 }} onClick={tapMic} style={{ background: 'none', border: 'none', cursor: 'pointer', color: listening ? '#C4A35A' : '#6B8A65', padding: 8 }}>
                <Mic size={18} />
              </motion.button>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Ask anything about farming..." style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#F5ECD7', fontSize: 13 }} />
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => send()} style={{ width: 36, height: 36, borderRadius: 20, background: input.trim() ? '#C4A35A' : 'rgba(196,163,90,0.2)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
                <Send size={15} color={input.trim() ? '#0A1508' : '#6B8A65'} />
              </motion.button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
