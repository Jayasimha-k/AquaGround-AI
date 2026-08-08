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
    if (dict[key]) return dict[key];
    if (fallback && dict[fallback]) return dict[fallback];
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
