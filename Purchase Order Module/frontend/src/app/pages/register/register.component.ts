import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';
import { UserRole } from '../../models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatSnackBarModule, MatProgressSpinnerModule],
  template: `
    <div class="auth-bg">
      <div class="auth-card card shadow-lg">
        <div class="text-center mb-4">
          <div class="auth-logo mx-auto mb-3">
            <span class="material-icons">inventory_2</span>
          </div>
          <h4 class="fw-bold" style="color:#1a237e">Create Account</h4>
          <p class="text-muted small">Join the Vendor Reliability Platform</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="mb-3">
            <label class="form-label fw-semibold small">Full Name</label>
            <div class="input-group">
              <span class="input-group-text"><span class="material-icons" style="font-size:18px">person</span></span>
              <input class="form-control" formControlName="full_name"
                [class.is-invalid]="f['full_name'].invalid && f['full_name'].touched" />
              @if (f['full_name'].invalid && f['full_name'].touched) {
                <div class="invalid-feedback">Full name is required</div>
              }
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label fw-semibold small">Email Address</label>
            <div class="input-group">
              <span class="input-group-text"><span class="material-icons" style="font-size:18px">email</span></span>
              <input type="email" class="form-control" formControlName="email"
                [class.is-invalid]="f['email'].invalid && f['email'].touched" />
              @if (f['email'].invalid && f['email'].touched) {
                <div class="invalid-feedback">Valid email required</div>
              }
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label fw-semibold small">Role</label>
            <select class="form-select" formControlName="role">
              @for (r of roles; track r) { <option [value]="r">{{ r }}</option> }
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label fw-semibold small">Password</label>
            <div class="input-group">
              <span class="input-group-text"><span class="material-icons" style="font-size:18px">lock</span></span>
              <input [type]="showPwd ? 'text' : 'password'" class="form-control"
                formControlName="password"
                [class.is-invalid]="f['password'].invalid && f['password'].touched" />
              <button type="button" class="btn btn-outline-secondary" (click)="showPwd = !showPwd">
                <span class="material-icons" style="font-size:18px">{{ showPwd ? 'visibility_off' : 'visibility' }}</span>
              </button>
              @if (f['password'].hasError('minlength') && f['password'].touched) {
                <div class="invalid-feedback">Minimum 8 characters</div>
              }
            </div>
          </div>

          @if (errorMsg) {
            <div class="alert alert-danger py-2 small">{{ errorMsg }}</div>
          }

          <button type="submit" class="btn btn-primary w-100 py-2 fw-semibold" [disabled]="loading">
            @if (loading) { <mat-spinner diameter="20" class="d-inline-block" /> }
            @else { Register }
          </button>
        </form>

        <p class="text-center mt-3 small text-muted">
          Already registered? <a routerLink="/login" class="fw-semibold text-decoration-none" style="color:#1a237e">Sign in</a>
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
    .auth-card { width: 100%; max-width: 440px; border-radius: 16px; padding: 36px; border: none; }
    .auth-logo {
      width: 64px; height: 64px; border-radius: 16px;
      background: linear-gradient(135deg, #1a237e, #3949ab);
      display: flex; align-items: center; justify-content: center;
      .material-icons { font-size: 34px; color: #fff; }
    }
  `],
})
export class RegisterComponent {
  form: FormGroup;
  loading = false;
  showPwd = false;
  errorMsg = '';
  roles: UserRole[] = ['Administrator', 'Procurement Manager', 'Supply Chain Manager', 'Finance Officer', 'Auditor'];

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private snack: MatSnackBar) {
    this.form = this.fb.group({
      full_name: ['', Validators.required],
      email:     ['', [Validators.required, Validators.email]],
      role:      ['Procurement Manager', Validators.required],
      password:  ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  get f() { return this.form.controls; }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true; this.errorMsg = '';
    this.auth.register(this.form.value).subscribe({
      next: () => {
        this.snack.open('Registration successful! Please sign in.', '', { duration: 3000, panelClass: 'snack-success' });
        this.router.navigate(['/login']);
      },
      error: (e) => { this.loading = false; this.errorMsg = e.error?.detail || 'Registration failed'; },
    });
  }
}
