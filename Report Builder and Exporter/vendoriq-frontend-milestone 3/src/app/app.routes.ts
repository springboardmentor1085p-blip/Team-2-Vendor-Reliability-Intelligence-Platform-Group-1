import { Routes } from '@angular/router';
import { VendorRegistrationComponent } from './vendor-registration/vendor-registration.component';
//import { VendorListComponent } from './vendor-list/vendor-list.component';
import { ProcurementDashboardComponent } from './procurement-dashboard/procurement-dashboard.component';

export const routes: Routes = [
  { path: '',                     component: VendorRegistrationComponent },
//{ path: 'vendors',              component: VendorListComponent },
//{ path: 'dashboard',            component: ProcurementDashboardComponent },
  { path: 'procurement-dashboard', component: ProcurementDashboardComponent },  // Member 2 — Milestone 2
  { path: '**',                   redirectTo: '' }
];
