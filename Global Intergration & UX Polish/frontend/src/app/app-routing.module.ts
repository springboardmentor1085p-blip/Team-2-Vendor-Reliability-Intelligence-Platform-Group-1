import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardPageComponent } from './pages/dashboard-page/dashboard-page.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardPageComponent },
  { path: 'vendors', component: DashboardPageComponent },
  { path: 'contracts', component: DashboardPageComponent },
  { path: 'purchase-orders', component: DashboardPageComponent },
  { path: 'messaging', component: DashboardPageComponent },
  { path: 'notifications', component: DashboardPageComponent },
  { path: 'reports', component: DashboardPageComponent },
  { path: 'settings', component: DashboardPageComponent },
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
