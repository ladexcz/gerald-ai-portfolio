'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export type Theme = 'light' | 'dark';

// Keep in step with --bg in globals.css and the boot script in app/layout.tsx.
export const THEME_COLOR: Record<Theme, string> = { light: '#f5f8fa', dark: '#000000' };

function applyTheme(t: Theme) {
  document.documentElement.dataset.theme = t;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[t]);
}

function stored(): Theme | null {
  try {
    const t = localStorage.getItem('theme');
    return t === 'light' || t === 'dark' ? t : null;
  } catch {
    return null;
  }
}

export function ThemeToggle() {
  // null until mounted: the boot script already set the theme, React only reads it.
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');

    // Follow the system setting until the visitor picks one here.
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const onChange = () => {
      if (stored()) return;
      const t: Theme = mq.matches ? 'light' : 'dark';
      applyTheme(t);
      setTheme(t);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const toggle = () => {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    applyTheme(next);
    try {
      localStorage.setItem('theme', next);
    } catch {
      /* private mode: the choice lasts for this visit only */
    }
    setTheme(next);
  };

  return (
    <button
      type="button"
      className="icon-btn theme-toggle"
      onClick={toggle}
      aria-label="Dark mode"
      aria-pressed={theme === null ? undefined : theme === 'dark'}
    >
      {/* Both icons render; CSS shows the one for the current theme, so nothing flips on hydration. */}
      <Sun className="icon-sun" size={18} aria-hidden="true" />
      <Moon className="icon-moon" size={18} aria-hidden="true" />
    </button>
  );
}
