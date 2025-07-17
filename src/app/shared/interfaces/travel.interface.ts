export interface Location {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface Weather {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number;
}

export interface Trip {
  id: string;
  title: string;
  destination: Location;
  startDate: Date;
  endDate: Date;
  budget: number;
  currency: string;
  status: 'planning' | 'active' | 'completed';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  departure: {
    airport: string;
    city: string;
    time: string;
    date: string;
  };
  arrival: {
    airport: string;
    city: string;
    time: string;
    date: string;
  };
  duration: string;
  price: number;
  currency: string;
  class: 'economy' | 'business' | 'first';
}

export interface Hotel {
  id: string;
  name: string;
  location: Location;
  rating: number;
  price: number;
  currency: string;
  amenities: string[];
  images: string[];
  description: string;
  reviewCount: number;
  checkIn: string;
  checkOut: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  currency: string;
  units: 'metric' | 'imperial';
  notifications: boolean;
}