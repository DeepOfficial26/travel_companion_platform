import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ThemeService } from '../../shared/services/theme.service';
import { UserPreferences } from '../../shared/interfaces/travel.interface';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="settings container">
      <div class="settings-header">
        <h1>Settings</h1>
        <p>Customize your travel experience</p>
      </div>

      <div class="settings-grid">
        <!-- Theme Settings -->
        <div class="card settings-card">
          <div class="card-header">
            <h2><i class="pi pi-palette"></i> Theme</h2>
          </div>
          <div class="card-content">
            <div class="theme-options">
              <div class="theme-option">
                <input 
                  type="radio" 
                  id="light-theme" 
                  name="theme" 
                  value="light"
                  [checked]="themeService.theme() === 'light'"
                  (change)="onThemeChange('light')"
                >
                <label for="light-theme" class="theme-label">
                  <div class="theme-preview light">
                    <div class="theme-preview-header"></div>
                    <div class="theme-preview-body"></div>
                  </div>
                  <span>Light Mode</span>
                </label>
              </div>

              <div class="theme-option">
                <input 
                  type="radio" 
                  id="dark-theme" 
                  name="theme" 
                  value="dark"
                  [checked]="themeService.theme() === 'dark'"
                  (change)="onThemeChange('dark')"
                >
                <label for="dark-theme" class="theme-label">
                  <div class="theme-preview dark">
                    <div class="theme-preview-header"></div>
                    <div class="theme-preview-body"></div>
                  </div>
                  <span>Dark Mode</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Language Settings -->
        <div class="card settings-card">
          <div class="card-header">
            <h2><i class="pi pi-globe"></i> Language & Region</h2>
          </div>
          <div class="card-content">
            <form [formGroup]="settingsForm">
              <div class="form-group">
                <label for="language">Language</label>
                <select 
                  id="language"
                  formControlName="language"
                  class="form-control"
                  (change)="onLanguageChange()"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="it">Italiano</option>
                  <option value="pt">Português</option>
                  <option value="zh">中文</option>
                  <option value="ja">日本語</option>
                </select>
              </div>

              <div class="form-group">
                <label for="currency">Default Currency</label>
                <select 
                  id="currency"
                  formControlName="currency"
                  class="form-control"
                  (change)="onCurrencyChange()"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                  <option value="CHF">CHF - Swiss Franc</option>
                  <option value="CNY">CNY - Chinese Yuan</option>
                </select>
              </div>

              <div class="form-group">
                <label for="units">Units</label>
                <select 
                  id="units"
                  formControlName="units"
                  class="form-control"
                  (change)="onUnitsChange()"
                >
                  <option value="metric">Metric (°C, km, kg)</option>
                  <option value="imperial">Imperial (°F, miles, lbs)</option>
                </select>
              </div>
            </form>
          </div>
        </div>

        <!-- Notification Settings -->
        <div class="card settings-card">
          <div class="card-header">
            <h2><i class="pi pi-bell"></i> Notifications</h2>
          </div>
          <div class="card-content">
            <div class="notification-options">
              <div class="notification-option">
                <div class="notification-info">
                  <h3>Trip Reminders</h3>
                  <p>Get notified about upcoming trips and important dates</p>
                </div>
                <div class="toggle-switch">
                  <input 
                    type="checkbox" 
                    id="trip-reminders"
                    [checked]="preferences().notifications"
                    (change)="onNotificationChange('tripReminders', $event)"
                  >
                  <label for="trip-reminders" class="toggle-label"></label>
                </div>
              </div>

              <div class="notification-option">
                <div class="notification-info">
                  <h3>Price Alerts</h3>
                  <p>Receive notifications when flight or hotel prices drop</p>
                </div>
                <div class="toggle-switch">
                  <input 
                    type="checkbox" 
                    id="price-alerts"
                    [checked]="preferences().notifications"
                    (change)="onNotificationChange('priceAlerts', $event)"
                  >
                  <label for="price-alerts" class="toggle-label"></label>
                </div>
              </div>

              <div class="notification-option">
                <div class="notification-info">
                  <h3>Weather Updates</h3>
                  <p>Get weather forecasts for your destinations</p>
                </div>
                <div class="toggle-switch">
                  <input 
                    type="checkbox" 
                    id="weather-updates"
                    [checked]="preferences().notifications"
                    (change)="onNotificationChange('weatherUpdates', $event)"
                  >
                  <label for="weather-updates" class="toggle-label"></label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Performance Settings -->
        <div class="card settings-card">
          <div class="card-header">
            <h2><i class="pi pi-cog"></i> Performance</h2>
          </div>
          <div class="card-content">
            <div class="performance-options">
              <div class="performance-option">
                <div class="performance-info">
                  <h3>Zoneless Mode</h3>
                  <p>Enable experimental zoneless change detection for better performance</p>
                </div>
                <div class="toggle-switch">
                  <input 
                    type="checkbox" 
                    id="zoneless-mode"
                    [checked]="zonelessMode()"
                    (change)="onZonelessToggle($event)"
                  >
                  <label for="zoneless-mode" class="toggle-label"></label>
                </div>
              </div>

              <div class="performance-option">
                <div class="performance-info">
                  <h3>OnPush Strategy</h3>
                  <p>Use OnPush change detection strategy for components</p>
                </div>
                <div class="toggle-switch">
                  <input 
                    type="checkbox" 
                    id="onpush-strategy"
                    [checked]="onPushStrategy()"
                    (change)="onPushToggle($event)"
                  >
                  <label for="onpush-strategy" class="toggle-label"></label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Data & Privacy -->
        <div class="card settings-card">
          <div class="card-header">
            <h2><i class="pi pi-shield"></i> Data & Privacy</h2>
          </div>
          <div class="card-content">
            <div class="data-options">
              <div class="data-option">
                <h3>Clear Cache</h3>
                <p>Clear all cached data to free up storage space</p>
                <button class="btn btn-secondary" (click)="clearCache()">
                  <i class="pi pi-trash"></i>
                  Clear Cache
                </button>
              </div>

              <div class="data-option">
                <h3>Export Data</h3>
                <p>Download all your trips and preferences as JSON</p>
                <button class="btn btn-secondary" (click)="exportData()">
                  <i class="pi pi-download"></i>
                  Export Data
                </button>
              </div>

              <div class="data-option">
                <h3>Reset Settings</h3>
                <p>Reset all settings to their default values</p>
                <button class="btn btn-secondary" (click)="resetSettings()">
                  <i class="pi pi-refresh"></i>
                  Reset Settings
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- About -->
        <div class="card settings-card">
          <div class="card-header">
            <h2><i class="pi pi-info-circle"></i> About</h2>
          </div>
          <div class="card-content">
            <div class="about-info">
              <div class="app-info">
                <h3>TravelMate</h3>
                <p>Version 1.0.0</p>
                <p>Your ultimate travel companion platform</p>
              </div>

              <div class="tech-info">
                <h4>Built with</h4>
                <div class="tech-badges">
                  <span class="tech-badge">Angular 17</span>
                  <span class="tech-badge">TypeScript</span>
                  <span class="tech-badge">RxJS</span>
                  <span class="tech-badge">Signals</span>
                  <span class="tech-badge">Standalone Components</span>
                </div>
              </div>

              <div class="links">
                <a href="#" class="link">Privacy Policy</a>
                <a href="#" class="link">Terms of Service</a>
                <a href="#" class="link">Support</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings {
      padding: 24px 0;
    }

    .settings-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .settings-header h1 {
      font-size: 32px;
      font-weight: 700;
      color: var(--primary-color);
      margin-bottom: 8px;
    }

    .settings-header p {
      color: var(--text-color);
      opacity: 0.7;
      font-size: 16px;
    }

    .settings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 24px;
    }

    .settings-card {
      background: var(--surface-color);
      border-radius: 12px;
      padding: 0;
      overflow: hidden;
    }

    .card-header {
      background: var(--background-color);
      padding: 20px 24px;
      border-bottom: 1px solid var(--border-color);
    }

    .card-header h2 {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 20px;
      font-weight: 600;
      margin: 0;
    }

    .card-header i {
      color: var(--primary-color);
    }

    .card-content {
      padding: 24px;
    }

    /* Theme Settings */
    .theme-options {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
    }

    .theme-option {
      position: relative;
    }

    .theme-option input[type="radio"] {
      position: absolute;
      opacity: 0;
      pointer-events: none;
    }

    .theme-label {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      padding: 16px;
      border: 2px solid var(--border-color);
      border-radius: 8px;
      transition: all 0.3s ease;
    }

    .theme-option input[type="radio"]:checked + .theme-label {
      border-color: var(--primary-color);
      background: var(--primary-color);
      color: white;
    }

    .theme-preview {
      width: 80px;
      height: 60px;
      border-radius: 6px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .theme-preview-header {
      height: 20px;
      background: #3B82F6;
    }

    .theme-preview-body {
      height: 40px;
    }

    .theme-preview.light .theme-preview-body {
      background: #F9FAFB;
    }

    .theme-preview.dark .theme-preview-body {
      background: #1F2937;
    }

    /* Form Styles */
    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      font-weight: 500;
      margin-bottom: 8px;
      color: var(--text-color);
    }

    .form-control {
      width: 100%;
      padding: 12px;
      border: 2px solid var(--border-color);
      border-radius: 8px;
      font-size: 16px;
      transition: border-color 0.3s ease;
      background: var(--surface-color);
      color: var(--text-color);
    }

    .form-control:focus {
      outline: none;
      border-color: var(--primary-color);
    }

    /* Notification Settings */
    .notification-options {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .notification-option {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border: 1px solid var(--border-color);
      border-radius: 8px;
    }

    .notification-info h3 {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .notification-info p {
      font-size: 14px;
      color: var(--text-color);
      opacity: 0.7;
      margin: 0;
    }

    /* Toggle Switch */
    .toggle-switch {
      position: relative;
    }

    .toggle-switch input[type="checkbox"] {
      opacity: 0;
      position: absolute;
      pointer-events: none;
    }

    .toggle-label {
      display: block;
      width: 50px;
      height: 28px;
      background: var(--border-color);
      border-radius: 14px;
      cursor: pointer;
      transition: background-color 0.3s ease;
      position: relative;
    }

    .toggle-label::after {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: 24px;
      height: 24px;
      background: white;
      border-radius: 50%;
      transition: transform 0.3s ease;
    }

    .toggle-switch input[type="checkbox"]:checked + .toggle-label {
      background: var(--primary-color);
    }

    .toggle-switch input[type="checkbox"]:checked + .toggle-label::after {
      transform: translateX(22px);
    }

    /* Performance Settings */
    .performance-options {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .performance-option {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border: 1px solid var(--border-color);
      border-radius: 8px;
    }

    .performance-info h3 {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .performance-info p {
      font-size: 14px;
      color: var(--text-color);
      opacity: 0.7;
      margin: 0;
    }

    /* Data & Privacy */
    .data-options {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .data-option {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border: 1px solid var(--border-color);
      border-radius: 8px;
    }

    .data-option h3 {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .data-option p {
      font-size: 14px;
      color: var(--text-color);
      opacity: 0.7;
      margin: 0;
    }

    /* About */
    .about-info {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .app-info h3 {
      font-size: 20px;
      font-weight: 600;
      color: var(--primary-color);
      margin-bottom: 8px;
    }

    .app-info p {
      margin: 4px 0;
      color: var(--text-color);
      opacity: 0.8;
    }

    .tech-info h4 {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 12px;
    }

    .tech-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .tech-badge {
      background: var(--primary-color);
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .links {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .link {
      color: var(--primary-color);
      text-decoration: none;
      font-weight: 500;
      transition: opacity 0.3s ease;
    }

    .link:hover {
      opacity: 0.8;
    }

    @media (max-width: 768px) {
      .settings-grid {
        grid-template-columns: 1fr;
      }
      
      .theme-options {
        grid-template-columns: 1fr;
      }
      
      .data-option {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
      }
    }
  `]
})
export class SettingsComponent {
  themeService = inject(ThemeService);
  private readonly fb = inject(FormBuilder);

  preferences = signal<UserPreferences>({
    theme: 'light',
    language: 'en',
    currency: 'USD',
    units: 'metric',
    notifications: true
  });

  zonelessMode = signal(false);
  onPushStrategy = signal(true);

  settingsForm: FormGroup = this.fb.group({
    language: ['en'],
    currency: ['USD'],
    units: ['metric']
  });

  constructor() {
    this.loadSettings();
  }

  private loadSettings(): void {
    const stored = localStorage.getItem('travel-app-settings');
    if (stored) {
      try {
        const settings = JSON.parse(stored);
        this.preferences.set(settings);
        this.settingsForm.patchValue(settings);
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }

  private saveSettings(): void {
    localStorage.setItem('travel-app-settings', JSON.stringify(this.preferences()));
  }

  onThemeChange(theme: 'light' | 'dark'): void {
    this.themeService.setTheme(theme);
    this.preferences.update(prefs => ({ ...prefs, theme }));
    this.saveSettings();
  }

  onLanguageChange(): void {
    const language = this.settingsForm.get('language')?.value;
    this.preferences.update(prefs => ({ ...prefs, language }));
    this.saveSettings();
    
    // Here you would typically reload the app with the new language
    console.log('Language changed to:', language);
  }

  onCurrencyChange(): void {
    const currency = this.settingsForm.get('currency')?.value;
    this.preferences.update(prefs => ({ ...prefs, currency }));
    this.saveSettings();
    
    console.log('Currency changed to:', currency);
  }

  onUnitsChange(): void {
    const units = this.settingsForm.get('units')?.value;
    this.preferences.update(prefs => ({ ...prefs, units }));
    this.saveSettings();
    
    console.log('Units changed to:', units);
  }

  onNotificationChange(type: string, event: Event): void {
    const enabled = (event.target as HTMLInputElement).checked;
    this.preferences.update(prefs => ({ ...prefs, notifications: enabled }));
    this.saveSettings();
    
    console.log(`${type} notifications:`, enabled);
  }

  onZonelessToggle(event: Event): void {
    const enabled = (event.target as HTMLInputElement).checked;
    this.zonelessMode.set(enabled);
    
    // This would typically require application restart
    console.log('Zoneless mode:', enabled);
  }

  onPushToggle(event: Event): void {
    const enabled = (event.target as HTMLInputElement).checked;
    this.onPushStrategy.set(enabled);
    
    console.log('OnPush strategy:', enabled);
  }

  clearCache(): void {
    if (confirm('Are you sure you want to clear all cached data?')) {
      // Clear various caches
      localStorage.removeItem('travel-app-trips');
      sessionStorage.clear();
      
      // Clear service worker cache if available
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name);
          });
        });
      }
      
      alert('Cache cleared successfully!');
    }
  }

  exportData(): void {
    const data = {
      trips: JSON.parse(localStorage.getItem('travel-app-trips') || '[]'),
      settings: this.preferences(),
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `travelmate-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  resetSettings(): void {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      const defaultSettings: UserPreferences = {
        theme: 'light',
        language: 'en',
        currency: 'USD',
        units: 'metric',
        notifications: true
      };

      this.preferences.set(defaultSettings);
      this.settingsForm.patchValue(defaultSettings);
      this.themeService.setTheme('light');
      this.zonelessMode.set(false);
      this.onPushStrategy.set(true);
      
      localStorage.removeItem('travel-app-settings');
      
      alert('Settings reset successfully!');
    }
  }
}