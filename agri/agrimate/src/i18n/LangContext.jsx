import { createContext, useContext, useState } from 'react';
import { TRANSLATIONS } from './translations';

const LangContext = createContext(null);

export const LANGUAGES = [
  { code: 'en', label: 'English',   native: 'English',   flag: '🇬🇧', voice: 'en-IN' },
  { code: 'hi', label: 'Hindi',     native: 'हिंदी',      flag: '🇮🇳', voice: 'hi-IN' },
  { code: 'ta', label: 'Tamil',     native: 'தமிழ்',      flag: '🇮🇳', voice: 'ta-IN' },
  { code: 'te', label: 'Telugu',    native: 'తెలుగు',     flag: '🇮🇳', voice: 'te-IN' },
  { code: 'kn', label: 'Kannada',   native: 'ಕನ್ನಡ',      flag: '🇮🇳', voice: 'kn-IN' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം',    flag: '🇮🇳', voice: 'ml-IN' },
  { code: 'mr', label: 'Marathi',   native: 'मराठी',      flag: '🇮🇳', voice: 'mr-IN' },
  { code: 'bn', label: 'Bengali',   native: 'বাংলা',      flag: '🇮🇳', voice: 'bn-IN' },
  { code: 'gu', label: 'Gujarati',  native: 'ગુજરાતી',    flag: '🇮🇳', voice: 'gu-IN' },
  { code: 'pa', label: 'Punjabi',   native: 'ਪੰਜਾਬੀ',     flag: '🇮🇳', voice: 'pa-IN' },
  { code: 'or', label: 'Odia',      native: 'ଓଡ଼ିଆ',      flag: '🇮🇳', voice: 'or-IN' },
  { code: 'as', label: 'Assamese',  native: 'অসমীয়া',    flag: '🇮🇳', voice: 'as-IN' },
  { code: 'ur', label: 'Urdu',      native: 'اردو',       flag: '🇮🇳', voice: 'ur-IN' },
];

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(
    () => localStorage.getItem('agrimate_lang') || 'en'
  );

  const setLang = (code) => {
    setLangState(code);
    localStorage.setItem('agrimate_lang', code);
  };

  const t = (key) => {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
    return dict[key] || TRANSLATIONS.en[key] || key;
  };

  const langObj = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  return (
    <LangContext.Provider value={{ lang, setLang, t, LANGUAGES, langObj }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
