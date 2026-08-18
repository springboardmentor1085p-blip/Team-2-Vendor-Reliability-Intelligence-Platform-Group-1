import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {

  private router = inject(Router);
  private authService = inject(AuthService);

  onLogout(): void {

    this.authService.logout();

    this.router.navigate(['/login']);
  }
}