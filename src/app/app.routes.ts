import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'trips',
    loadComponent: () => import('./features/trips/trips.component').then(m => m.TripsComponent)
  },
  {
    path: 'search/flights',
    loadComponent: () => import('./features/flights/flights.component').then(m => m.FlightsComponent)
  },
  {
    path: 'search/hotels',
    loadComponent: () => import('./features/hotels/hotels.component').then(m => m.HotelsComponent)
  },
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent)
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];