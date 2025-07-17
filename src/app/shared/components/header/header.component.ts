import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="header">
      <div class="container">
        <div class="header-content">
          <div class="logo">
            <i class="pi pi-compass"></i>
            <span>TravelMate</span>
          </div>
          
          <nav class="nav">
            <a routerLink="/dashboard" routerLinkActive="active">
              <i class="pi pi-home"></i>
              Dashboard
            </a>
            <a routerLink="/trips" routerLinkActive="active">
              <i class="pi pi-calendar"></i>
              Trips
            </a>
            <a routerLink="/search/flights" routerLinkActive="active">
              <i class="pi pi-send"></i>
              Flights
            </a>
            <a routerLink="/search/hotels" routerLinkActive="active">
              <i class="pi pi-building"></i>
              Hotels
            </a>
            <a routerLink="/settings" routerLinkActive="active">
              <i class="pi pi-cog"></i>
              Settings
            </a>
          </nav>
          
          <div class="header-actions">
            <button 
              class="theme-toggle"
              (click)="toggleTheme()"
              [attr.aria-label]="themeService.theme() === 'light' ? 'Switch to dark mode' : 'Switch to light mode'"
            >
              <i [class]="themeService.theme() === 'light' ? 'pi pi-moon' : 'pi pi-sun'"></i>
            </button>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background: var(--surface-color);
      border-bottom: 1px solid var(--border-color);
      padding: 0;
      position: sticky;
      top: 0;
      z-index: 1000;
      backdrop-filter: blur(10px);
    }

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 0;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 24px;
      font-weight: 700;
      color: var(--primary-color);
    }

    .logo i {
      font-size: 28px;
    }

    .nav {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .nav a {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      border-radius: 8px;
      text-decoration: none;
      color: var(--text-color);
      font-weight: 500;
      transition: all 0.3s ease;
      opacity: 0.8;
    }

    .nav a:hover {
      background: var(--primary-color);
      color: white;
      opacity: 1;
      transform: translateY(-1px);
    }

    .nav a.active {
      background: var(--primary-color);
      color: white;
      opacity: 1;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .theme-toggle {
      background: none;
      border: 2px solid var(--border-color);
      border-radius: 50%;
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      color: var(--text-color);
    }

    .theme-toggle:hover {
      border-color: var(--primary-color);
      background: var(--primary-color);
      color: white;
      transform: scale(1.1);
    }

    .theme-toggle i {
      font-size: 18px;
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        gap: 16px;
      }
      
      .nav {
        flex-wrap: wrap;
        justify-content: center;
      }
      
      .nav a {
        font-size: 14px;
        padding: 8px 12px;
      }
    }
  `]
})
export class HeaderComponent {
  themeService = inject(ThemeService);

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}