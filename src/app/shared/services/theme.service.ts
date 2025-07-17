import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly storageKey = 'travel-app-theme';
  
  theme = signal<'light' | 'dark'>(this.getInitialTheme());

  constructor() {
    // Apply theme changes to document
    effect(() => {
      document.documentElement.setAttribute('data-theme', this.theme());
      localStorage.setItem(this.storageKey, this.theme());
    });
  }

  private getInitialTheme(): 'light' | 'dark' {
    const stored = localStorage.getItem(this.storageKey);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  toggleTheme(): void {
    this.theme.set(this.theme() === 'light' ? 'dark' : 'light');
  }

  setTheme(theme: 'light' | 'dark'): void {
    this.theme.set(theme);
  }
}