import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  showNavbar = false;

  userName = 'Admin';
  userEmail = 'admin@vendor.com';
  userInitial = 'A';

  constructor(private router: Router) {

    this.loadUser();

    this.updateNavbar(this.router.url);

    this.router.events.subscribe(event => {

      if (event instanceof NavigationEnd) {

        this.updateNavbar(event.urlAfterRedirects);

        this.loadUser();

      }

    });

  }

  private updateNavbar(url: string): void {

    this.showNavbar =
      url !== '/login' &&
      url !== '/register' &&
      url !== '/';

  }

  private loadUser(): void {

    const storedUser = localStorage.getItem('user');

    if (!storedUser) {
      return;
    }

    try {

      const user = JSON.parse(storedUser);

      this.userName =
        user.name ||
        user.full_name ||
        'Admin';

      this.userEmail =
        user.email ||
        'admin@vendor.com';

      this.userInitial =
        this.userName.charAt(0).toUpperCase();

    } catch (e) {

      console.error(e);

    }

  }

  logout(): void {

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('rememberedEmail');

    this.router.navigate(['/login']);

  }

}