import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const appRoutes: Routes = [
  // Public routes
  { path: '', loadComponent: () => import('./features/public/public-home.component').then(m => m.PublicHomeComponent) },
  { path: 'jobs', loadComponent: () => import('./features/public/public-vacancy-list.component').then(m => m.PublicVacancyListComponent) },
  { path: 'jobs/:slug', loadComponent: () => import('./features/public/public-vacancy-detail.component').then(m => m.PublicVacancyDetailComponent) },
  { path: 'companies', loadComponent: () => import('./features/public/public-company-list.component').then(m => m.PublicCompanyListComponent) },
  { path: 'companies/:slug', loadComponent: () => import('./features/public/public-company-detail.component').then(m => m.PublicCompanyDetailComponent) },
  { path: 'favorites', loadComponent: () => import('./features/public/public-favorites.component').then(m => m.PublicFavoritesComponent) },
  { path: 'salary', loadComponent: () => import('./features/public/public-salary.component').then(m => m.PublicSalaryComponent) },

  // Auth & Onboarding
  { path: 'login', loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent) },
  { path: 'onboarding', loadComponent: () => import('./features/onboarding/onboarding.component').then(m => m.OnboardingComponent), canActivate: [authGuard] },

  // Employer portal (authenticated)
  {
    path: 'employer',
    loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'vacancies', loadComponent: () => import('./features/vacancies/vacancy-list.component').then(m => m.VacancyListComponent) },
      { path: 'vacancies/new', loadComponent: () => import('./features/vacancies/vacancy-form.component').then(m => m.VacancyFormComponent) },
      { path: 'vacancies/:id', loadComponent: () => import('./features/vacancies/vacancy-detail.component').then(m => m.VacancyDetailComponent) },
      { path: 'vacancies/:id/edit', loadComponent: () => import('./features/vacancies/vacancy-form.component').then(m => m.VacancyFormComponent) },
      { path: 'pipeline', loadComponent: () => import('./features/pipeline/pipeline.component').then(m => m.PipelineComponent) },
      { path: 'candidates', loadComponent: () => import('./features/candidates/candidates.component').then(m => m.CandidatesComponent) },
      { path: 'analytics', loadComponent: () => import('./features/analytics/analytics.component').then(m => m.AnalyticsComponent) },
      { path: 'billing', loadComponent: () => import('./features/billing/billing.component').then(m => m.BillingComponent) },
      { path: 'settings', loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent) },
      { path: 'integrations', loadComponent: () => import('./features/integrations/integrations.component').then(m => m.IntegrationsComponent) },
      { path: 'automations', loadComponent: () => import('./features/automations/automations.component').then(m => m.AutomationsComponent) },
      { path: 'saved-searches', loadComponent: () => import('./features/saved-searches/saved-searches.component').then(m => m.SavedSearchesComponent) },
      { path: 'chat', loadComponent: () => import('./features/chat/chat.component').then(m => m.ChatComponent) },
    ]
  },

  // Admin panel
  { path: 'admin/login', loadComponent: () => import('./features/admin/admin-login.component').then(m => m.AdminLoginComponent) },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'employers', loadComponent: () => import('./features/admin/admin-employers.component').then(m => m.AdminEmployersComponent) },
      { path: 'moderation', loadComponent: () => import('./features/admin/admin-moderation.component').then(m => m.AdminModerationComponent) },
      { path: 'fraud', loadComponent: () => import('./features/admin/admin-fraud.component').then(m => m.AdminFraudComponent) },
      { path: 'gov-sync', loadComponent: () => import('./features/admin/admin-gov.component').then(m => m.AdminGovComponent) },
    ]
  },

  // Legacy redirects
  { path: 'dashboard', redirectTo: 'employer/dashboard', pathMatch: 'full' },
  { path: 'vacancies', redirectTo: 'employer/vacancies', pathMatch: 'full' },
  { path: 'pipeline', redirectTo: 'employer/pipeline', pathMatch: 'full' },
  { path: 'candidates', redirectTo: 'employer/candidates', pathMatch: 'full' },
  { path: 'analytics', redirectTo: 'employer/analytics', pathMatch: 'full' },
  { path: 'billing', redirectTo: 'employer/billing', pathMatch: 'full' },
  { path: 'settings', redirectTo: 'employer/settings', pathMatch: 'full' },

  { path: '**', redirectTo: '' }
];
