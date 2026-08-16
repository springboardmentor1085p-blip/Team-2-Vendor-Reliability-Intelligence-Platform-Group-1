import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { TokenResponse, UserOut, RegisterRequest } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'vrip_token';
  private readonly USER_KEY  = 'vrip_user';
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  currentUser = signal<UserOut | null>(this._loadUser());

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<TokenResponse> {
    const body = new HttpParams()
      .set('username', email)
      .set('password', password);

    return this.http
      .post<TokenResponse>(`${environment.apiUrl}/auth/login`, body.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      .pipe(
        tap((res) => {
          this._setToken(res.access_token);
          const user: UserOut = {
            id: res.user_id, email,
            full_name: res.full_name, role: res.role,
            is_active: true, is_verified: true,
          };
          this._setUser(user);
          this.currentUser.set(user);
        }),
      );
  }

  register(data: RegisterRequest): Observable<UserOut> {
    return this.http.post<UserOut>(`${environment.apiUrl}/auth/register`, data);
  }

  logout(): void {
    this._removeStorage(this.TOKEN_KEY);
    this._removeStorage(this.USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  /** Always returns the token — safe on both browser and SSR. */
  getToken(): string | null {
    return this._getStorage(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // ── Private storage helpers (safe for SSR) ────────────────────────────────

  private _getStorage(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch { /* SSR — no localStorage */ }
    return null;
  }

  private _setToken(token: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(this.TOKEN_KEY, token);
      }
    } catch { /* ignore */ }
  }

  private _setUser(user: UserOut): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      }
    } catch { /* ignore */ }
  }

  private _removeStorage(key: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch { /* ignore */ }
  }

  private _loadUser(): UserOut | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(this.USER_KEY);
        return raw ? JSON.parse(raw) : null;
      }
    } catch { /* ignore */ }
    return null;
  }
}
