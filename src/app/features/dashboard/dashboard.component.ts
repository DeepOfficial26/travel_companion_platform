import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../shared/services/api.service';
import { TripService } from '../../shared/services/trip.service';
import { Location, Weather, Currency, Trip } from '../../shared/interfaces/travel.interface';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard container">
      <div class="dashboard-header">
        <h1>Welcome Back!</h1>
        <p>Your travel dashboard for {{ currentDate() }}</p>
      </div>

      <div class="grid grid-3">
        <!-- Current Location Card -->
        <div class="card location-card">
          <div class="card-header">
            <h3><i class="pi pi-map-marker"></i> Current Location</h3>
          </div>
          <div class="card-content">
            @if (currentLocation(); as loc) {
              <div class="location-info">
                <h4>{{ loc.name }}</h4>
                <p>{{ loc.country }}</p>
                <div class="coordinates">
                  <span>{{ loc.latitude.toFixed(2) }}°N</span>
                  <span>{{ loc.longitude.toFixed(2) }}°W</span>
                </div>
                <div class="timezone">
                  <i class="pi pi-clock"></i>
                  {{ currentTime() }}
                </div>
              </div>
            } @else {
              <div class="loading">
                <div class="spinner"></div>
              </div>
            }
          </div>
        </div>

        <!-- Weather Card -->
        <div class="card weather-card">
          <div class="card-header">
            <h3><i class="pi pi-sun"></i> Weather</h3>
          </div>
          <div class="card-content">
            @if (weather()) {
              <div class="weather-info">
                <div class="temperature">{{ weather()?.temperature }}°C</div>
                <div class="condition">{{ weather()?.condition }}</div>
                <div class="details">
                  <div class="detail">
                    <i class="pi pi-eye"></i>
                    <span>{{ weather()?.humidity }}% humidity</span>
                  </div>
                  <div class="detail">
                    <i class="pi pi-send"></i>
                    <span>{{ weather()?.windSpeed }} km/h</span>
                  </div>
                </div>
              </div>
            } @else {
              <div class="loading">
                <div class="spinner"></div>
              </div>
            }
          </div>
        </div>

        <!-- Currency Card -->
        <div class="card currency-card">
          <div class="card-header">
            <h3><i class="pi pi-dollar"></i> Exchange Rates</h3>
          </div>
          <div class="card-content">
            @if (currencies().length > 0) {
              <div class="currency-list">
                @for (currency of currencies(); track currency.code) {
                  <div class="currency-item">
                    <span class="currency-code">{{ currency.code }}</span>
                    <span class="currency-name">{{ currency.name }}</span>
                    <span class="currency-rate">{{ currency.rate }}</span>
                  </div>
                }
              </div>
            } @else {
              <div class="loading">
                <div class="spinner"></div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Trips Overview -->
      <div class="trips-overview">
        <h2>Your Trips</h2>
        <div class="grid grid-2">
          <div class="card">
            <div class="trip-stats">
              <div class="stat">
                <div class="stat-number">{{ activeTrips().length }}</div>
                <div class="stat-label">Active Trips</div>
              </div>
              <div class="stat">
                <div class="stat-number">{{ upcomingTrips().length }}</div>
                <div class="stat-label">Upcoming</div>
              </div>
              <div class="stat">
                <div class="stat-number">{{ completedTrips().length }}</div>
                <div class="stat-label">Completed</div>
              </div>
            </div>
          </div>

          <div class="card">
            <h3>Recent Activity</h3>
            <div class="activity-list">
              @if (recentTrips().length > 0) {
                @for (trip of recentTrips(); track trip.id) {
                  <div class="activity-item">
                    <div class="activity-icon">
                      <i class="pi pi-calendar"></i>
                    </div>
                    <div class="activity-content">
                      <div class="activity-title">{{ trip.title }}</div>
                      <div class="activity-date">{{ trip.destination.name }} • {{ formatDate(trip.startDate) }}</div>
                    </div>
                    <div class="activity-status" [class]="trip.status">
                      {{ trip.status }}
                    </div>
                  </div>
                }
              } @else {
                <div class="empty-state">
                  <i class="pi pi-calendar-plus"></i>
                  <p>No trips yet. Start planning your first adventure!</p>
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h2>Quick Actions</h2>
        <div class="grid grid-4">
          <button class="action-btn" (click)="navigateToTrips()">
            <i class="pi pi-plus"></i>
            <span>Plan New Trip</span>
          </button>
          <button class="action-btn" (click)="navigateToFlights()">
            <i class="pi pi-send"></i>
            <span>Search Flights</span>
          </button>
          <button class="action-btn" (click)="navigateToHotels()">
            <i class="pi pi-building"></i>
            <span>Find Hotels</span>
          </button>
          <button class="action-btn" (click)="navigateToSettings()">
            <i class="pi pi-cog"></i>
            <span>Settings</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      padding: 24px 0;
    }

    .dashboard-header {
      margin-bottom: 32px;
      text-align: center;
    }

    .dashboard-header h1 {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 8px;
      color: var(--primary-color);
    }

    .dashboard-header p {
      color: var(--text-color);
      opacity: 0.7;
      font-size: 16px;
    }

    .card-header {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
    }

    .card-header h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text-color);
      font-weight: 600;
    }

    .card-header i {
      color: var(--primary-color);
    }

    .location-info h4 {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .coordinates {
      display: flex;
      gap: 16px;
      margin: 8px 0;
      font-size: 14px;
      opacity: 0.7;
    }

    .timezone {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 12px;
      font-weight: 500;
    }

    .weather-info {
      text-align: center;
    }

    .temperature {
      font-size: 48px;
      font-weight: 700;
      color: var(--primary-color);
      margin-bottom: 8px;
    }

    .condition {
      font-size: 18px;
      font-weight: 500;
      margin-bottom: 16px;
    }

    .details {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .detail {
      display: flex;
      align-items: center;
      gap: 8px;
      justify-content: center;
    }

    .currency-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .currency-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid var(--border-color);
    }

    .currency-code {
      font-weight: 600;
      color: var(--primary-color);
    }

    .currency-name {
      flex: 1;
      margin-left: 12px;
      font-size: 14px;
      opacity: 0.8;
    }

    .currency-rate {
      font-weight: 600;
    }

    .trips-overview {
      margin: 48px 0;
    }

    .trips-overview h2 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 24px;
    }

    .trip-stats {
      display: flex;
      justify-content: space-around;
      text-align: center;
    }

    .stat {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .stat-number {
      font-size: 32px;
      font-weight: 700;
      color: var(--primary-color);
    }

    .stat-label {
      font-size: 14px;
      opacity: 0.7;
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 8px;
      background: var(--background-color);
    }

    .activity-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--primary-color);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .activity-content {
      flex: 1;
    }

    .activity-title {
      font-weight: 600;
      margin-bottom: 4px;
    }

    .activity-date {
      font-size: 14px;
      opacity: 0.7;
    }

    .activity-status {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .activity-status.planning {
      background: #FEF3C7;
      color: #92400E;
    }

    .activity-status.active {
      background: #D1FAE5;
      color: #065F46;
    }

    .activity-status.completed {
      background: #E0E7FF;
      color: #3730A3;
    }

    .empty-state {
      text-align: center;
      padding: 24px;
      opacity: 0.7;
    }

    .empty-state i {
      font-size: 48px;
      color: var(--primary-color);
      margin-bottom: 16px;
    }

    .quick-actions {
      margin-top: 48px;
    }

    .quick-actions h2 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 24px;
    }

    .action-btn {
      background: var(--surface-color);
      border: 2px solid var(--border-color);
      border-radius: 12px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      color: var(--text-color);
    }

    .action-btn:hover {
      border-color: var(--primary-color);
      background: var(--primary-color);
      color: white;
      transform: translateY(-2px);
    }

    .action-btn i {
      font-size: 32px;
    }

    .action-btn span {
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .dashboard-header h1 {
        font-size: 24px;
      }
      
      .temperature {
        font-size: 36px;
      }
      
      .trip-stats {
        flex-direction: column;
        gap: 16px;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly tripService = inject(TripService);

  currentLocation = signal<Location | null>(null);
  weather = signal<Weather | null>(null);
  currencies = signal<Currency[]>([]);
  currentTime = signal<string>('');

  activeTrips = this.tripService.activeTrips;
  upcomingTrips = this.tripService.upcomingTrips;
  completedTrips = this.tripService.completedTrips;

  recentTrips = computed(() => 
    this.tripService.trips()
      .sort((a: Trip, b: Trip) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 3)
  );

  currentDate = computed(() => {
    const today = new Date();
    return today.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  });

  ngOnInit(): void {
    this.loadDashboardData();
    this.startClock();
  }

  private loadDashboardData(): void {
    // Load user location
    this.apiService.getUserLocation().subscribe({
      next: (location: Location) => {
        this.currentLocation.set(location);
        this.loadWeather(location);
      },
      error: (error: any) => console.error('Error loading location:', error)
    });

    // Load currency rates
    this.apiService.getCurrencyRates().subscribe({
      next: (rates: Currency[]) => this.currencies.set(rates),
      error: (error: any) => console.error('Error loading currencies:', error)
    });
  }

  private loadWeather(location: Location): void {
    this.apiService.getWeather(location).subscribe({
      next: (weather: Weather) => this.weather.set(weather),
      error: (error: any) => console.error('Error loading weather:', error)
    });
  }

  private startClock(): void {
    const updateTime = () => {
      const now = new Date();
      this.currentTime.set(now.toLocaleTimeString());
    };
    
    updateTime();
    setInterval(updateTime, 1000);
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }

  navigateToTrips(): void {
    // Navigation logic will be implemented with routing
    console.log('Navigate to trips');
  }

  navigateToFlights(): void {
    console.log('Navigate to flights');
  }

  navigateToHotels(): void {
    console.log('Navigate to hotels');
  }

  navigateToSettings(): void {
    console.log('Navigate to settings');
  }
}