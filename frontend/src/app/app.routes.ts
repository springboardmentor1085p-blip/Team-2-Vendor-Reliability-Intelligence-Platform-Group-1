import { Routes } from '@angular/router';

// Authentication
import { Login } from './features/auth/login/login';

// Layout
import { MainLayout } from './layouts/main-layout/main-layout';

// Auth Guard
import { authGuard } from './core/guards/auth-guard';

// Dashboard
import { Dashboard } from './features/dashboard/dashboard/dashboard';

// Vendors
import { VendorList } from './features/vendors/vendor-list/vendor-list';
import { VendorForm } from './features/vendors/vendor-form/vendor-form';
import { PendingVendors } from './features/vendors/pending-vendors/pending-vendors';

// Procurement
import { PurchaseOrderList } from './features/procurement/purchase-order-list/purchase-order-list';
import { PurchaseOrderForm } from './features/procurement/purchase-order-form/purchase-order-form';
import { PurchaseOrderDetails } from './features/procurement/purchase-order-details/purchase-order-details';

// Contracts
import { ContractList } from './features/contracts/contract-list/contract-list';
import { ContractForm } from './features/contracts/contract-form/contract-form';
import { ContractDetails } from './features/contracts/contract-details/contract-details';

// Communication
import { CommunicationList } from './features/communication/communication-list/communication-list';
import { CommunicationForm } from './features/communication/communication-form/communication-form';
import { CommunicationDetails } from './features/communication/communication-details/communication-details';

// Risk
import { RiskDashboard } from './features/risk/risk-dashboard/risk-dashboard';
import { RiskList } from './features/risk/risk-list/risk-list';
import { RiskDetails } from './features/risk/risk-details/risk-details';

// Reports
import { ReportDashboard } from './features/reports/report-dashboard/report-dashboard';
import { ReportList } from './features/reports/report-list/report-list';

// Notifications
import { NotificationList } from './features/notifications/notification-list/notification-list';

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
    path: '',
    component: MainLayout,
    canActivate: [authGuard],

    children: [

      {
        path: 'dashboard',
        component: Dashboard
      },

      // Vendors

      {
        path: 'vendors',
        component: VendorList
      },

      {
        path: 'vendors/add',
        component: VendorForm
      },

      {
        path: 'vendors/edit/:id',
        component: VendorForm
      },

      {
        path: 'vendors/pending',
        component: PendingVendors
      },

      // Purchase Orders

      {
        path: 'purchase-orders',
        component: PurchaseOrderList
      },

      {
        path: 'purchase-orders/add',
        component: PurchaseOrderForm
      },

      {
        path: 'purchase-orders/details',
        component: PurchaseOrderDetails
      },

      // Contracts

      {
        path: 'contracts',
        component: ContractList
      },

      {
        path: 'contracts/add',
        component: ContractForm
      },

      {
        path: 'contracts/details',
        component: ContractDetails
      },

      // Communications

      {
        path: 'communications',
        component: CommunicationList
      },

      {
        path: 'communications/add',
        component: CommunicationForm
      },

      {
        path: 'communications/details',
        component: CommunicationDetails
      },

      // Risk

      {
        path: 'risk',
        component: RiskDashboard
      },

      {
        path: 'risk/list',
        component: RiskList
      },

      {
        path: 'risk/details',
        component: RiskDetails
      },

      // Reports

      {
        path: 'reports',
        component: ReportDashboard
      },

      {
        path: 'reports/list',
        component: ReportList
      },

      // Notifications

      {
        path: 'notifications',
        component: NotificationList
      }

    ]

  },

  {
    path: '**',
    redirectTo: 'login'
  }

];