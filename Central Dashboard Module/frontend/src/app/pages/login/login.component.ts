import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatIconModule, MatProgressSpinnerModule, MatSnackBarModule,
  ],
})
export class LoginComponent {
  form: FormGroup;
  loading = signal(false);
  showPass = false;
  errorMsg = '';

  features = [
    { icon: 'insights',       text: 'Real-time KPI dashboards & analytics' },
    { icon: 'speed',          text: 'Vendor reliability scoring engine' },
    { icon: 'local_shipping', text: 'Delivery performance monitoring' },
    { icon: 'gavel',          text: 'Contract compliance tracking' },
    { icon: 'shield',         text: 'Procurement risk management' },
  ];

  stats = [
    { value: '1,000+', label: 'Vendors' },
    { value: '99.9%',  label: 'Uptime' },
    { value: '<300ms', label: 'API Resp.' },
  ];

  demoUsers = [
    { role: 'Admin',   email: 'admin@vrip.com', pass: 'Admin@123' },
    { role: 'Manager', email: 'pm@vrip.com',    pass: 'Admin@123' },
  ];

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
    if (auth.isLoggedIn()) router.navigate(['/dashboard']);
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && c.touched);
  }

  fillDemo(email: string, pass: string): void {
    this.form.patchValue({ email, password: pass });
    this.errorMsg = '';
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.loading.set(true);
    this.errorMsg = '';
    const { email, password } = this.form.value;

    this.auth.login(email, password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.loading.set(false);
        this.errorMsg = err?.error?.detail ?? 'Invalid credentials. Please try again.';
      },
    });
  }
}
