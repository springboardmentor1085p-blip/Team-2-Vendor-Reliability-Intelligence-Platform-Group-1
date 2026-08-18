import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {

  email: string = '';
  password: string = '';

  hide: boolean = true;
  loading: boolean = false;

  error: string | null = null;


  constructor(
    private authService: AuthService,
    private router: Router
  ) {}


  /**
   * Toggle password visibility.
   */
  togglePasswordVisibility(): void {
    this.hide = !this.hide;
  }


  /**
   * Login using the existing backend authentication flow.
   *
   * No backend/API architecture is changed here.
   */
  login(): void {

    if (!this.email || !this.password) {

      this.error =
        'Please enter both your email address and password.';

      return;
    }


    this.loading = true;
    this.error = null;


    this.authService.login({
      email: this.email.trim().toLowerCase(),
      password: this.password
    }).subscribe({

      next: (response: any) => {

        this.loading = false;


        const token =
          response?.access_token ??
          response?.token;


        if (token) {
          this.authService.saveToken(token);
        }


        this.router.navigate(['/dashboard']);
      },


      error: (err: any) => {

        this.loading = false;


        this.error =
          err?.error?.detail ||
          err?.error?.message ||
          err?.message ||
          'Invalid email or password. Please try again.';
      }

    });
  }

}