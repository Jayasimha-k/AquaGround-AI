import React, { createContext, useContext, useState, useEffect } from 'react';
import { TRANSLATIONS, SUPPORTED_LANGUAGES } from '@/constants/translations';
import type { LanguageCode, LanguageOption } from '@/constants/translations';

interface LanguageContextValue {
  language: LanguageCode;
  languageOption: LanguageOption;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, fallback?: string) => string;
  supportedLanguages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('aquaground_lang') as LanguageCode;
    return saved && TRANSLATIONS[saved] ? saved : 'en';
  });

  const setLanguage = (lang: LanguageCode) => {
    if (TRANSLATIONS[lang]) {
      setLanguageState(lang);
      localStorage.setItem('aquaground_lang', lang);
    }
  };

  const currentOption = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  const t = (key: string, fallback?: string): string => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en;

    // 1. Direct key match
    if (dict[key]) return dict[key];

    // 2. Direct fallback key match
    if (fallback && dict[fallback]) return dict[fallback];

    // 3. Normalized key match
    const kNorm = key.trim().toLowerCase();
    for (const [dictKey, dictVal] of Object.entries(dict)) {
      if (dictKey.toLowerCase() === kNorm) return dictVal;
    }

    if (fallback) {
      const fNorm = fallback.trim().toLowerCase();
      for (const [dictKey, dictVal] of Object.entries(dict)) {
        if (dictKey.toLowerCase() === fNorm) return dictVal;
      }
    }

    // 4. English string reverse lookup (matches English string literals to current language keys)
    if (language !== 'en' && TRANSLATIONS.en) {
      const targetStr = (fallback || key).trim().toLowerCase();
      for (const [engKey, engVal] of Object.entries(TRANSLATIONS.en)) {
        if (engVal.trim().toLowerCase() === targetStr && dict[engKey]) {
          return dict[engKey];
        }
      }
    }

    // 5. English dictionary fallback
    if (TRANSLATIONS.en[key]) return TRANSLATIONS.en[key];

    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{
      language,
      languageOption: currentOption,
      setLanguage,
      t,
      supportedLanguages: SUPPORTED_LANGUAGES,
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
