import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../services/auth.service';

interface NavItem { label: string; icon: string; route: string; }

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive,
    MatIconModule, MatButtonModule, MatMenuModule, MatTooltipModule, MatDividerModule,
  ],
  template: `
    <div class="shell-wrapper">

      <!-- ── Sidebar ─────────────────────────────────────────────── -->
      <nav class="sidebar" [class.collapsed]="collapsed()">
        <!-- Logo -->
        <div class="sidebar-logo">
          <span class="material-icons logo-icon">inventory_2</span>
          @if (!collapsed()) {
            <div class="logo-text">
              <span class="logo-name">VR Platform</span>
              <span class="logo-sub">Procurement Hub</span>
            </div>
          }
        </div>

        <hr class="sidebar-divider" />

        <!-- Nav items -->
        <ul class="nav flex-column sidebar-nav">
          @for (item of navItems; track item.route) {
            <li class="nav-item">
              <a class="nav-link sidebar-link"
                [routerLink]="item.route"
                routerLinkActive="active"
                [matTooltip]="collapsed() ? item.label : ''"
                matTooltipPosition="right">
                <span class="material-icons nav-icon">{{ item.icon }}</span>
                @if (!collapsed()) { <span class="nav-label">{{ item.label }}</span> }
              </a>
            </li>
          }
        </ul>

        <!-- Collapse toggle -->
        <button class="collapse-btn" (click)="collapsed.set(!collapsed())" matTooltip="Toggle sidebar">
          <span class="material-icons">{{ collapsed() ? 'chevron_right' : 'chevron_left' }}</span>
        </button>
      </nav>

      <!-- ── Main area ───────────────────────────────────────────── -->
      <div class="main-area">
        <!-- Topbar -->
        <header class="topbar">
          <div class="topbar-left">
            <span class="topbar-title d-none d-md-block">Vendor Reliability Intelligence Platform</span>
          </div>
          <div class="topbar-right">
            <!-- User dropdown (Bootstrap) -->
            <div class="dropdown">
              <button class="btn btn-link user-btn dropdown-toggle" data-bs-toggle="dropdown">
                <span class="material-icons">account_circle</span>
                <span class="user-name d-none d-sm-inline">{{ auth.currentUser()?.full_name }}</span>
              </button>
              <ul class="dropdown-menu dropdown-menu-end shadow-sm">
                <li class="px-3 py-2">
                  <div class="fw-semibold" style="font-size:13px">{{ auth.currentUser()?.full_name }}</div>
                  <div class="text-muted" style="font-size:12px">{{ auth.currentUser()?.role }}</div>
                  <div class="text-muted" style="font-size:11px">{{ auth.currentUser()?.email }}</div>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                  <button class="dropdown-item text-danger" (click)="auth.logout()">
                    <span class="material-icons me-2" style="font-size:16px;vertical-align:middle">logout</span>
                    Sign Out
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </header>

        <!-- Page content -->
        <main class="page-content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    .shell-wrapper {
      display: flex;
      height: 100vh;
      overflow: hidden;
    }

    /* ── Sidebar ──────────────────────────────── */
    .sidebar {
      width: 240px;
      min-width: 240px;
      background: var(--sidebar-bg);
      display: flex;
      flex-direction: column;
      transition: width 0.25s ease, min-width 0.25s ease;
      overflow: hidden;
      z-index: 200;
    }

    .sidebar.collapsed {
      width: 64px;
      min-width: 64px;
    }

    .sidebar-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 18px 14px;
      white-space: nowrap;
    }

    .logo-icon {
      font-size: 28px;
      color: #7986cb;
      flex-shrink: 0;
    }

    .logo-name { display: block; font-size: 14px; font-weight: 700; color: #fff; }
    .logo-sub  { display: block; font-size: 11px; color: #9fa8da; }

    .sidebar-divider { border-color: rgba(255,255,255,0.1); margin: 0 12px 8px; }

    .sidebar-nav { padding: 0 8px; flex: 1; overflow-y: auto; overflow-x: hidden; }

    .sidebar-link {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 10px;
      border-radius: 8px;
      color: var(--sidebar-text) !important;
      text-decoration: none;
      white-space: nowrap;
      transition: background 0.15s;
      font-size: 14px;

      &:hover { background: rgba(255,255,255,0.1); color: #fff !important; }
      &.active { background: var(--sidebar-active); color: #fff !important;
        .nav-icon { color: #fff; }
      }
    }

    .nav-icon { font-size: 20px; color: #7986cb; flex-shrink: 0; }
    .nav-label { overflow: hidden; text-overflow: ellipsis; }

    .collapse-btn {
      background: none;
      border: none;
      color: #9fa8da;
      padding: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: auto;
      &:hover { color: #fff; }
    }

    /* ── Main ─────────────────────────────────── */
    .main-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    /* ── Topbar ───────────────────────────────── */
    .topbar {
      height: 60px;
      min-height: 60px;
      background: #1a237e;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      z-index: 100;
    }

    .topbar-title {
      font-size: 15px;
      font-weight: 600;
      color: #fff;
      letter-spacing: 0.2px;
    }

    .user-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #fff !important;
      text-decoration: none;
      font-size: 14px;

      .material-icons { font-size: 26px; }
      &::after { color: #c5cae9; }
    }

    .user-name { max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    /* ── Page content ─────────────────────────── */
    .page-content {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      background: var(--bg-page);
    }
  `],
})
export class ShellComponent {
  collapsed = signal(false);

  navItems: NavItem[] = [
    { label: 'Dashboard',       icon: 'dashboard',    route: '/dashboard' },
    { label: 'Purchase Orders', icon: 'receipt_long', route: '/purchase-orders' },
    { label: 'Vendors',         icon: 'business',     route: '/vendors' },
  ];

  constructor(public auth: AuthService) {}
}
