import { Routes } from '@angular/router';
import { VendorRegistrationComponent } from './vendor-registration/vendor-registration.component';
import { VendorListComponent } from './vendor-list/vendor-list.component';

export const routes: Routes = [
  { path: '',        component: VendorRegistrationComponent },
  { path: 'vendors', component: VendorListComponent },
  { path: '**',      redirectTo: '' }
];
