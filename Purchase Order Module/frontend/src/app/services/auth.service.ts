import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, RegisterRequest, User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = environment.apiUrl;
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  currentUser = signal<User | null>(this._loadUser());
  private _token = signal<string | null>(this._loadToken());

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string) {
    const body = new URLSearchParams({ username: email, password });
    return this.http
      .post<AuthResponse>(`${this.api}/auth/login`, body.toString(), {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }),
      })
      .pipe(
        tap((res) => {
          if (this.isBrowser) {
            localStorage.setItem('vr_token', res.access_token);
            localStorage.setItem('vr_user', JSON.stringify(res.user));
          }
          this._token.set(res.access_token);
          this.currentUser.set(res.user);
        })
      );
  }

  register(data: RegisterRequest) {
    return this.http.post<User>(`${this.api}/auth/register`, data);
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('vr_token');
      localStorage.removeItem('vr_user');
    }
    this._token.set(null);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null { return this._token(); }
  isAuthenticated(): boolean { return !!this._token(); }

  private _loadToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem('vr_token');
  }

  private _loadUser(): User | null {
    try {
      if (typeof localStorage === 'undefined') return null;
      return JSON.parse(localStorage.getItem('vr_user') || 'null');
    } catch { return null; }
  }
}
