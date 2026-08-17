import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private auth = inject(Auth);
  private router = inject(Router);

  registerData = {
    name: '',
    email: '',
    password: '',
    role: 'Vendor'
  };

  registerUser() {
    if (
      !this.registerData.name ||
      !this.registerData.email ||
      !this.registerData.password ||
      !this.registerData.role
    ) {
      alert('Please fill all the fields!');
      return;
    }

    if (this.registerData.password.length < 6) {
      alert('Password must contain at least 6 characters!');
      return;
    }

    this.auth.register(this.registerData).subscribe({
      next: () => {
        alert('Registration Successful!');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.log(error);
        alert(error?.error?.detail || 'Registration Failed!');
      }
    });
  }
}