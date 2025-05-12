"use client";

import React, { createContext, useContext, useState } from 'react';
import enTranslations from '@/locales/en.json';
import deTranslations from '@/locales/de.json';

type Language = 'en' | 'de';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'hbrs-go-language';
const DEFAULT_LANGUAGE: Language = 'en';

const allTranslations: Record<Language, Record<string, any>> = {
  en: enTranslations,
  de: deTranslations,
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
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
