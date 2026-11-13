import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import {ThemeToggle} from '@/components/layout/theme-toggle';

describe('theme toggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.dataset.theme = 'light';
    window.matchMedia = vi.fn().mockReturnValue({matches: false});
  });
  afterEach(() => {cleanup(); vi.restoreAllMocks();});

  it('switches themes and saves the preference', () => {
    render(<ThemeToggle/>);
    fireEvent.click(screen.getByRole('button', {name: 'Tun rejimiga o‘tish'}));
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem('nex-theme')).toBe('dark');
    fireEvent.click(screen.getByRole('button', {name: 'Kunduzgi rejimga o‘tish'}));
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(localStorage.getItem('nex-theme')).toBe('light');
  });

  it('reflects the theme applied before hydration and syncs other tabs', () => {
    document.documentElement.dataset.theme = 'dark';
    render(<ThemeToggle/>);
    expect(screen.getByRole('button', {name: 'Kunduzgi rejimga o‘tish'})).toBeTruthy();
    fireEvent(window, new StorageEvent('storage', {key: 'nex-theme', newValue: 'light'}));
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(screen.getByRole('button', {name: 'Tun rejimiga o‘tish'})).toBeTruthy();
  });

  it('still changes the theme when browser storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {throw new Error('blocked');});
    render(<ThemeToggle/>);
    fireEvent.click(screen.getByRole('button', {name: 'Tun rejimiga o‘tish'}));
    expect(document.documentElement.dataset.theme).toBe('dark');
  });
});
