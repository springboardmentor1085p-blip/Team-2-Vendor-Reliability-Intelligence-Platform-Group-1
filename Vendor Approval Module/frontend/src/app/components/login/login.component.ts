import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule,
  ],
  template: `
    <div class="login-wrapper d-flex align-items-center justify-content-center min-vh-100">
      <mat-card class="login-card shadow-lg p-3">
        <mat-card-header class="mb-3">
          <div class="text-center w-100">
            <mat-icon class="platform-icon">storefront</mat-icon>
            <h2 class="mt-2 mb-0">Vendor Reliability Platform</h2>
            <p class="text-muted small">Sign in to your account</p>
          </div>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="w-100 mb-2">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" placeholder="you@company.com">
              <mat-icon matSuffix>email</mat-icon>
              <mat-error *ngIf="form.get('email')?.hasError('required')">Email is required</mat-error>
              <mat-error *ngIf="form.get('email')?.hasError('email')">Invalid email</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-100 mb-3">
              <mat-label>Password</mat-label>
              <input matInput [type]="hide ? 'password' : 'text'" formControlName="password">
              <button mat-icon-button matSuffix type="button" (click)="hide = !hide">
                <mat-icon>{{ hide ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="form.get('password')?.hasError('required')">Password is required</mat-error>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit"
                    class="w-100" [disabled]="loading">
              <mat-spinner *ngIf="loading" diameter="20" class="me-2 d-inline-block"></mat-spinner>
              {{ loading ? 'Signing in...' : 'Sign In' }}
            </button>
          </form>
        </mat-card-content>

        <mat-card-actions class="text-center mt-2">
          <small class="text-muted">Don't have an account? <a routerLink="/register">Register</a></small>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-wrapper { background: linear-gradient(135deg, #3f51b5 0%, #1a237e 100%); }
    .login-card { width: 100%; max-width: 420px; border-radius: 12px !important; }
    .platform-icon { font-size: 48px; width: 48px; height: 48px; color: #3f51b5; }
  `]
})
export class LoginComponent {
  form: FormGroup;
  hide = true;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private snack: MatSnackBar,
  ) {
    this.form = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const { email, password } = this.form.value;
    this.auth.login(email!, password!).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: err => {
        this.loading = false;
        this.snack.open(err.error?.detail || 'Login failed', 'Close', { duration: 4000 });
      },
    });
  }
}
