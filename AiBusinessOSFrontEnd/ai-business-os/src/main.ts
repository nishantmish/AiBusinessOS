import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

export type Theme = 'light' | 'dark' | 'dim' | 'auto';
const THEME_STORAGE_KEY = 'app-theme-preference';
const VALID_THEMES: Theme[] = ['light', 'dark', 'dim', 'auto'];

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark';
}

function getEffectiveTheme(theme: Theme): 'light' | 'dark' | 'dim' {
  return theme === 'auto' ? getSystemTheme() : theme;
}

function initializeTheme(): void {
  let stored: Theme | null = null;

  try {
    stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
  } catch {
    stored = null;
  }

  const theme = stored && VALID_THEMES.includes(stored) ? stored : 'auto';
  const effectiveTheme = getEffectiveTheme(theme);
  const htmlElement = document.documentElement;

  htmlElement.setAttribute('data-theme', effectiveTheme);
  htmlElement.style.colorScheme = effectiveTheme;

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', effectiveTheme === 'light' ? '#ffffff' : effectiveTheme === 'dim' ? '#0f1117' : '#13161d');
  }
}

initializeTheme();

bootstrapApplication(App, appConfig).catch(err => console.error(err));
