import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { UserRole } from '../../models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatSnackBarModule,
  ],
  template: `
    <div class="login-wrapper d-flex align-items-center justify-content-center min-vh-100">
      <mat-card class="login-card shadow-lg p-3">
        <mat-card-header class="mb-3">
          <div class="text-center w-100">
            <h2 class="mt-2 mb-0">Create Account</h2>
            <p class="text-muted small">Register on Vendor Reliability Platform</p>
          </div>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="w-100 mb-2">
              <mat-label>Full Name</mat-label>
              <input matInput formControlName="full_name">
              <mat-error>Full name is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-100 mb-2">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email">
              <mat-error>Valid email is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-100 mb-2">
              <mat-label>Password</mat-label>
              <input matInput type="password" formControlName="password">
              <mat-error>Password is required (min 6 chars)</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-100 mb-3">
              <mat-label>Role</mat-label>
              <mat-select formControlName="role">
                <mat-option *ngFor="let r of roles" [value]="r.value">{{ r.label }}</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit"
                    class="w-100" [disabled]="loading">
              {{ loading ? 'Registering...' : 'Register' }}
            </button>
          </form>
        </mat-card-content>

        <mat-card-actions class="text-center mt-2">
          <small class="text-muted">Already have an account? <a routerLink="/login">Sign In</a></small>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-wrapper { background: linear-gradient(135deg, #3f51b5 0%, #1a237e 100%); }
    .login-card { width: 100%; max-width: 440px; border-radius: 12px !important; }
  `]
})
export class RegisterComponent {
  roles: { value: UserRole; label: string }[] = [
    { value: 'procurement_manager',   label: 'Procurement Manager' },
    { value: 'supply_chain_manager',  label: 'Supply Chain Manager' },
    { value: 'vendor',                label: 'Vendor' },
    { value: 'finance_officer',       label: 'Finance Officer' },
    { value: 'auditor',               label: 'Auditor' },
    { value: 'administrator',         label: 'Administrator' },
  ];

  form: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private snack: MatSnackBar,
  ) {
    this.form = this.fb.group({
      full_name: ['', Validators.required],
      email:     ['', [Validators.required, Validators.email]],
      password:  ['', [Validators.required, Validators.minLength(6)]],
      role:      ['procurement_manager' as UserRole, Validators.required],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.auth.register(this.form.value as any).subscribe({
      next: () => {
        this.snack.open('Account created! Please log in.', 'Close', { duration: 3000 });
        this.router.navigate(['/login']);
      },
      error: err => {
        this.loading = false;
        this.snack.open(err.error?.detail || 'Registration failed', 'Close', { duration: 4000 });
      },
    });
  }
}
