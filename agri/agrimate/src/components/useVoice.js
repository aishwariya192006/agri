/* ─────────────────────────────────────────────────────────────
   src/components/useVoice.js
   Web Speech API wrapper — speak / pause / resume / stop
   Supports: en-IN, hi-IN, ta-IN and falls back to en-US
──────────────────────────────────────────────────────────── */
import { useState, useRef, useCallback } from 'react';

export const LANGUAGES = [
  { code: 'en-IN', label: 'English' },
  { code: 'hi-IN', label: 'Hindi' },
  { code: 'ta-IN', label: 'Tamil' },
  { code: 'te-IN', label: 'Telugu' },
];

export function useVoice() {
  const [speaking, setSpeaking]   = useState(false);
  const [paused,   setPaused]     = useState(false);
  const [lang,     setLang]       = useState('en-IN');
  const uttRef = useRef(null);

  const speak = useCallback((text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang  = lang;
    utt.rate  = 0.92;
    utt.pitch = 1.05;
    utt.onstart = () => { setSpeaking(true); setPaused(false); };
    utt.onend   = () => { setSpeaking(false); setPaused(false); };
    utt.onerror = () => { setSpeaking(false); setPaused(false); };
    uttRef.current = utt;
    window.speechSynthesis.speak(utt);
  }, [lang]);

  const pause  = useCallback(() => { window.speechSynthesis.pause();  setPaused(true);  }, []);
  const resume = useCallback(() => { window.speechSynthesis.resume(); setPaused(false); }, []);
  const stop   = useCallback(() => { window.speechSynthesis.cancel(); setSpeaking(false); setPaused(false); }, []);

  return { speak, pause, resume, stop, speaking, paused, lang, setLang };
}
