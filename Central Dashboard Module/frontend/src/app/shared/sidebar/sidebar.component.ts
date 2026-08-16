import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

interface NavItem { label: string; icon: string; route: string; }

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule],
  template: `
    <aside class="sidebar" [class.collapsed]="collapsed">

      <!-- Brand -->
      <div class="sidebar-brand">
        <div class="brand-logo">
          <mat-icon>verified_user</mat-icon>
        </div>
        <div class="brand-text">
          <div class="brand-name">VRIP</div>
          <div class="brand-sub">Vendor Intelligence</div>
        </div>
      </div>

      <nav>
        <div class="nav-section-title">Main</div>
        <a *ngFor="let item of mainNav" class="nav-item"
           [routerLink]="item.route" routerLinkActive="active">
          <mat-icon>{{ item.icon }}</mat-icon>
          <span>{{ item.label }}</span>
        </a>

        <div class="nav-section-title">Management</div>
        <a *ngFor="let item of mgmtNav" class="nav-item"
           [routerLink]="item.route" routerLinkActive="active">
          <mat-icon>{{ item.icon }}</mat-icon>
          <span>{{ item.label }}</span>
        </a>

        <div class="nav-section-title">Analytics</div>
        <a *ngFor="let item of analyticsNav" class="nav-item"
           [routerLink]="item.route" routerLinkActive="active">
          <mat-icon>{{ item.icon }}</mat-icon>
          <span>{{ item.label }}</span>
        </a>
      </nav>

      <!-- Footer -->
      <div class="sidebar-footer">
        <div class="nav-item" (click)="auth.logout()">
          <mat-icon>logout</mat-icon>
          <span>Sign Out</span>
        </div>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  @Input() collapsed = false;

  mainNav: NavItem[] = [
    { label: 'Dashboard',    icon: 'dashboard',     route: '/dashboard' },
    { label: 'Notifications',icon: 'notifications', route: '/notifications' },
  ];
  mgmtNav: NavItem[] = [
    { label: 'Vendors',         icon: 'storefront',     route: '/vendors' },
    { label: 'Purchase Orders', icon: 'receipt_long',   route: '/procurement/orders' },
    { label: 'Contracts',       icon: 'folder_special', route: '/contracts' },
  ];

  // NOTE: /vendors is now a real page; others still redirect until built.
  analyticsNav: NavItem[] = [
    { label: 'Performance',  icon: 'insights',   route: '/performance' },
    { label: 'Reliability',  icon: 'speed',      route: '/reliability' },
    { label: 'Reports',      icon: 'bar_chart',  route: '/reports' },
  ];

  constructor(public auth: AuthService) {}
}
