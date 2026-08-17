import { Component } from '@angular/core';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  exact: boolean;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  menuItems: MenuItem[] = [
    { label: 'Dashboard',       icon: 'dashboard',     route: '/dashboard',       exact: true  },
    { label: 'Vendors',         icon: 'storefront',    route: '/vendors',         exact: false },
    { label: 'Contracts',       icon: 'folder_shared', route: '/contracts',       exact: false },
    { label: 'Purchase Orders', icon: 'shopping_cart', route: '/purchase-orders', exact: false },
    { label: 'Messaging',       icon: 'chat',          route: '/messaging',       exact: false },
    { label: 'Notifications',   icon: 'notifications', route: '/notifications',   exact: false },
    { label: 'Reports',         icon: 'bar_chart',     route: '/reports',         exact: false },
    { label: 'Settings',        icon: 'settings',      route: '/settings',        exact: false },
  ];
}
