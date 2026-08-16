import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'purchase-orders',
        loadComponent: () => import('./pages/purchase-orders/po-list/po-list.component').then(m => m.PoListComponent),
      },
      {
        path: 'purchase-orders/new',
        loadComponent: () => import('./pages/purchase-orders/po-form/po-form.component').then(m => m.PoFormComponent),
      },
      {
        path: 'purchase-orders/:id',
        loadComponent: () => import('./pages/purchase-orders/po-detail/po-detail.component').then(m => m.PoDetailComponent),
      },
      {
        path: 'vendors',
        loadComponent: () => import('./pages/vendors/vendor-list/vendor-list.component').then(m => m.VendorListComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
