import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { Location, Weather, Currency, Flight, Hotel } from '../interfaces/travel.interface';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  
  // Mock API URLs - replace with actual API endpoints
  private readonly WEATHER_API = 'https://api.openweathermap.org/data/2.5/weather';
  private readonly EXCHANGE_API = 'https://api.exchangerate-api.com/v4/latest';
  private readonly CITIES_API = 'https://wft-geo-db.p.rapidapi.com/v1/geo/cities';

  // Mock data for development
  private mockWeatherData: Weather = {
    temperature: 22,
    condition: 'Sunny',
    humidity: 65,
    windSpeed: 8,
    icon: '01d'
  };

  private mockCurrencyData: Currency[] = [
    { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1.0 },
    { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.85 },
    { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.73 },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 110.0 }
  ];

  private mockFlightData: Flight[] = [
    {
      id: '1',
      airline: 'American Airlines',
      flightNumber: 'AA123',
      departure: {
        airport: 'JFK',
        city: 'New York',
        time: '08:00',
        date: '2025-02-01'
      },
      arrival: {
        airport: 'LAX',
        city: 'Los Angeles',
        time: '11:30',
        date: '2025-02-01'
      },
      duration: '5h 30m',
      price: 299,
      currency: 'USD',
      class: 'economy'
    },
    {
      id: '2',
      airline: 'Delta',
      flightNumber: 'DL456',
      departure: {
        airport: 'JFK',
        city: 'New York',
        time: '14:00',
        date: '2025-02-01'
      },
      arrival: {
        airport: 'LAX',
        city: 'Los Angeles',
        time: '17:45',
        date: '2025-02-01'
      },
      duration: '5h 45m',
      price: 349,
      currency: 'USD',
      class: 'economy'
    }
  ];

  private mockHotelData: Hotel[] = [
    {
      id: '1',
      name: 'Grand Plaza Hotel',
      location: {
        id: '1',
        name: 'Los Angeles',
        country: 'USA',
        latitude: 34.0522,
        longitude: -118.2437,
        timezone: 'America/Los_Angeles'
      },
      rating: 4.5,
      price: 150,
      currency: 'USD',
      amenities: ['Pool', 'WiFi', 'Gym', 'Restaurant'],
      images: ['https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg'],
      description: 'Luxury hotel in the heart of downtown Los Angeles',
      reviewCount: 1250,
      checkIn: '15:00',
      checkOut: '11:00'
    },
    {
      id: '2',
      name: 'Seaside Resort',
      location: {
        id: '2',
        name: 'Miami',
        country: 'USA',
        latitude: 25.7617,
        longitude: -80.1918,
        timezone: 'America/New_York'
      },
      rating: 4.8,
      price: 220,
      currency: 'USD',
      amenities: ['Beach Access', 'Spa', 'Pool', 'Restaurant'],
      images: ['https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg'],
      description: 'Beachfront resort with stunning ocean views',
      reviewCount: 890,
      checkIn: '16:00',
      checkOut: '12:00'
    }
  ];

  getWeather(location: Location): Observable<Weather> {
    // Mock implementation - replace with actual API call
    return of(this.mockWeatherData).pipe(delay(500));
  }

  getCurrencyRates(baseCurrency: string = 'USD'): Observable<Currency[]> {
    // Mock implementation - replace with actual API call
    return of(this.mockCurrencyData).pipe(delay(300));
  }

  searchFlights(from: string, to: string, date: string): Observable<Flight[]> {
    // Mock implementation - replace with actual API call
    return of(this.mockFlightData).pipe(delay(1000));
  }

  searchHotels(location: string, checkIn: string, checkOut: string): Observable<Hotel[]> {
    // Mock implementation - replace with actual API call
    return of(this.mockHotelData).pipe(delay(800));
  }

  searchCities(query: string): Observable<Location[]> {
    // Mock implementation - replace with actual API call
    const mockCities: Location[] = [
      {
        id: '1',
        name: 'New York',
        country: 'USA',
        latitude: 40.7128,
        longitude: -74.0060,
        timezone: 'America/New_York'
      },
      {
        id: '2',
        name: 'Los Angeles',
        country: 'USA',
        latitude: 34.0522,
        longitude: -118.2437,
        timezone: 'America/Los_Angeles'
      },
      {
        id: '3',
        name: 'London',
        country: 'UK',
        latitude: 51.5074,
        longitude: -0.1278,
        timezone: 'Europe/London'
      }
    ].filter(city => city.name.toLowerCase().includes(query.toLowerCase()));

    return of(mockCities).pipe(delay(400));
  }

  getUserLocation(): Observable<Location> {
    // Mock implementation - replace with actual geolocation
    const mockLocation: Location = {
      id: '1',
      name: 'New York',
      country: 'USA',
      latitude: 40.7128,
      longitude: -74.0060,
      timezone: 'America/New_York'
    };
    
    return of(mockLocation).pipe(delay(300));
  }
}