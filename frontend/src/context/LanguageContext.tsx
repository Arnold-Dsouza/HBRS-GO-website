"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import enTranslations from '@/locales/en.json';
import deTranslations from '@/locales/de.json';

type Language = 'en' | 'de';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'hbrs-go-language';
const DEFAULT_LANGUAGE: Language = 'en';

const allTranslations: Record<Language, Record<string, any>> = {
  en: enTranslations,
  de: deTranslations,
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);

  const setLanguage = useCallback((newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem(STORAGE_KEY, newLanguage);
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    let string = key.split('.').reduce((obj, k) => obj && obj[k], allTranslations[language]);
    
    if (typeof string !== 'string') {
      string = key.split('.').reduce((obj, k) => obj && obj[k], allTranslations.en);
      if (typeof string !== 'string') {
        console.warn(`Translation key "${key}" not found in any language.`);
        return key;
      }
    }

    if (params) {
      Object.keys(params).forEach(paramKey => {
        string = string.replace(new RegExp(`{${paramKey}}`, 'g'), String(params[paramKey]));
      });
    }
    return string;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default LanguageContext;
