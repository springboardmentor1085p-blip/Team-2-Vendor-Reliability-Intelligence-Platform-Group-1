import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatSnackBarModule, MatProgressSpinnerModule],
  template: `
    <div class="auth-bg">
      <div class="auth-card card shadow-lg">
        <!-- Logo -->
        <div class="text-center mb-4">
          <div class="auth-logo mx-auto mb-3">
            <span class="material-icons">inventory_2</span>
          </div>
          <h4 class="fw-bold text-primary-custom">VR Intelligence Platform</h4>
          <p class="text-muted small">Vendor Reliability &amp; Procurement Management</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <!-- Email -->
          <div class="mb-3">
            <label class="form-label fw-semibold small">Email Address</label>
            <div class="input-group">
              <span class="input-group-text"><span class="material-icons" style="font-size:18px">email</span></span>
              <input type="email" class="form-control" formControlName="email"
                placeholder="you@company.com"
                [class.is-invalid]="f['email'].invalid && f['email'].touched" />
              @if (f['email'].invalid && f['email'].touched) {
                <div class="invalid-feedback">Valid email required</div>
              }
            </div>
          </div>

          <!-- Password -->
          <div class="mb-3">
            <label class="form-label fw-semibold small">Password</label>
            <div class="input-group">
              <span class="input-group-text"><span class="material-icons" style="font-size:18px">lock</span></span>
              <input [type]="showPwd ? 'text' : 'password'" class="form-control"
                formControlName="password" placeholder="••••••••"
                [class.is-invalid]="f['password'].invalid && f['password'].touched" />
              <button type="button" class="btn btn-outline-secondary" (click)="showPwd = !showPwd">
                <span class="material-icons" style="font-size:18px">{{ showPwd ? 'visibility_off' : 'visibility' }}</span>
              </button>
              @if (f['password'].invalid && f['password'].touched) {
                <div class="invalid-feedback">Password is required</div>
              }
            </div>
          </div>

          <!-- Error -->
          @if (errorMsg) {
            <div class="alert alert-danger py-2 d-flex align-items-center gap-2 small">
              <span class="material-icons" style="font-size:18px">error_outline</span>
              {{ errorMsg }}
            </div>
          }

          <button type="submit" class="btn btn-primary w-100 py-2 fw-semibold" [disabled]="loading">
            @if (loading) { <mat-spinner diameter="20" class="d-inline-block" /> }
            @else { <span class="material-icons me-1" style="font-size:18px;vertical-align:middle">login</span> Sign In }
          </button>
        </form>

        <p class="text-center mt-3 small text-muted">
          No account? <a routerLink="/register" class="text-primary fw-semibold text-decoration-none">Register here</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-bg {
      min-height: 100vh;
      background: linear-gradient(135deg, #1a237e 0%, #3949ab 55%, #00897b 100%);
      display: flex; align-items: center; justify-content: center; padding: 24px;
    }
    .auth-card { width: 100%; max-width: 420px; border-radius: 16px; padding: 36px; border: none; }
    .auth-logo {
      width: 64px; height: 64px; border-radius: 16px;
      background: linear-gradient(135deg, #1a237e, #3949ab);
      display: flex; align-items: center; justify-content: center;
      .material-icons { font-size: 34px; color: #fff; }
    }
    .text-primary-custom { color: #1a237e; }
  `],
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  showPwd = false;
  errorMsg = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private snack: MatSnackBar) {
    this.form = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  get f() { return this.form.controls; }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true; this.errorMsg = '';
    const { email, password } = this.form.value;
    this.auth.login(email, password).subscribe({
      next: () => { this.snack.open('Welcome back!', '', { duration: 2500, panelClass: 'snack-success' }); this.router.navigate(['/dashboard']); },
      error: (e) => { this.loading = false; this.errorMsg = e.error?.detail || 'Invalid email or password'; },
    });
  }
}
