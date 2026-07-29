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
export class AuthService {

  private http = inject(HttpClient);

  private readonly API_URL = 'http://127.0.0.1:8000/auth';

  login(data: LoginRequest): Observable<Token> {
    return this.http.post<Token>(
      `${this.API_URL}/login`,
      data
    );
  }

  register(data: RegisterRequest): Observable<User> {
    return this.http.post<User>(
      `${this.API_URL}/register`,
      data
    );
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(
      `${this.API_URL}/me`
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
  }

  saveToken(token: string): void {
    localStorage.setItem(
      'access_token',
      token
    );
  }

  getToken(): string | null {
    return localStorage.getItem(
      'access_token'
    );
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

}