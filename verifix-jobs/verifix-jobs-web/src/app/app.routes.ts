import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const appRoutes: Routes = [
  // Public routes
  { path: '', loadComponent: () => import('./features/public/public-home.component').then(m => m.PublicHomeComponent) },
  { path: 'jobs', loadComponent: () => import('./features/public/public-vacancy-list.component').then(m => m.PublicVacancyListComponent) },
  { path: 'map', loadComponent: () => import('./features/public/vacancy-map.component').then(m => m.VacancyMapComponent) },
  { path: 'jobs/:slug', loadComponent: () => import('./features/public/public-vacancy-detail.component').then(m => m.PublicVacancyDetailComponent) },
  { path: 'categories', loadComponent: () => import('./features/public/public-categories.component').then(m => m.PublicCategoriesComponent) },
  { path: 'vacancies/:city/:category', loadComponent: () => import('./features/public/public-vacancy-list.component').then(m => m.PublicVacancyListComponent) },
  { path: 'vacancies/category/:category', loadComponent: () => import('./features/public/public-vacancy-list.component').then(m => m.PublicVacancyListComponent) },
  { path: 'vacancies/:city', loadComponent: () => import('./features/public/public-vacancy-list.component').then(m => m.PublicVacancyListComponent) },
  { path: 'companies', loadComponent: () => import('./features/public/public-company-list.component').then(m => m.PublicCompanyListComponent) },
  { path: 'companies/:slug', loadComponent: () => import('./features/public/public-company-detail.component').then(m => m.PublicCompanyDetailComponent) },
  { path: 'favorites', loadComponent: () => import('./features/public/public-favorites.component').then(m => m.PublicFavoritesComponent) },
  { path: 'saved-searches', loadComponent: () => import('./features/saved-searches/saved-searches.component').then(m => m.SavedSearchesComponent) },
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
      { path: 'team', loadComponent: () => import('./features/team/team.component').then(m => m.TeamComponent) },
      { path: 'hiring-projects', loadComponent: () => import('./features/hiring-projects/hiring-projects.component').then(m => m.HiringProjectsComponent) },
      { path: 'org-memory', loadComponent: () => import('./features/org-memory/org-memory.component').then(m => m.OrgMemoryComponent) },
      { path: 'talent-hub', loadComponent: () => import('./features/talent-hub/talent-hub.component').then(m => m.TalentHubComponent) },
      { path: 'ai-agent', loadComponent: () => import('./features/ai-agent/ai-agent.component').then(m => m.AiAgentComponent) },
      { path: 'churn-alerts', loadComponent: () => import('./features/ai-agent/churn-alerts.component').then(m => m.ChurnAlertsComponent) },
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
      { path: 'users', loadComponent: () => import('./features/admin/admin-users.component').then(m => m.AdminUsersComponent) },
      { path: 'audit', loadComponent: () => import('./features/admin/admin-audit.component').then(m => m.AdminAuditComponent) },
      { path: 'analytics', loadComponent: () => import('./features/admin/admin-analytics.component').then(m => m.AdminAnalyticsComponent) },
      { path: 'experiments', loadComponent: () => import('./features/admin/admin-experiments.component').then(m => m.AdminExperimentsComponent) },
      { path: 'fraud', loadComponent: () => import('./features/admin/admin-fraud.component').then(m => m.AdminFraudComponent) },
      { path: 'gov-sync', loadComponent: () => import('./features/admin/admin-gov.component').then(m => m.AdminGovComponent) },
      { path: 'settings', loadComponent: () => import('./features/admin/admin-settings.component').then(m => m.AdminSettingsComponent) },
      { path: 'access', loadComponent: () => import('./features/admin/admin-access.component').then(m => m.AdminAccessComponent) },
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
