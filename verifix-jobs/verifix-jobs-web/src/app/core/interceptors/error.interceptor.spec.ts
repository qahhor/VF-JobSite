import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { errorInterceptor } from './error.interceptor';
import { AuthService } from '../services/auth.service';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let router: jasmine.SpyObj<Router>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    localStorage.clear();
    router = jasmine.createSpyObj('Router', ['navigate']);
    authService = jasmine.createSpyObj('AuthService', ['refreshToken', 'logout', 'getToken', 'setAuthFromTokens', 'isAuthenticated'], {
      isAuthenticated: jasmine.createSpy().and.returnValue(false),
    });
    authService.refreshToken.and.returnValue(null);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: Router, useValue: router },
        { provide: AuthService, useValue: authService },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('clears admin token and redirects on 403 for admin API', () => {
    localStorage.setItem('vjw_admin_token', 'expired-token');
    localStorage.setItem('vjw_admin_role', 'SUPER_ADMIN');

    http.get('/api/v1/admin/analytics/overview').subscribe({ error: () => {} });

    httpMock.expectOne('/api/v1/admin/analytics/overview').flush(null, { status: 403, statusText: 'Forbidden' });

    expect(localStorage.getItem('vjw_admin_token')).toBeNull();
    expect(localStorage.getItem('vjw_admin_role')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/admin/login']);
  });

  it('clears admin token and redirects on 401 for admin API', () => {
    localStorage.setItem('vjw_admin_token', 'expired-token');

    http.get('/api/v1/admin/auth/me').subscribe({ error: () => {} });

    httpMock.expectOne('/api/v1/admin/auth/me').flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(localStorage.getItem('vjw_admin_token')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/admin/login']);
  });

  it('redirects to /admin/access on PASSWORD_CHANGE_REQUIRED', () => {
    http.get('/api/v1/admin/dashboard').subscribe({ error: () => {} });

    httpMock.expectOne('/api/v1/admin/dashboard').flush(
      { error: 'PASSWORD_CHANGE_REQUIRED' },
      { status: 403, statusText: 'Forbidden' }
    );

    expect(localStorage.getItem('vjw_admin_must_change_password')).toBe('true');
    expect(router.navigate).toHaveBeenCalledWith(['/admin/access']);
  });

  it('does NOT intercept admin login errors', () => {
    http.post('/api/v1/admin/auth/login', {}).subscribe({ error: () => {} });

    httpMock.expectOne('/api/v1/admin/auth/login').flush(
      { error: 'UNAUTHORIZED' },
      { status: 401, statusText: 'Unauthorized' }
    );

    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('calls logout on 403 for non-admin requests', () => {
    http.get('/api/v1/employer/dashboard').subscribe({ error: () => {} });

    httpMock.expectOne('/api/v1/employer/dashboard').flush(null, { status: 403, statusText: 'Forbidden' });

    expect(authService.logout).toHaveBeenCalled();
  });

  it('passes through non-auth errors', () => {
    let receivedError: any;
    http.get('/api/v1/public/vacancies/nonexistent').subscribe({
      error: (e) => { receivedError = e; }
    });

    httpMock.expectOne('/api/v1/public/vacancies/nonexistent').flush(null, { status: 404, statusText: 'Not Found' });

    expect(receivedError?.status).toBe(404);
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
