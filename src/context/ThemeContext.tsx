import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeName = 'dark' | 'light' | 'cyber' | 'ocean';

export interface ThemeConfig {
  name: ThemeName;
  label: string;
  emoji: string;
  vars: Record<string, string>;
}

export const THEMES: ThemeConfig[] = [
  {
    name: 'dark',
    label: 'Dark',
    emoji: '🌑',
    vars: {
      '--bg': '#09090B',
      '--fg': '#FAFAFA',
      '--surface': '#111113',
      '--surface-2': '#18181B',
      '--border': '#27272A',
      '--text-muted': '#A1A1AA',
      '--accent': '#6366f1',
      '--accent-fg': '#ffffff',
      '--accent-glow': 'rgba(99,102,241,0.3)',
    },
  },
  {
    name: 'light',
    label: 'Light',
    emoji: '☀️',
    vars: {
      '--bg': '#FAFAFA',
      '--fg': '#09090B',
      '--surface': '#ffffff',
      '--surface-2': '#f4f4f5',
      '--border': '#e4e4e7',
      '--text-muted': '#71717a',
      '--accent': '#6366f1',
      '--accent-fg': '#ffffff',
      '--accent-glow': 'rgba(99,102,241,0.2)',
    },
  },
  {
    name: 'cyber',
    label: 'Cyber',
    emoji: '⚡',
    vars: {
      '--bg': '#03001C',
      '--fg': '#E0E0FF',
      '--surface': '#0D0B2B',
      '--surface-2': '#130F3A',
      '--border': '#2A2060',
      '--text-muted': '#7B6FA0',
      '--accent': '#A855F7',
      '--accent-fg': '#ffffff',
      '--accent-glow': 'rgba(168,85,247,0.4)',
    },
  },
  {
    name: 'ocean',
    label: 'Ocean',
    emoji: '🌊',
    vars: {
      '--bg': '#020B18',
      '--fg': '#D6F0FF',
      '--surface': '#071828',
      '--surface-2': '#0A2135',
      '--border': '#0F3352',
      '--text-muted': '#4A7C9E',
      '--accent': '#06B6D4',
      '--accent-fg': '#000000',
      '--accent-glow': 'rgba(6,182,212,0.35)',
    },
  },
];

interface ThemeContextType {
  theme: ThemeName;
  themeConfig: ThemeConfig;
  setTheme: (t: ThemeName) => void;
  toggleTheme: () => void; // backward compat (dark/light toggle)
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function applyTheme(config: ThemeConfig) {
  const root = document.documentElement;
  // Remove all theme classes
  root.classList.remove('dark', 'cyber', 'ocean', 'light');
  // Add current theme class (dark, cyber and ocean get .dark for tailwind dark: prefix)
  if (config.name !== 'light') root.classList.add('dark');
  root.classList.add(config.name);

  // Apply CSS vars
  Object.entries(config.vars).forEach(([key, val]) => {
    root.style.setProperty(key, val);
  });
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    const saved = localStorage.getItem('finance_theme_v2');
    if (saved && THEMES.find(t => t.name === saved)) return saved as ThemeName;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const themeConfig = THEMES.find(t => t.name === theme) ?? THEMES[0];

  useEffect(() => {
    applyTheme(themeConfig);
    localStorage.setItem('finance_theme_v2', theme);
  }, [theme]);

  const setTheme = (t: ThemeName) => setThemeState(t);
  const toggleTheme = () => setThemeState(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider value={{ theme, themeConfig, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
