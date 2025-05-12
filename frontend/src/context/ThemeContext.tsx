
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'hbrs-go-theme';
const DEFAULT_THEME: Theme = 'light';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);

  useEffect(() => {
    const storedTheme = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark')) {
      setThemeState(storedTheme);
    }
    // Optional: Respect system preference as a fallback if no theme is stored.
    // else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    //   setThemeState('dark');
    // }
  }, []); // Runs once on client mount to load the stored theme

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]); // Runs whenever the theme state changes

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
