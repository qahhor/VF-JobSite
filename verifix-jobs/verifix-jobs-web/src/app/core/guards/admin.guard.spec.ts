import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { adminGuard } from './admin.guard';

describe('adminGuard', () => {
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    localStorage.clear();
    router = jasmine.createSpyObj('Router', ['navigate']);
    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: router }],
    });
  });

  afterEach(() => localStorage.clear());

  function runGuard(url = '/admin/dashboard'): boolean {
    const route = {} as any;
    const state = { url } as any;
    return TestBed.runInInjectionContext(() => adminGuard(route, state)) as boolean;
  }

  function makeJwt(exp: number): string {
    const header = btoa(JSON.stringify({ alg: 'HS256' }));
    const payload = btoa(JSON.stringify({ sub: 'a0000000-0000-0000-0000-000000000001', role: 'SUPER_ADMIN', exp }));
    return `${header}.${payload}.fake-signature`;
  }

  it('redirects to /admin/login when no token', () => {
    expect(runGuard()).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/admin/login']);
  });

  it('redirects to /admin/login when token is expired', () => {
    const expired = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
    localStorage.setItem('vjw_admin_token', makeJwt(expired));
    expect(runGuard()).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/admin/login']);
    expect(localStorage.getItem('vjw_admin_token')).toBeNull();
  });

  it('allows access with valid non-expired token', () => {
    const future = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    localStorage.setItem('vjw_admin_token', makeJwt(future));
    expect(runGuard()).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('redirects to /admin/access when mustChangePassword is set', () => {
    const future = Math.floor(Date.now() / 1000) + 3600;
    localStorage.setItem('vjw_admin_token', makeJwt(future));
    localStorage.setItem('vjw_admin_must_change_password', 'true');
    expect(runGuard()).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/admin/access']);
  });

  it('allows /admin/access route even when mustChangePassword is set', () => {
    const future = Math.floor(Date.now() / 1000) + 3600;
    localStorage.setItem('vjw_admin_token', makeJwt(future));
    localStorage.setItem('vjw_admin_must_change_password', 'true');
    expect(runGuard('/admin/access')).toBeTrue();
  });

  it('redirects to /admin/login when token has invalid format', () => {
    localStorage.setItem('vjw_admin_token', 'not-a-jwt');
    expect(runGuard()).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/admin/login']);
  });
});
