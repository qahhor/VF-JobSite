import { Routes } from '@angular/router';
import { adminAuthGuard } from './core/auth.guard';

export const adminRoutes: Routes = [
  { path: 'login', loadComponent: () => import('./features/login.component').then(m => m.AdminLoginComponent) },
  {
    path: '',
    loadComponent: () => import('./layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [adminAuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'moderation', loadComponent: () => import('./features/moderation.component').then(m => m.ModerationComponent) },
      { path: 'users', loadComponent: () => import('./features/users.component').then(m => m.UsersComponent) },
      { path: 'audit', loadComponent: () => import('./features/audit.component').then(m => m.AuditComponent) },
      { path: 'analytics', loadComponent: () => import('./features/analytics.component').then(m => m.AdminAnalyticsComponent) },
      { path: 'ab-testing', loadComponent: () => import('./features/ab-testing.component').then(m => m.AbTestingComponent) },
      { path: 'fraud', loadComponent: () => import('./features/fraud.component').then(m => m.FraudComponent) },
      { path: 'settings', loadComponent: () => import('./features/system-config.component').then(m => m.SystemConfigComponent) },
    ]
  },
  { path: '**', redirectTo: '' }
];
