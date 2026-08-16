import { Routes } from '@angular/router';
import { authGuard, managerGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: '',
    loadComponent: () => import('./components/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'vendors',
        loadComponent: () => import('./components/vendor-list/vendor-list.component').then(m => m.VendorListComponent),
      },
      {
        path: 'vendors/:id',
        loadComponent: () => import('./components/vendor-detail/vendor-detail.component').then(m => m.VendorDetailComponent),
      },
      {
        path: 'approval',
        loadComponent: () => import('./components/approval-dashboard/approval-dashboard.component').then(m => m.ApprovalDashboardComponent),
        canActivate: [managerGuard],
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
