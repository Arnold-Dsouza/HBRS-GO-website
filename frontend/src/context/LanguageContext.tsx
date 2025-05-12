
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import enTranslations from '@/locales/en.json';
import deTranslations from '@/locales/de.json';

type Language = 'en' | 'de';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  translations: Record<string, any>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'hbrs-go-language';
const DEFAULT_LANGUAGE: Language = 'en';

const allTranslations: Record<Language, Record<string, any>> = {
  en: enTranslations,
  de: deTranslations,
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [currentTranslations, setCurrentTranslations] = useState<Record<string, any>>(allTranslations[DEFAULT_LANGUAGE]);

  useEffect(() => {
    const storedLanguage = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (storedLanguage && (storedLanguage === 'en' || storedLanguage === 'de')) {
      setLanguageState(storedLanguage);
      setCurrentTranslations(allTranslations[storedLanguage]);
    } else {
      // Fallback for initial load if nothing is stored
      setCurrentTranslations(allTranslations[DEFAULT_LANGUAGE]);
    }
  }, []);

  const setLanguage = useCallback((newLanguage: Language) => {
    setLanguageState(newLanguage);
    setCurrentTranslations(allTranslations[newLanguage]);
    localStorage.setItem(STORAGE_KEY, newLanguage);
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    let string = key.split('.').reduce((obj, k) => obj && obj[k], currentTranslations);
    
    if (typeof string !== 'string') {
      // Fallback to English if key not found in current language, then to key itself
      string = key.split('.').reduce((obj, k) => obj && obj[k], allTranslations.en);
      if (typeof string !== 'string') {
        console.warn(`Translation key "${key}" not found in any language.`);
        return key; // Fallback to key
      }
    }

    if (params) {
      Object.keys(params).forEach(paramKey => {
        string = string.replace(new RegExp(`{${paramKey}}`, 'g'), String(params[paramKey]));
      });
    }
    return string;
  }, [currentTranslations]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translations: currentTranslations }}>
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
