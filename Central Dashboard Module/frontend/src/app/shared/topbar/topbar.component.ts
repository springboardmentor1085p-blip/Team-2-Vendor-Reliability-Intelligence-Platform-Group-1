import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatMenuModule, MatDividerModule],
  template: `
    <header class="topbar">
      <div class="topbar-left">
        <button mat-icon-button (click)="toggleSidebar.emit()" class="menu-btn">
          <mat-icon>menu</mat-icon>
        </button>
        <div>
          <div class="page-title">{{ title }}</div>
          <div class="breadcrumb-trail">
            <span>Home</span>
            <mat-icon>chevron_right</mat-icon>
            <span>{{ title }}</span>
          </div>
        </div>
      </div>

      <div class="topbar-right">
        <!-- Live indicator -->
        <div class="topbar-chip">
          <mat-icon>circle</mat-icon>
          Live
        </div>

        <!-- Notifications -->
        <button mat-icon-button class="notif-btn" matTooltip="Notifications">
          <mat-icon>notifications_outlined</mat-icon>
          <span class="notif-dot"></span>
        </button>

        <!-- User menu -->
        <div class="user-btn" [matMenuTriggerFor]="userMenu">
          <div class="avatar">{{ initials }}</div>
          <span class="user-name d-none d-md-inline">{{ auth.currentUser()?.full_name }}</span>
          <mat-icon>expand_more</mat-icon>
        </div>

        <mat-menu #userMenu="matMenu" xPosition="before">
          <div class="px-3 py-2">
            <div style="font-size:.82rem;font-weight:600;color:#0f172a">{{ auth.currentUser()?.full_name }}</div>
            <div style="font-size:.75rem;color:#64748b">{{ auth.currentUser()?.email }}</div>
            <div style="font-size:.68rem;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:.06em;margin-top:2px">
              {{ auth.currentUser()?.role }}
            </div>
          </div>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="auth.logout()">
            <mat-icon>logout</mat-icon> Sign Out
          </button>
        </mat-menu>
      </div>
    </header>
  `,
})
export class TopbarComponent {
  @Input() title = 'Dashboard';
  @Output() toggleSidebar = new EventEmitter<void>();

  constructor(public auth: AuthService) {}

  get initials(): string {
    const name = this.auth.currentUser()?.full_name ?? '';
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }
}
