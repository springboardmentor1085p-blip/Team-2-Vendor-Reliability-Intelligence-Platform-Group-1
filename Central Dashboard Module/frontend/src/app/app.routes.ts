import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then(m => m.LoginComponent),
  },

  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },

  {
    path: 'vendors',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/vendors/vendors.component').then(m => m.VendorsComponent),
  },

  // Stubs — redirected until other teams build them
  { path: 'procurement/orders', redirectTo: 'dashboard' },
  { path: 'contracts',          redirectTo: 'dashboard' },
  { path: 'performance',        redirectTo: 'dashboard' },
  { path: 'reliability',        redirectTo: 'dashboard' },
  { path: 'reports',            redirectTo: 'dashboard' },
  { path: 'notifications',      redirectTo: 'dashboard' },

  { path: '**', redirectTo: 'dashboard' },
];
