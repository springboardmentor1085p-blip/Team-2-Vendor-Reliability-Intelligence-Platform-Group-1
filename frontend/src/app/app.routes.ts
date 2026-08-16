import { Routes } from '@angular/router';

import { NotificationCenter } from './notifications/notification-center/notification-center';

import { AllNotificationsComponent } from './notifications/all-notifications/all-notifications';

import { PurchaseOrderComponent } from './purchase-order/purchase-order';

import { NotificationPreferences } from './notifications/notification-preferences/notification-preferences';

import { VendorAnalyticsComponent } from './analytics/vendor-analytics/vendor-analytics';

import { OrderListComponent } from './analytics/order-list/order-list';

export const routes: Routes = [

{
path:'',
redirectTo:'notifications',
pathMatch:'full'
},

{
path:'notifications',
component:NotificationCenter
},

{
path:'all-notifications',
component:AllNotificationsComponent
},

{
  path:'purchase-order/:id',
  component:PurchaseOrderComponent
},

{ path:'purchase-orders', component: OrderListComponent },

{
  path: 'analytics',
  component: VendorAnalyticsComponent
},

{
  path: 'orders/status/:status',
  component: OrderListComponent
},

{
path:'preferences',
component:NotificationPreferences
}

];