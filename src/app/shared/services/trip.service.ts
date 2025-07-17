import { Injectable, signal, computed } from '@angular/core';
import { Trip, Location } from '../interfaces/travel.interface';

@Injectable({
  providedIn: 'root'
})
export class TripService {
  private readonly storageKey = 'travel-app-trips';
  
  private tripsSignal = signal<Trip[]>(this.loadTrips());
  
  trips = this.tripsSignal.asReadonly();
  
  activeTrips = computed(() => 
    this.trips().filter(trip => trip.status === 'active')
  );
  
  upcomingTrips = computed(() => 
    this.trips().filter(trip => trip.status === 'planning')
  );
  
  completedTrips = computed(() => 
    this.trips().filter(trip => trip.status === 'completed')
  );

  private loadTrips(): Trip[] {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) return [];
    
    try {
      const parsed = JSON.parse(stored);
      return parsed.map((trip: any) => ({
        ...trip,
        startDate: new Date(trip.startDate),
        endDate: new Date(trip.endDate),
        createdAt: new Date(trip.createdAt),
        updatedAt: new Date(trip.updatedAt)
      }));
    } catch {
      return [];
    }
  }

  private saveTrips(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.tripsSignal()));
  }

  addTrip(trip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>): void {
    const newTrip: Trip = {
      ...trip,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.tripsSignal.update(trips => [...trips, newTrip]);
    this.saveTrips();
  }

  updateTrip(id: string, updates: Partial<Trip>): void {
    this.tripsSignal.update(trips => 
      trips.map(trip => 
        trip.id === id 
          ? { ...trip, ...updates, updatedAt: new Date() }
          : trip
      )
    );
    this.saveTrips();
  }

  deleteTrip(id: string): void {
    this.tripsSignal.update(trips => trips.filter(trip => trip.id !== id));
    this.saveTrips();
  }

  getTripById(id: string): Trip | undefined {
    return this.trips().find(trip => trip.id === id);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}