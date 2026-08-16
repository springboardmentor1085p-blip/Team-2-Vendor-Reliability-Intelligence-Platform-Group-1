import { Routes } from '@angular/router';

import { ProcurementManagement } from './components/procurement-management/procurement-management';
import { PurchaseOrderForm } from './components/purchase-order-form/purchase-order-form';
import { PurchaseOrderTracking } from './components/purchase-order-tracking/purchase-order-tracking';

import { Chat } from './chat/chat';
import { NotificationSettings } from './notification-settings/notification-settings';
import { ExportStatus } from './export-status/export-status';
import { SharedChart } from './shared-chart/shared-chart';

export const routes: Routes = [
  {
    path: '',
    component: ProcurementManagement
  },
  {
    path: 'purchase-order',
    component: PurchaseOrderForm
  },
  {
    path: 'tracking',
    component: PurchaseOrderTracking
  },
  {
    path: 'chat',
    component: Chat
  },
  {
    path: 'notifications',
    component: NotificationSettings
  },
  {
    path: 'export-status',
    component: ExportStatus
  },
  {
    path: 'analytics',
    component: SharedChart
  }
];