import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ApiService } from '../../shared/services/api.service';
import { Flight, Location } from '../../shared/interfaces/travel.interface';

@Component({
  selector: 'app-flights',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="flights container">
      <div class="flights-header">
        <h1>Search Flights</h1>
        <p>Find the best deals for your next trip</p>
      </div>

      <!-- Search Form -->
      <div class="card search-form">
        <form [formGroup]="searchForm" (ngSubmit)="searchFlights()">
          <div class="form-grid">
            <div class="form-group">
              <label for="from">From</label>
              <input 
                id="from"
                type="text" 
                formControlName="from"
                placeholder="Departure city"
                class="form-control"
                (input)="onFromSearch($event)"
              >
              @if (fromSuggestions().length > 0) {
                <div class="suggestions">
                  @for (suggestion of fromSuggestions(); track suggestion.id) {
                    <div 
                      class="suggestion-item"
                      (click)="selectFromCity(suggestion)"
                    >
                      <i class="pi pi-send"></i>
                      <span>{{ suggestion.name }}, {{ suggestion.country }}</span>
                    </div>
                  }
                </div>
              }
            </div>

            <div class="form-group">
              <label for="to">To</label>
              <input 
                id="to"
                type="text" 
                formControlName="to"
                placeholder="Destination city"
                class="form-control"
                (input)="onToSearch($event)"
              >
              @if (toSuggestions().length > 0) {
                <div class="suggestions">
                  @for (suggestion of toSuggestions(); track suggestion.id) {
                    <div 
                      class="suggestion-item"
                      (click)="selectToCity(suggestion)"
                    >
                      <i class="pi pi-map-marker"></i>
                      <span>{{ suggestion.name }}, {{ suggestion.country }}</span>
                    </div>
                  }
                </div>
              }
            </div>

            <div class="form-group">
              <label for="departure">Departure Date</label>
              <input 
                id="departure"
                type="date" 
                formControlName="departure"
                class="form-control"
                [min]="today"
              >
            </div>

            <div class="form-group">
              <label for="return">Return Date</label>
              <input 
                id="return"
                type="date" 
                formControlName="return"
                class="form-control"
                [min]="searchForm.get('departure')?.value || today"
              >
            </div>

            <div class="form-group">
              <label for="passengers">Passengers</label>
              <select 
                id="passengers"
                formControlName="passengers"
                class="form-control"
              >
                <option value="1">1 Passenger</option>
                <option value="2">2 Passengers</option>
                <option value="3">3 Passengers</option>
                <option value="4">4 Passengers</option>
                <option value="5">5+ Passengers</option>
              </select>
            </div>

            <div class="form-group">
              <label for="class">Class</label>
              <select 
                id="class"
                formControlName="class"
                class="form-control"
              >
                <option value="economy">Economy</option>
                <option value="business">Business</option>
                <option value="first">First Class</option>
              </select>
            </div>
          </div>

          <div class="form-actions">
            <button 
              type="submit"
              class="btn btn-primary"
              [disabled]="searchForm.invalid || isLoading()"
            >
              @if (isLoading()) {
                <div class="spinner-small"></div>
              } @else {
                <i class="pi pi-search"></i>
              }
              Search Flights
            </button>
          </div>
        </form>
      </div>

      <!-- Search Results -->
      @if (isLoading()) {
        <div class="loading">
          <div class="spinner"></div>
          <p>Searching for flights...</p>
        </div>
      } @else if (flights().length > 0) {
        <div class="results-section">
          <div class="results-header">
            <h2>Found {{ flights().length }} flights</h2>
            <div class="sort-options">
              <label>Sort by:</label>
              <select (change)="onSortChange($event)" class="sort-select">
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="duration-asc">Duration: Short to Long</option>
                <option value="departure-asc">Departure Time</option>
              </select>
            </div>
          </div>

          <div class="flights-list">
            @for (flight of sortedFlights(); track flight.id) {
              <div class="flight-card">
                <div class="flight-header">
                  <div class="airline-info">
                    <h3>{{ flight.airline }}</h3>
                    <span class="flight-number">{{ flight.flightNumber }}</span>
                  </div>
                  <div class="flight-class">
                    <span class="class-badge" [class]="flight.class">
                      {{ flight.class }}
                    </span>
                  </div>
                </div>

                <div class="flight-details">
                  <div class="flight-route">
                    <div class="departure">
                      <div class="airport">{{ flight.departure.airport }}</div>
                      <div class="city">{{ flight.departure.city }}</div>
                      <div class="time">{{ flight.departure.time }}</div>
                      <div class="date">{{ formatDate(flight.departure.date) }}</div>
                    </div>

                    <div class="route-line">
                      <div class="duration">{{ flight.duration }}</div>
                      <div class="line"></div>
                      <i class="pi pi-send"></i>
                    </div>

                    <div class="arrival">
                      <div class="airport">{{ flight.arrival.airport }}</div>
                      <div class="city">{{ flight.arrival.city }}</div>
                      <div class="time">{{ flight.arrival.time }}</div>
                      <div class="date">{{ formatDate(flight.arrival.date) }}</div>
                    </div>
                  </div>

                  <div class="flight-price">
                    <div class="price">
                      <span class="amount">{{ flight.price }}</span>
                      <span class="currency">{{ flight.currency }}</span>
                    </div>
                    <div class="per-person">per person</div>
                  </div>
                </div>

                <div class="flight-actions">
                  <button 
                    class="btn btn-primary"
                    (click)="selectFlight(flight)"
                  >
                    Select Flight
                  </button>
                  <button 
                    class="btn btn-secondary"
                    (click)="viewDetails(flight)"
                  >
                    View Details
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      } @else if (hasSearched()) {
        <div class="empty-state">
          <i class="pi pi-search"></i>
          <h3>No flights found</h3>
          <p>Try adjusting your search criteria</p>
        </div>
      } @else {
        <div class="empty-state">
          <i class="pi pi-send"></i>
          <h3>Search for flights</h3>
          <p>Enter your travel details to find the best flight deals</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .flights {
      padding: 24px 0;
    }

    .flights-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .flights-header h1 {
      font-size: 32px;
      font-weight: 700;
      color: var(--primary-color);
      margin-bottom: 8px;
    }

    .flights-header p {
      color: var(--text-color);
      opacity: 0.7;
      font-size: 16px;
    }

    .search-form {
      margin-bottom: 32px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .form-group {
      position: relative;
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

    .suggestions {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: var(--surface-color);
      border: 2px solid var(--border-color);
      border-top: none;
      border-radius: 0 0 8px 8px;
      max-height: 200px;
      overflow-y: auto;
      z-index: 1000;
    }

    .suggestion-item {
      padding: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: background-color 0.2s ease;
    }

    .suggestion-item:hover {
      background: var(--background-color);
    }

    .suggestion-item i {
      color: var(--primary-color);
    }

    .form-actions {
      display: flex;
      justify-content: center;
    }

    .spinner-small {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .loading {
      text-align: center;
      padding: 48px;
    }

    .loading p {
      margin-top: 16px;
      font-size: 16px;
      opacity: 0.7;
    }

    .results-section {
      margin-top: 32px;
    }

    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .results-header h2 {
      font-size: 24px;
      font-weight: 600;
    }

    .sort-options {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .sort-select {
      padding: 8px 12px;
      border: 2px solid var(--border-color);
      border-radius: 6px;
      background: var(--surface-color);
      color: var(--text-color);
    }

    .flights-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .flight-card {
      background: var(--surface-color);
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      border: 2px solid transparent;
    }

    .flight-card:hover {
      border-color: var(--primary-color);
      transform: translateY(-2px);
    }

    .flight-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .airline-info h3 {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .flight-number {
      color: var(--text-color);
      opacity: 0.7;
      font-size: 14px;
    }

    .class-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .class-badge.economy {
      background: #E0E7FF;
      color: #3730A3;
    }

    .class-badge.business {
      background: #FEF3C7;
      color: #92400E;
    }

    .class-badge.first {
      background: #D1FAE5;
      color: #065F46;
    }

    .flight-details {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .flight-route {
      display: flex;
      align-items: center;
      gap: 32px;
      flex: 1;
    }

    .departure,
    .arrival {
      text-align: center;
    }

    .airport {
      font-size: 24px;
      font-weight: 700;
      color: var(--primary-color);
    }

    .city {
      font-size: 14px;
      opacity: 0.7;
      margin-bottom: 4px;
    }

    .time {
      font-size: 18px;
      font-weight: 600;
    }

    .date {
      font-size: 14px;
      opacity: 0.7;
    }

    .route-line {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      flex: 1;
    }

    .duration {
      font-size: 14px;
      font-weight: 500;
      color: var(--primary-color);
    }

    .line {
      height: 2px;
      background: var(--border-color);
      width: 100%;
      position: relative;
    }

    .route-line i {
      color: var(--primary-color);
      font-size: 20px;
    }

    .flight-price {
      text-align: center;
      margin-left: 24px;
    }

    .price {
      display: flex;
      align-items: baseline;
      gap: 4px;
      justify-content: center;
    }

    .amount {
      font-size: 32px;
      font-weight: 700;
      color: var(--primary-color);
    }

    .currency {
      font-size: 18px;
      font-weight: 500;
      color: var(--text-color);
    }

    .per-person {
      font-size: 14px;
      opacity: 0.7;
    }

    .flight-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    .empty-state {
      text-align: center;
      padding: 48px;
      color: var(--text-color);
      opacity: 0.7;
    }

    .empty-state i {
      font-size: 64px;
      color: var(--primary-color);
      margin-bottom: 16px;
    }

    .empty-state h3 {
      font-size: 24px;
      margin-bottom: 8px;
    }

    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
      
      .results-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }
      
      .flight-route {
        flex-direction: column;
        gap: 16px;
      }
      
      .flight-details {
        flex-direction: column;
        gap: 20px;
      }
      
      .flight-price {
        margin-left: 0;
      }
      
      .flight-actions {
        justify-content: center;
      }
    }
  `]
})
export class FlightsComponent implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly fb = inject(FormBuilder);

  flights = signal<Flight[]>([]);
  isLoading = signal(false);
  hasSearched = signal(false);
  fromSuggestions = signal<Location[]>([]);
  toSuggestions = signal<Location[]>([]);
  sortBy = signal('price-asc');

  today = new Date().toISOString().split('T')[0];

  searchForm: FormGroup = this.fb.group({
    from: ['', Validators.required],
    to: ['', Validators.required],
    departure: ['', Validators.required],
    return: [''],
    passengers: [1, Validators.required],
    class: ['economy', Validators.required],
    fromCity: [null],
    toCity: [null]
  });

  ngOnInit(): void {
    // Set default departure date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.searchForm.patchValue({
      departure: tomorrow.toISOString().split('T')[0]
    });
  }

  sortedFlights = computed(() => {
    const flights = [...this.flights()];
    const sortBy = this.sortBy();
    
    return flights.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'duration-asc':
          return a.duration.localeCompare(b.duration);
        case 'departure-asc':
          return a.departure.time.localeCompare(b.departure.time);
        default:
          return 0;
      }
    });
  });

  onFromSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    if (query.length > 2) {
      this.apiService.searchCities(query).subscribe({
        next: (cities) => this.fromSuggestions.set(cities),
        error: (error) => console.error('Error searching cities:', error)
      });
    } else {
      this.fromSuggestions.set([]);
    }
  }

  onToSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    if (query.length > 2) {
      this.apiService.searchCities(query).subscribe({
        next: (cities) => this.toSuggestions.set(cities),
        error: (error) => console.error('Error searching cities:', error)
      });
    } else {
      this.toSuggestions.set([]);
    }
  }

  selectFromCity(city: Location): void {
    this.searchForm.patchValue({
      from: `${city.name}, ${city.country}`,
      fromCity: city
    });
    this.fromSuggestions.set([]);
  }

  selectToCity(city: Location): void {
    this.searchForm.patchValue({
      to: `${city.name}, ${city.country}`,
      toCity: city
    });
    this.toSuggestions.set([]);
  }

  searchFlights(): void {
    if (this.searchForm.valid) {
      this.isLoading.set(true);
      this.hasSearched.set(true);
      
      const { from, to, departure } = this.searchForm.value;
      
      this.apiService.searchFlights(from, to, departure).subscribe({
        next: (flights) => {
          this.flights.set(flights);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error searching flights:', error);
          this.isLoading.set(false);
          this.flights.set([]);
        }
      });
    }
  }

  onSortChange(event: Event): void {
    const sortBy = (event.target as HTMLSelectElement).value;
    this.sortBy.set(sortBy);
  }

  selectFlight(flight: Flight): void {
    console.log('Selected flight:', flight);
    // Implementation for flight selection
  }

  viewDetails(flight: Flight): void {
    console.log('View flight details:', flight);
    // Implementation for viewing flight details
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }
}