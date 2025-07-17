import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TripService } from '../../shared/services/trip.service';
import { ApiService } from '../../shared/services/api.service';
import { Trip, Location } from '../../shared/interfaces/travel.interface';

@Component({
  selector: 'app-trips',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="trips container">
      <div class="trips-header">
        <h1>My Trips</h1>
        <button class="btn btn-primary" (click)="showCreateForm()">
          <i class="pi pi-plus"></i>
          Create New Trip
        </button>
      </div>

      <!-- Create Trip Form -->
      @if (showForm()) {
        <div class="card create-trip-form">
          <h2>{{ editingTrip() ? 'Edit' : 'Create New' }} Trip</h2>
          
          <form [formGroup]="tripForm" (ngSubmit)="onSubmit()">
            <div class="form-grid">
              <div class="form-group">
                <label for="title">Trip Title</label>
                <input 
                  id="title"
                  type="text" 
                  formControlName="title"
                  placeholder="Enter trip title"
                  class="form-control"
                >
                @if (tripForm.get('title')?.errors?.['required'] && tripForm.get('title')?.touched) {
                  <div class="error-message">Trip title is required</div>
                }
              </div>

              <div class="form-group">
                <label for="destination">Destination</label>
                <input 
                  id="destination"
                  type="text" 
                  formControlName="destinationName"
                  placeholder="Search destination..."
                  class="form-control"
                  (input)="onDestinationSearch($event)"
                >
                @if (destinationSuggestions().length > 0) {
                  <div class="suggestions">
                    @for (suggestion of destinationSuggestions(); track suggestion.id) {
                      <div 
                        class="suggestion-item"
                        (click)="selectDestination(suggestion)"
                      >
                        <i class="pi pi-map-marker"></i>
                        <span>{{ suggestion.name }}, {{ suggestion.country }}</span>
                      </div>
                    }
                  </div>
                }
              </div>

              <div class="form-group">
                <label for="startDate">Start Date</label>
                <input 
                  id="startDate"
                  type="date" 
                  formControlName="startDate"
                  class="form-control"
                >
              </div>

              <div class="form-group">
                <label for="endDate">End Date</label>
                <input 
                  id="endDate"
                  type="date" 
                  formControlName="endDate"
                  class="form-control"
                >
              </div>

              <div class="form-group">
                <label for="budget">Budget</label>
                <input 
                  id="budget"
                  type="number" 
                  formControlName="budget"
                  placeholder="0"
                  class="form-control"
                  min="0"
                >
              </div>

              <div class="form-group">
                <label for="currency">Currency</label>
                <select 
                  id="currency"
                  formControlName="currency"
                  class="form-control"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="JPY">JPY</option>
                </select>
              </div>

              <div class="form-group full-width">
                <label for="notes">Notes</label>
                <textarea 
                  id="notes"
                  formControlName="notes"
                  placeholder="Add any additional notes..."
                  class="form-control"
                  rows="3"
                ></textarea>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-secondary" (click)="cancelForm()">
                Cancel
              </button>
              <button 
                type="submit" 
                class="btn btn-primary"
                [disabled]="tripForm.invalid"
              >
                {{ editingTrip() ? 'Update' : 'Create' }} Trip
              </button>
            </div>
          </form>
        </div>
      }

      <!-- Trip Status Filters -->
      <div class="trip-filters">
        <button 
          class="filter-btn"
          [class.active]="currentFilter() === 'all'"
          (click)="setFilter('all')"
        >
          All Trips ({{ allTrips().length }})
        </button>
        <button 
          class="filter-btn"
          [class.active]="currentFilter() === 'planning'"
          (click)="setFilter('planning')"
        >
          Planning ({{ tripService.upcomingTrips().length }})
        </button>
        <button 
          class="filter-btn"
          [class.active]="currentFilter() === 'active'"
          (click)="setFilter('active')"
        >
          Active ({{ tripService.activeTrips().length }})
        </button>
        <button 
          class="filter-btn"
          [class.active]="currentFilter() === 'completed'"
          (click)="setFilter('completed')"
        >
          Completed ({{ tripService.completedTrips().length }})
        </button>
      </div>

      <!-- Trips List -->
      <div class="trips-list">
        @if (filteredTrips().length === 0) {
          <div class="empty-state">
            <i class="pi pi-calendar-plus"></i>
            <h3>No trips found</h3>
            <p>{{ getEmptyStateMessage() }}</p>
          </div>
        } @else {
          <div class="grid grid-2">
            @for (trip of filteredTrips(); track trip.id) {
              <div class="trip-card">
                <div class="trip-header">
                  <h3>{{ trip.title }}</h3>
                  <div class="trip-status" [class]="trip.status">
                    {{ trip.status }}
                  </div>
                </div>
                
                <div class="trip-details">
                  <div class="trip-destination">
                    <i class="pi pi-map-marker"></i>
                    <span>{{ trip.destination.name }}, {{ trip.destination.country }}</span>
                  </div>
                  
                  <div class="trip-dates">
                    <i class="pi pi-calendar"></i>
                    <span>{{ formatDate(trip.startDate) }} - {{ formatDate(trip.endDate) }}</span>
                  </div>
                  
                  <div class="trip-duration">
                    <i class="pi pi-clock"></i>
                    <span>{{ calculateDuration(trip) }} days</span>
                  </div>
                  
                  <div class="trip-budget">
                    <i class="pi pi-dollar"></i>
                    <span>{{ trip.budget }} {{ trip.currency }}</span>
                  </div>
                  
                  @if (trip.notes) {
                    <div class="trip-notes">
                      <i class="pi pi-file-text"></i>
                      <span>{{ trip.notes }}</span>
                    </div>
                  }
                </div>
                
                <div class="trip-actions">
                  <button 
                    class="action-btn"
                    (click)="editTrip(trip)"
                  >
                    <i class="pi pi-pencil"></i>
                    Edit
                  </button>
                  <button 
                    class="action-btn delete"
                    (click)="deleteTrip(trip.id)"
                  >
                    <i class="pi pi-trash"></i>
                    Delete
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .trips {
      padding: 24px 0;
    }

    .trips-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }

    .trips-header h1 {
      font-size: 32px;
      font-weight: 700;
      color: var(--primary-color);
    }

    .create-trip-form {
      margin-bottom: 32px;
    }

    .create-trip-form h2 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 24px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    .form-group label {
      font-weight: 500;
      margin-bottom: 8px;
      color: var(--text-color);
    }

    .form-control {
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

    .form-control:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .error-message {
      color: #DC2626;
      font-size: 14px;
      margin-top: 4px;
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
      gap: 16px;
      justify-content: flex-end;
    }

    .trip-filters {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }

    .filter-btn {
      padding: 8px 16px;
      border: 2px solid var(--border-color);
      border-radius: 20px;
      background: var(--surface-color);
      color: var(--text-color);
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 500;
    }

    .filter-btn:hover {
      border-color: var(--primary-color);
    }

    .filter-btn.active {
      background: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
    }

    .trips-list {
      min-height: 400px;
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

    .trip-card {
      background: var(--surface-color);
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      border: 2px solid transparent;
    }

    .trip-card:hover {
      border-color: var(--primary-color);
      transform: translateY(-2px);
    }

    .trip-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .trip-header h3 {
      font-size: 20px;
      font-weight: 600;
    }

    .trip-status {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .trip-status.planning {
      background: #FEF3C7;
      color: #92400E;
    }

    .trip-status.active {
      background: #D1FAE5;
      color: #065F46;
    }

    .trip-status.completed {
      background: #E0E7FF;
      color: #3730A3;
    }

    .trip-details {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 20px;
    }

    .trip-details > div {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .trip-details i {
      color: var(--primary-color);
      width: 16px;
    }

    .trip-notes {
      font-size: 14px;
      opacity: 0.8;
    }

    .trip-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    .action-btn {
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
      font-size: 14px;
    }

    .action-btn:hover {
      border-color: var(--primary-color);
      background: var(--primary-color);
      color: white;
    }

    .action-btn.delete:hover {
      border-color: #DC2626;
      background: #DC2626;
      color: white;
    }

    @media (max-width: 768px) {
      .trips-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }
      
      .form-grid {
        grid-template-columns: 1fr;
      }
      
      .trip-filters {
        justify-content: center;
      }
    }
  `]
})
export class TripsComponent {
  tripService = inject(TripService);
  private readonly apiService = inject(ApiService);
  private readonly fb = inject(FormBuilder);

  showForm = signal(false);
  editingTrip = signal<Trip | null>(null);
  currentFilter = signal<'all' | 'planning' | 'active' | 'completed'>('all');
  destinationSuggestions = signal<Location[]>([]);

  allTrips = this.tripService.trips;

  filteredTrips = computed(() => {
    const filter = this.currentFilter();
    const trips = this.allTrips();
    
    if (filter === 'all') return trips;
    return trips.filter(trip => trip.status === filter);
  });

  tripForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    destinationName: ['', Validators.required],
    destination: [null, Validators.required],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    budget: [0, [Validators.min(0)]],
    currency: ['USD', Validators.required],
    notes: ['']
  });

  showCreateForm(): void {
    this.showForm.set(true);
    this.editingTrip.set(null);
    this.tripForm.reset();
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.editingTrip.set(null);
    this.tripForm.reset();
    this.destinationSuggestions.set([]);
  }

  onDestinationSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    if (query.length > 2) {
      this.apiService.searchCities(query).subscribe({
        next: (cities) => this.destinationSuggestions.set(cities),
        error: (error) => console.error('Error searching cities:', error)
      });
    } else {
      this.destinationSuggestions.set([]);
    }
  }

  selectDestination(destination: Location): void {
    this.tripForm.patchValue({
      destinationName: `${destination.name}, ${destination.country}`,
      destination: destination
    });
    this.destinationSuggestions.set([]);
  }

  onSubmit(): void {
    if (this.tripForm.valid) {
      const formValue = this.tripForm.value;
      const tripData = {
        title: formValue.title,
        destination: formValue.destination,
        startDate: new Date(formValue.startDate),
        endDate: new Date(formValue.endDate),
        budget: formValue.budget,
        currency: formValue.currency,
        notes: formValue.notes,
        status: 'planning' as const
      };

      const editing = this.editingTrip();
      if (editing) {
        this.tripService.updateTrip(editing.id, tripData);
      } else {
        this.tripService.addTrip(tripData);
      }

      this.cancelForm();
    }
  }

  editTrip(trip: Trip): void {
    this.editingTrip.set(trip);
    this.showForm.set(true);
    
    this.tripForm.patchValue({
      title: trip.title,
      destinationName: `${trip.destination.name}, ${trip.destination.country}`,
      destination: trip.destination,
      startDate: trip.startDate.toISOString().split('T')[0],
      endDate: trip.endDate.toISOString().split('T')[0],
      budget: trip.budget,
      currency: trip.currency,
      notes: trip.notes || ''
    });
  }

  deleteTrip(id: string): void {
    if (confirm('Are you sure you want to delete this trip?')) {
      this.tripService.deleteTrip(id);
    }
  }

  setFilter(filter: 'all' | 'planning' | 'active' | 'completed'): void {
    this.currentFilter.set(filter);
  }

  getEmptyStateMessage(): string {
    switch (this.currentFilter()) {
      case 'planning':
        return 'No upcoming trips planned. Start planning your next adventure!';
      case 'active':
        return 'No active trips. Have a great time on your travels!';
      case 'completed':
        return 'No completed trips yet. Create memories to look back on!';
      default:
        return 'No trips created yet. Start by planning your first trip!';
    }
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  }

  calculateDuration(trip: Trip): number {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}