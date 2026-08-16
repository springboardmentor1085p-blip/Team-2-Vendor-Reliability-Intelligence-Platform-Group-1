import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatToolbarModule, MatSidenavModule, MatListModule,
    MatIconModule, MatButtonModule, MatMenuModule, MatBadgeModule,
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav #sidenav mode="side" opened class="sidenav">
        <div class="sidenav-header">
          <mat-icon class="brand-icon">storefront</mat-icon>
          <span class="brand-text">VR Platform</span>
        </div>

        <mat-nav-list>
          <a mat-list-item routerLink="/dashboard" routerLinkActive="active-link">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>

          <a mat-list-item routerLink="/vendors" routerLinkActive="active-link">
            <mat-icon matListItemIcon>business</mat-icon>
            <span matListItemTitle>Vendors</span>
          </a>

          <!-- Approval Dashboard — only visible to managers -->
          <a mat-list-item routerLink="/approval" routerLinkActive="active-link"
             *ngIf="auth.isManager()">
            <mat-icon matListItemIcon>approval</mat-icon>
            <span matListItemTitle>Approval Queue</span>
          </a>
        </mat-nav-list>

        <div class="sidenav-footer">
          <div class="user-info">
            <mat-icon>account_circle</mat-icon>
            <div>
              <div class="user-name">{{ auth.currentUser()?.full_name }}</div>
              <div class="user-role">{{ formatRole(auth.currentUser()?.role) }}</div>
            </div>
          </div>
          <button mat-icon-button (click)="auth.logout()" title="Logout">
            <mat-icon>logout</mat-icon>
          </button>
        </div>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary" class="top-toolbar">
          <button mat-icon-button (click)="sidenav.toggle()">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="toolbar-spacer"></span>
          <span class="me-3 small">{{ auth.currentUser()?.email }}</span>
          <button mat-icon-button (click)="auth.logout()">
            <mat-icon>logout</mat-icon>
          </button>
        </mat-toolbar>

        <div class="content-area">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container { height: 100vh; }
    .sidenav {
      width: 240px;
      background: #1a237e;
      color: white;
      display: flex;
      flex-direction: column;
    }
    .sidenav-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 16px;
      border-bottom: 1px solid rgba(255,255,255,.15);
    }
    .brand-icon { color: #ffd740; font-size: 32px; width: 32px; height: 32px; }
    .brand-text { font-size: 16px; font-weight: 700; color: white; }
    mat-nav-list { flex: 1; }
    mat-nav-list a { color: rgba(255,255,255,.8); margin: 2px 8px; border-radius: 8px; }
    mat-nav-list a:hover { background: rgba(255,255,255,.1); color: white; }
    .active-link { background: rgba(255,255,255,.15) !important; color: white !important; }
    .sidenav-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-top: 1px solid rgba(255,255,255,.15);
    }
    .user-info { display: flex; align-items: center; gap: 8px; }
    .user-name { font-size: 13px; font-weight: 600; color: white; }
    .user-role { font-size: 11px; color: rgba(255,255,255,.6); text-transform: capitalize; }
    .top-toolbar { position: sticky; top: 0; z-index: 100; }
    .toolbar-spacer { flex: 1; }
    .content-area { padding: 24px; min-height: calc(100vh - 64px); }
  `]
})
export class LayoutComponent {
  constructor(public auth: AuthService) {}

  formatRole(role?: string): string {
    return (role || '').replace(/_/g, ' ');
  }
}
