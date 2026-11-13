'use client';

import {Moon, Sun} from 'lucide-react';
import {useEffect, useState} from 'react';

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const sync = () => setDark(document.documentElement.dataset.theme === 'dark');
    sync();
    const onStorage = (event: StorageEvent) => {
      if (event.key !== 'nex-theme') return;
      const theme = event.newValue === 'dark' || (event.newValue !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
      document.documentElement.dataset.theme = theme;
      sync();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  function toggle() {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    setDark(next === 'dark');
    try { localStorage.setItem('nex-theme', next); } catch { /* Theme still works for this visit. */ }
  }

  return <button type="button" onClick={toggle} aria-label={dark ? 'Kunduzgi rejimga o‘tish' : 'Tun rejimiga o‘tish'} title={dark ? 'Kunduzgi rejim' : 'Tun rejimi'} className="theme-toggle flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50">{dark ? <Sun size={19}/> : <Moon size={19}/>}</button>;
}
