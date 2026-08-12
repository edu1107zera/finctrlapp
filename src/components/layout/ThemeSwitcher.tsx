import React, { useState } from 'react';
import { useTheme, THEMES, ThemeName } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';
import { Palette, Check, Moon, Sun, Zap, Waves } from 'lucide-react';
import { cn } from '../../lib/utils';

const THEME_ICONS: Record<ThemeName, React.ReactNode> = {
  dark: <Moon size={16} />,
  light: <Sun size={16} />,
  cyber: <Zap size={16} />,
  ocean: <Waves size={16} />,
};

const THEME_PREVIEWS: Record<ThemeName, { bg: string; accent: string; glow: string }> = {
  dark: { bg: '#111113', accent: '#6366f1', glow: 'rgba(99,102,241,0.6)' },
  light: { bg: '#f4f4f5', accent: '#6366f1', glow: 'rgba(99,102,241,0.3)' },
  cyber: { bg: '#0D0B2B', accent: '#A855F7', glow: 'rgba(168,85,247,0.8)' },
  ocean: { bg: '#071828', accent: '#06B6D4', glow: 'rgba(6,182,212,0.8)' },
};

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] hover:border-[var(--accent)] transition-all text-[var(--text-muted)] hover:text-[var(--fg)] text-sm font-medium"
        style={{
          boxShadow: open ? `0 0 12px var(--accent-glow)` : 'none',
        }}
      >
        <Palette size={16} />
        <span className="hidden sm:inline">Tema</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: 'var(--accent)' }}
        />
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -8 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="absolute right-0 top-full mt-2 z-50 w-64 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl overflow-hidden"
              style={{ boxShadow: `0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px var(--border)` }}
            >
              <div className="p-3 border-b border-[var(--border)]">
                <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                  Escolha o Tema
                </p>
              </div>

              <div className="p-2 space-y-1">
                {THEMES.map((t) => {
                  const preview = THEME_PREVIEWS[t.name];
                  const isActive = theme === t.name;

                  return (
                    <motion.button
                      key={t.name}
                      whileHover={{ x: 4 }}
                      onClick={() => { setTheme(t.name); setOpen(false); }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left",
                        isActive
                          ? "bg-[var(--surface-2)] ring-1 ring-[var(--accent)]"
                          : "hover:bg-[var(--surface-2)]"
                      )}
                    >
                      {/* Color preview circle */}
                      <div
                        className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center"
                        style={{
                          background: preview.bg,
                          boxShadow: isActive ? `0 0 12px ${preview.glow}` : 'none',
                          border: `1px solid ${preview.accent}40`,
                        }}
                      >
                        <div style={{ color: preview.accent }}>
                          {THEME_ICONS[t.name]}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--fg)]">{t.emoji} {t.label}</p>
                        <p className="text-[11px] text-[var(--text-muted)] truncate">
                          {t.name === 'dark' && 'Escuro clássico refinado'}
                          {t.name === 'light' && 'Claro e limpo'}
                          {t.name === 'cyber' && 'Roxo neon futurista'}
                          {t.name === 'ocean' && 'Azul profundo oceânico'}
                        </p>
                      </div>

                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: 'var(--accent)' }}
                        >
                          <Check size={12} className="text-white" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Animated accent line at bottom */}
              <div
                className="h-0.5 w-full"
                style={{
                  background: `linear-gradient(90deg, transparent, var(--accent), transparent)`,
                  boxShadow: `0 0 8px var(--accent-glow)`,
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
