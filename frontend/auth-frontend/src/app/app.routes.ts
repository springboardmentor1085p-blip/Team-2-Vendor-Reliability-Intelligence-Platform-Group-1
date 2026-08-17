import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { ContractManagement } from './pages/contract-management/contract-management';
import { VendorProfile } from './pages/vendor-profile/vendor-profile';
import { Register } from './pages/register/register';
import { Dashboard } from './pages/dashboard/dashboard';
import { ReliabilityScore } from './reliability-score/reliability-score';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: 'register',
    component: Register
  },
  {
    path: 'dashboard',
    component: Dashboard
  },
  {
    path: 'contract-management',
    component: ContractManagement
  },
  {
    path: 'vendor-profile',
    component: VendorProfile
  },
  {
    path: 'reliability-score',
    component: ReliabilityScore
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];