import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark' | 'dim' | 'auto';

const THEME_STORAGE_KEY = 'app-theme-preference';
const VALID_THEMES: Theme[] = ['light', 'dark', 'dim', 'auto'];

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private currentTheme = signal<Theme>('auto');
  public theme$ = this.currentTheme.asReadonly();

  private mediaQueryList: MediaQueryList | null = null;

  constructor() {
    // Initialize theme
    this.initializeTheme();

    // Listen for theme changes and apply them
    effect(() => {
      this.applyTheme(this.currentTheme());
    });

    // Listen for system theme preference changes
    this.watchSystemTheme();
  }

  /**
   * Initialize theme from storage or system preference
   */
  private initializeTheme(): void {
    const stored = this.getStoredTheme();

    if (stored && VALID_THEMES.includes(stored)) {
      this.currentTheme.set(stored);
    } else {
      // Default to auto (system preference)
      this.currentTheme.set('auto');
    }
  }

  /**
   * Get theme from localStorage
   */
  private getStoredTheme(): Theme | null {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      return (stored as Theme) || null;
    } catch {
      return null;
    }
  }

  /**
   * Save theme preference to localStorage
   */
  private saveThemePreference(theme: Theme): void {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (e) {
      console.warn('Failed to save theme preference:', e);
    }
  }

  /**
   * Get the effective theme (resolve 'auto' to actual theme)
   */
  private getEffectiveTheme(theme: Theme): 'light' | 'dark' | 'dim' {
    if (theme === 'auto') {
      return this.getSystemTheme();
    }
    return theme;
  }

  /**
   * Get system theme preference
   */
  private getSystemTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined') {
      return 'dark';
    }

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  }

  /**
   * Watch for system theme changes
   */
  private watchSystemTheme(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      this.mediaQueryList = window.matchMedia('(prefers-color-scheme: light)');

      const handleChange = () => {
        // If theme is set to 'auto', reapply to pick up system change
        if (this.currentTheme() === 'auto') {
          this.applyTheme('auto');
        }
      };

      if (this.mediaQueryList.addEventListener) {
        this.mediaQueryList.addEventListener('change', handleChange);
      } else if (this.mediaQueryList.addListener) {
        this.mediaQueryList.addListener(handleChange);
      }
    } catch (e) {
      console.warn('Failed to watch system theme:', e);
    }
  }

  /**
   * Apply theme to document
   */
  private applyTheme(theme: Theme): void {
    const effectiveTheme = this.getEffectiveTheme(theme);
    const htmlElement = document.documentElement;

    // Set data-theme attribute
    htmlElement.setAttribute('data-theme', effectiveTheme);

    // Also set for CSS color-scheme
    htmlElement.style.colorScheme = effectiveTheme;

    // Set meta theme-color for mobile browsers
    this.updateThemeColor(effectiveTheme);
  }

  /**
   * Update meta theme-color for mobile browsers
   */
  private updateThemeColor(theme: 'light' | 'dark' | 'dim'): void {
    let themeColor = '#13161d'; // default dark

    if (theme === 'light') {
      themeColor = '#ffffff';
    } else if (theme === 'dim') {
      themeColor = '#0f1117';
    }

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', themeColor);
    }
  }

  /**
   * Set theme programmatically
   */
  setTheme(theme: Theme): void {
    if (!VALID_THEMES.includes(theme)) {
      console.warn(`Invalid theme: ${theme}. Using 'auto'.`);
      theme = 'auto';
    }

    this.currentTheme.set(theme);
    this.saveThemePreference(theme);
  }

  /**
   * Get current theme
   */
  getTheme(): Theme {
    return this.currentTheme();
  }

  /**
   * Get effective theme (resolves 'auto')
   */
  getEffectiveThemeName(): 'light' | 'dark' | 'dim' {
    return this.getEffectiveTheme(this.currentTheme());
  }

  /**
   * Check if current theme is dark-like
   */
  isDarkTheme(): boolean {
    const effective = this.getEffectiveThemeName();
    return effective === 'dark' || effective === 'dim';
  }

  /**
   * Check if current theme is light
   */
  isLightTheme(): boolean {
    return this.getEffectiveThemeName() === 'light';
  }

  /**
   * Get all available themes
   */
  getAvailableThemes(): Theme[] {
    return [...VALID_THEMES];
  }

  /**
   * Toggle between light and dark theme
   */
  toggleTheme(): void {
    const current = this.getEffectiveThemeName();
    const newTheme: 'light' | 'dark' = current === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  /**
   * Reset to system preference
   */
  resetToSystemPreference(): void {
    this.setTheme('auto');
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.mediaQueryList && this.mediaQueryList.removeEventListener) {
      this.mediaQueryList.removeEventListener('change', () => {});
    }
  }
}
