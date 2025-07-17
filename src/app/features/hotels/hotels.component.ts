import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../shared/services/api.service';
import { Hotel } from '../../shared/interfaces/travel.interface';

@Component({
  selector: 'app-hotels',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="hotels container">
      <div class="hotels-header">
        <h1>Find Hotels</h1>
        <p>Discover the perfect accommodation for your stay</p>
      </div>

      <!-- Search Form -->
      <div class="card search-form">
        <form [formGroup]="searchForm" (ngSubmit)="searchHotels()">
          <div class="form-grid">
            <div class="form-group">
              <label for="location">Location</label>
              <input 
                id="location"
                type="text" 
                formControlName="location"
                placeholder="Enter city or destination"
                class="form-control"
              >
            </div>

            <div class="form-group">
              <label for="checkIn">Check-in Date</label>
              <input 
                id="checkIn"
                type="date" 
                formControlName="checkIn"
                class="form-control"
                [min]="today"
              >
            </div>

            <div class="form-group">
              <label for="checkOut">Check-out Date</label>
              <input 
                id="checkOut"
                type="date" 
                formControlName="checkOut"
                class="form-control"
                [min]="searchForm.get('checkIn')?.value || today"
              >
            </div>

            <div class="form-group">
              <label for="guests">Guests</label>
              <select 
                id="guests"
                formControlName="guests"
                class="form-control"
              >
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="3">3 Guests</option>
                <option value="4">4 Guests</option>
                <option value="5">5+ Guests</option>
              </select>
            </div>

            <div class="form-group">
              <label for="priceRange">Price Range</label>
              <select 
                id="priceRange"
                formControlName="priceRange"
                class="form-control"
              >
                <option value="all">All Prices</option>
                <option value="budget">Budget (Under $100)</option>
                <option value="mid">Mid-range ($100-$250)</option>
                <option value="luxury">Luxury ($250+)</option>
              </select>
            </div>

            <div class="form-group">
              <label for="rating">Minimum Rating</label>
              <select 
                id="rating"
                formControlName="rating"
                class="form-control"
              >
                <option value="0">Any Rating</option>
                <option value="3">3+ Stars</option>
                <option value="4">4+ Stars</option>
                <option value="5">5 Stars</option>
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
              Search Hotels
            </button>
          </div>
        </form>
      </div>

      <!-- Search Results -->
      @if (isLoading()) {
        <div class="loading">
          <div class="spinner"></div>
          <p>Searching for hotels...</p>
        </div>
      } @else if (hotels().length > 0) {
        <div class="results-section">
          <div class="results-header">
            <h2>Found {{ filteredHotels().length }} hotels</h2>
            <div class="view-options">
              <button 
                class="view-btn"
                [class.active]="viewMode() === 'grid'"
                (click)="setViewMode('grid')"
              >
                <i class="pi pi-th-large"></i>
                Grid
              </button>
              <button 
                class="view-btn"
                [class.active]="viewMode() === 'list'"
                (click)="setViewMode('list')"
              >
                <i class="pi pi-list"></i>
                List
              </button>
            </div>
          </div>

          <div class="hotels-list" [class]="viewMode()">
            @for (hotel of filteredHotels(); track hotel.id) {
              <div class="hotel-card">
                <div class="hotel-image">
                  <img 
                    [src]="hotel.images[0]" 
                    [alt]="hotel.name"
                    (error)="onImageError($event)"
                  >
                  <div class="hotel-rating">
                    <i class="pi pi-star-fill"></i>
                    <span>{{ hotel.rating }}</span>
                  </div>
                </div>

                <div class="hotel-content">
                  <div class="hotel-header">
                    <h3>{{ hotel.name }}</h3>
                    <div class="hotel-location">
                      <i class="pi pi-map-marker"></i>
                      <span>{{ hotel.location.name }}, {{ hotel.location.country }}</span>
                    </div>
                  </div>

                  <div class="hotel-description">
                    <p>{{ hotel.description }}</p>
                  </div>

                  <div class="hotel-amenities">
                    @for (amenity of hotel.amenities.slice(0, 4); track amenity) {
                      <span class="amenity-badge">{{ amenity }}</span>
                    }
                    @if (hotel.amenities.length > 4) {
                      <span class="amenity-more">+{{ hotel.amenities.length - 4 }} more</span>
                    }
                  </div>

                  <div class="hotel-details">
                    <div class="check-times">
                      <div class="check-time">
                        <i class="pi pi-clock"></i>
                        <span>Check-in: {{ hotel.checkIn }}</span>
                      </div>
                      <div class="check-time">
                        <i class="pi pi-clock"></i>
                        <span>Check-out: {{ hotel.checkOut }}</span>
                      </div>
                    </div>

                    <div class="reviews">
                      <i class="pi pi-star"></i>
                      <span>{{ hotel.reviewCount }} reviews</span>
                    </div>
                  </div>
                </div>

                <div class="hotel-price">
                  <div class="price">
                    <span class="amount">{{ hotel.price }}</span>
                    <span class="currency">{{ hotel.currency }}</span>
                  </div>
                  <div class="per-night">per night</div>
                  
                  <div class="hotel-actions">
                    <button 
                      class="btn btn-secondary"
                      (click)="viewHotelDetails(hotel)"
                    >
                      View Details
                    </button>
                    <button 
                      class="btn btn-primary"
                      (click)="bookHotel(hotel)"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      } @else if (hasSearched()) {
        <div class="empty-state">
          <i class="pi pi-search"></i>
          <h3>No hotels found</h3>
          <p>Try adjusting your search criteria or location</p>
        </div>
      } @else {
        <div class="empty-state">
          <i class="pi pi-building"></i>
          <h3>Search for hotels</h3>
          <p>Enter your travel details to find the perfect accommodation</p>
        </div>
      }

      <!-- Hotel Details Modal -->
      @if (selectedHotel(); as hotel) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>{{ hotel.name }}</h2>
              <button class="close-btn" (click)="closeModal()">
                <i class="pi pi-times"></i>
              </button>
            </div>

            <div class="modal-body">
              <div class="hotel-gallery">
                @if (hotel.images && hotel.images.length > 0) {
                  <img
                    [src]="hotel.images[0]"
                    [alt]="hotel.name"
                    class="main-image"
                  >
                }
              </div>

              <div class="hotel-info">
                <div class="hotel-rating-large">
                  <i class="pi pi-star-fill"></i>
                  <span>{{ hotel.rating }}</span>
                  <span class="review-count">({{ hotel.reviewCount }} reviews)</span>
                </div>

                <div class="hotel-location-large">
                  <i class="pi pi-map-marker"></i>
                  <span>{{ hotel.location.name }}, {{ hotel.location.country }}</span>
                </div>

                <div class="hotel-description-full">
                  <h3>About this property</h3>
                  <p>{{ hotel.description }}</p>
                </div>

                <div class="hotel-amenities-full">
                  <h3>Amenities</h3>
                  <div class="amenities-grid">
                    @for (amenity of hotel.amenities; track amenity) {
                      <div class="amenity-item">
                        <i class="pi pi-check"></i>
                        <span>{{ amenity }}</span>
                      </div>
                    }
                  </div>
                </div>

                <div class="hotel-policies">
                  <h3>Policies</h3>
                  <div class="policies-grid">
                    <div class="policy-item">
                      <i class="pi pi-clock"></i>
                      <div>
                        <strong>Check-in:</strong> {{ hotel.checkIn }}
                      </div>
                    </div>
                    <div class="policy-item">
                      <i class="pi pi-clock"></i>
                      <div>
                        <strong>Check-out:</strong> {{ hotel.checkOut }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <div class="price-info">
                <div class="price-large">
                  <span class="amount">{{ hotel.price }}</span>
                  <span class="currency">{{ hotel.currency }}</span>
                </div>
                <div class="per-night">per night</div>
              </div>
              <button class="btn btn-primary" (click)="bookHotel(hotel)">
                Book Now
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .hotels {
      padding: 24px 0;
    }

    .hotels-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .hotels-header h1 {
      font-size: 32px;
      font-weight: 700;
      color: var(--primary-color);
      margin-bottom: 8px;
    }

    .hotels-header p {
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

    .view-options {
      display: flex;
      gap: 8px;
    }

    .view-btn {
      padding: 8px 16px;
      border: 2px solid var(--border-color);
      border-radius: 6px;
      background: var(--surface-color);
      color: var(--text-color);
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .view-btn:hover {
      border-color: var(--primary-color);
    }

    .view-btn.active {
      background: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
    }

    .hotels-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .hotels-list.grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 24px;
    }

    .hotel-card {
      background: var(--surface-color);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      border: 2px solid transparent;
    }

    .hotel-card:hover {
      border-color: var(--primary-color);
      transform: translateY(-2px);
    }

    .hotels-list.list .hotel-card {
      display: flex;
      flex-direction: row;
    }

    .hotels-list.grid .hotel-card {
      display: flex;
      flex-direction: column;
    }

    .hotel-image {
      position: relative;
      height: 200px;
      overflow: hidden;
    }

    .hotels-list.list .hotel-image {
      width: 250px;
      height: 180px;
      flex-shrink: 0;
    }

    .hotel-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .hotel-rating {
      position: absolute;
      top: 12px;
      right: 12px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 4px 8px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .hotel-rating i {
      color: #FCD34D;
    }

    .hotel-content {
      padding: 20px;
      flex: 1;
    }

    .hotel-header {
      margin-bottom: 12px;
    }

    .hotel-header h3 {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .hotel-location {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--text-color);
      opacity: 0.7;
      font-size: 14px;
    }

    .hotel-location i {
      color: var(--primary-color);
    }

    .hotel-description {
      margin-bottom: 16px;
    }

    .hotel-description p {
      color: var(--text-color);
      opacity: 0.8;
      line-height: 1.5;
    }

    .hotel-amenities {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 16px;
    }

    .amenity-badge {
      background: var(--background-color);
      color: var(--text-color);
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .amenity-more {
      color: var(--primary-color);
      font-size: 12px;
      font-weight: 500;
    }

    .hotel-details {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .check-times {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .check-time {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      color: var(--text-color);
      opacity: 0.7;
    }

    .check-time i {
      color: var(--primary-color);
    }

    .reviews {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      color: var(--text-color);
      opacity: 0.7;
    }

    .reviews i {
      color: #FCD34D;
    }

    .hotel-price {
      padding: 20px;
      border-top: 1px solid var(--border-color);
      text-align: center;
    }

    .hotels-list.list .hotel-price {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 180px;
      border-top: none;
      border-left: 1px solid var(--border-color);
    }

    .price {
      display: flex;
      align-items: baseline;
      gap: 4px;
      justify-content: center;
      margin-bottom: 4px;
    }

    .amount {
      font-size: 28px;
      font-weight: 700;
      color: var(--primary-color);
    }

    .currency {
      font-size: 16px;
      font-weight: 500;
      color: var(--text-color);
    }

    .per-night {
      font-size: 14px;
      opacity: 0.7;
      margin-bottom: 16px;
    }

    .hotel-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
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

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }

    .modal-content {
      background: var(--surface-color);
      border-radius: 12px;
      max-width: 800px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
      border-bottom: 1px solid var(--border-color);
    }

    .modal-header h2 {
      font-size: 24px;
      font-weight: 600;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: var(--text-color);
      padding: 8px;
      border-radius: 50%;
      transition: background-color 0.3s ease;
    }

    .close-btn:hover {
      background: var(--background-color);
    }

    .modal-body {
      padding: 24px;
    }

    .hotel-gallery {
      margin-bottom: 24px;
    }

    .main-image {
      width: 100%;
      height: 300px;
      object-fit: cover;
      border-radius: 8px;
    }

    .hotel-info {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .hotel-rating-large {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 600;
    }

    .hotel-rating-large i {
      color: #FCD34D;
      font-size: 20px;
    }

    .review-count {
      color: var(--text-color);
      opacity: 0.7;
      font-weight: 400;
    }

    .hotel-location-large {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      color: var(--text-color);
      opacity: 0.7;
    }

    .hotel-location-large i {
      color: var(--primary-color);
    }

    .hotel-description-full h3,
    .hotel-amenities-full h3,
    .hotel-policies h3 {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 12px;
    }

    .amenities-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
    }

    .amenity-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .amenity-item i {
      color: var(--secondary-color);
    }

    .policies-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .policy-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .policy-item i {
      color: var(--primary-color);
    }

    .modal-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
      border-top: 1px solid var(--border-color);
    }

    .price-info {
      text-align: left;
    }

    .price-large {
      display: flex;
      align-items: baseline;
      gap: 4px;
      margin-bottom: 4px;
    }

    .price-large .amount {
      font-size: 32px;
      font-weight: 700;
      color: var(--primary-color);
    }

    .price-large .currency {
      font-size: 20px;
      font-weight: 500;
      color: var(--text-color);
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
      
      .hotels-list.grid {
        grid-template-columns: 1fr;
      }
      
      .hotels-list.list .hotel-card {
        flex-direction: column;
      }
      
      .hotels-list.list .hotel-image {
        width: 100%;
        height: 200px;
      }
      
      .hotels-list.list .hotel-price {
        width: 100%;
        border-left: none;
        border-top: 1px solid var(--border-color);
      }
      
      .modal-content {
        margin: 0;
        border-radius: 0;
        max-height: 100vh;
      }
      
      .amenities-grid {
        grid-template-columns: 1fr;
      }
      
      .modal-footer {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }
    }
  `]
})
export class HotelsComponent {
  private readonly apiService = inject(ApiService);
  private readonly fb = inject(FormBuilder);

  hotels = signal<Hotel[]>([]);
  isLoading = signal(false);
  hasSearched = signal(false);
  viewMode = signal<'grid' | 'list'>('grid');
  selectedHotel = signal<Hotel | null>(null);

  today = new Date().toISOString().split('T')[0];

  searchForm: FormGroup = this.fb.group({
    location: ['', Validators.required],
    checkIn: ['', Validators.required],
    checkOut: ['', Validators.required],
    guests: [2, Validators.required],
    priceRange: ['all'],
    rating: [0]
  });

  filteredHotels = computed(() => {
    let filtered = this.hotels();
    const { priceRange, rating } = this.searchForm.value;

    if (priceRange !== 'all') {
      filtered = filtered.filter((hotel: Hotel) => {
        switch (priceRange) {
          case 'budget':
            return hotel.price < 100;
          case 'mid':
            return hotel.price >= 100 && hotel.price <= 250;
          case 'luxury':
            return hotel.price > 250;
          default:
            return true;
        }
      });
    }

    if (rating > 0) {
      filtered = filtered.filter((hotel: Hotel) => hotel.rating >= rating);
    }

    return filtered;
  });

  constructor() {
    // Set default check-in date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    
    this.searchForm.patchValue({
      checkIn: tomorrow.toISOString().split('T')[0],
      checkOut: dayAfterTomorrow.toISOString().split('T')[0]
    });
  }

  searchHotels(): void {
    if (this.searchForm.valid) {
      this.isLoading.set(true);
      this.hasSearched.set(true);
      
      const { location, checkIn, checkOut } = this.searchForm.value;
      
      this.apiService.searchHotels(location, checkIn, checkOut).subscribe({
        next: (hotels: Hotel[]) => {
          this.hotels.set(hotels);
          this.isLoading.set(false);
        },
        error: (error: any) => {
          console.error('Error searching hotels:', error);
          this.isLoading.set(false);
          this.hotels.set([]);
        }
      });
    }
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode.set(mode);
  }

  viewHotelDetails(hotel: Hotel): void {
    this.selectedHotel.set(hotel);
  }

  closeModal(): void {
    this.selectedHotel.set(null);
  }

  bookHotel(hotel: Hotel): void {
    console.log('Booking hotel:', hotel);
    // Implementation for hotel booking
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg';
  }
}