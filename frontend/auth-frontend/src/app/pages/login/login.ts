import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  private auth = inject(Auth);
  private router = inject(Router);

  showPassword = false;
  rememberMe = false;
  isLoading = false;
  loginError = '';

  loginData = {
    email: '',
    password: ''
  };

  constructor() {
    const rememberedEmail =
      localStorage.getItem('rememberedEmail');

    if (rememberedEmail) {
      this.loginData.email = rememberedEmail;
      this.rememberMe = true;
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  forgotPassword(): void {
    alert(
      'Password recovery feature will be available soon. Please contact the administrator.'
    );
  }

  loginUser(): void {
    this.loginError = '';

    if (
      !this.loginData.email.trim() ||
      !this.loginData.password.trim()
    ) {
      this.loginError =
        'Please enter your email and password.';
      return;
    }

    this.isLoading = true;

    this.auth.login(this.loginData).subscribe({
      next: (response: any) => {
        localStorage.setItem(
          'token',
          response.access_token
        );

        localStorage.setItem(
          'user',
          JSON.stringify(response.user)
        );

        if (this.rememberMe) {
          localStorage.setItem(
            'rememberedEmail',
            this.loginData.email
          );
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        this.isLoading = false;

        this.router.navigate(['/dashboard']);
      },

      error: (error) => {
        console.error('Login failed:', error);

        this.isLoading = false;

        this.loginError =
          error?.error?.detail ||
          'Invalid email or password.';
      }
    });
  }
}