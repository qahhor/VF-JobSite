import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthResponse, AuthUser, LoginRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'vjw_access_token';
  private readonly REFRESH_KEY = 'vjw_refresh_token';
  private readonly USER_KEY = 'vjw_user';

  private currentUser = signal<AuthUser | null>(this.loadUser());
  user = this.currentUser.asReadonly();
  isAuthenticated = computed(() => !!this.currentUser());

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: LoginRequest) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/employer/login`, credentials)
      .subscribe({
        next: (res) => {
          this.storeTokens(res);
          this.decodeAndStoreUser(res.accessToken);
          this.router.navigate(['/employer/dashboard']);
        },
        error: (err) => { throw err; }
      });
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  refreshToken() {
    const refresh = localStorage.getItem(this.REFRESH_KEY);
    if (!refresh) return null;
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/employer/refresh`, { refreshToken: refresh });
  }

  private storeTokens(res: AuthResponse) {
    localStorage.setItem(this.TOKEN_KEY, res.accessToken);
    localStorage.setItem(this.REFRESH_KEY, res.refreshToken);
  }

  private decodeAndStoreUser(token: string) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const user: AuthUser = {
        userId: payload.sub,
        email: payload.email || '',
        role: payload.role,
        employerId: payload.employer_id || '',
      };
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      this.currentUser.set(user);
    } catch { /* ignore */ }
  }

  /** Called by LoginComponent after manual token storage */
  setAuthFromTokens(accessToken: string, refreshToken: string) {
    this.storeTokens({ accessToken, refreshToken } as AuthResponse);
    this.decodeAndStoreUser(accessToken);
  }

  private loadUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
}
