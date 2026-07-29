import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { LoginRequest } from '../models/login.model';
import { RegisterRequest } from '../models/register.model';
import { Token } from '../models/token.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private http = inject(HttpClient);

  private readonly API = 'http://127.0.0.1:8000/auth';

  /**
   * Login
   */
  login(data: LoginRequest): Observable<Token> {
    return this.http.post<Token>(
      `${this.API}/login`,
      data
    );
  }

  /**
   * Register
   */
  register(data: RegisterRequest): Observable<User> {
    return this.http.post<User>(
      `${this.API}/register`,
      data
    );
  }

  /**
   * Get Current Logged-in User
   */
  me(): Observable<User> {
    return this.http.get<User>(
      `${this.API}/me`
    );
  }

  /**
   * Save JWT Token
   */
  saveToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  /**
   * Get JWT Token
   */
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Check Login Status
   */
  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  /**
   * Logout
   */
  logout(): void {

    localStorage.removeItem('access_token');

    window.location.href = '/login';

  }

}