import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PageResponse } from '../models';

export interface AdminAuthResponse {
  accessToken: string;
  refreshToken: string;
  userId?: string;
  role: string;
  mustChangePassword?: boolean;
}

export interface AdminProfile {
  id: string;
  email: string;
  role: string;
  totpEnabled: boolean;
  mustChangePassword: boolean;
  createdAt: string;
  lastLoginAt?: string;
  passwordChangedAt?: string;
  inviteSentAt?: string;
}

export interface AdminOverview {
  totalEmployers: number;
  totalCandidates: number;
  totalVacancies: number;
  activeVacancies: number;
  totalApplications: number;
  totalHired: number;
  newCandidatesLast7Days: number;
  newVacanciesLast7Days: number;
  pendingModeration: number;
  openFraudAlerts: number;
  activeAdmins: number;
  pendingEmployers: number;
  verifiedEmployers: number;
  totalUsers?: number;
  applicationsToday?: number;
  monthlyRevenue?: number;
  usersTrend?: number;
  vacanciesTrend?: number;
  applicationsTrend?: number;
  revenueTrend?: number;
}

export interface EmployerAdminRow {
  id: string;
  name: string;
  inn?: string;
  city?: string;
  email?: string;
  industry?: string;
  status: string;
  isVerified?: boolean;
  activeVacancies?: number;
  createdAt: string;
}

export interface EmployerDetailResponse {
  id: string;
  name: string;
  inn?: string;
  legalName?: string;
  logoUrl?: string;
  industry?: string;
  city?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  status: string;
  moderationStatus?: string;
  subscriptionPlan?: string;
  isVerified?: boolean;
  activeVacancies: number;
  description?: string;
  websiteUrl?: string;
  employeeCountRange?: string;
  foundedYear?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminEmployerRequest {
  name: string;
  inn?: string;
  legalName?: string;
  city?: string;
  region?: string;
  industry?: string;
  websiteUrl?: string;
  employeeCountRange?: string;
  foundedYear?: number | null;
  description?: string;
}

export interface AdminAuditItem {
  id: string;
  createdAt: string;
  adminId?: string;
  adminEmail?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
}

export interface AdminModerationItem {
  id: string;
  entityType: string;
  entityId: string;
  status: string;
  reason?: string;
  title?: string;
  subtitle?: string;
  previewText?: string;
  city?: string;
  category?: string;
  salaryLabel?: string;
  decidedAt?: string;
  createdAt: string;
}

export interface AdminFraudAlert {
  id: string;
  entityType: string;
  entityId: string;
  fraudType: string;
  score?: number;
  flags?: string | string[];
  reviewed?: boolean;
  reviewedBy?: string;
  createdAt: string;
}

export interface AdminUserRow {
  id: string;
  email: string;
  role: string;
  totpEnabled: boolean;
  mustChangePassword: boolean;
  currentUser: boolean;
  createdAt: string;
  lastLoginAt?: string;
  inviteSentAt?: string;
  passwordChangedAt?: string;
}

export interface TotpSetupResponse {
  secret: string;
  otpAuthUri: string;
}

export interface AdminInviteResponse {
  id: string;
  email: string;
  role: string;
  mustChangePassword: boolean;
  emailSent: boolean;
  temporaryPassword: string;
  inviteSentAt?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private base = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  login(email: string, password: string, totpCode?: string): Observable<AdminAuthResponse> {
    return this.http.post<AdminAuthResponse>(`${this.base}/auth/login`, { email, password, totpCode });
  }

  getCurrentAdminProfile(): Observable<AdminProfile> {
    return this.http.get<AdminProfile>(`${this.base}/auth/me`);
  }

  changeAdminPassword(currentPassword: string, newPassword: string): Observable<AdminProfile> {
    return this.http.post<AdminProfile>(`${this.base}/auth/change-password`, { currentPassword, newPassword });
  }

  setupAdminTwoFactor(): Observable<TotpSetupResponse> {
    return this.http.post<TotpSetupResponse>(`${this.base}/auth/2fa/setup`, {});
  }

  getOverview(): Observable<AdminOverview> {
    return this.http.get<AdminOverview>(`${this.base}/analytics/overview`);
  }

  getAuditLogs(page = 0, size = 20): Observable<PageResponse<AdminAuditItem>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<AdminAuditItem>>(`${this.base}/audit`, { params });
  }

  getEmployers(page = 0, size = 20, status?: string, search?: string): Observable<PageResponse<EmployerAdminRow>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) params = params.set('status', status);
    if (search) params = params.set('search', search);
    return this.http.get<PageResponse<EmployerAdminRow>>(`${this.base}/employers`, { params });
  }

  changeEmployerStatus(id: string, status: string): Observable<EmployerAdminRow> {
    return this.http.patch<EmployerAdminRow>(`${this.base}/employers/${id}/status`, null, { params: { status } });
  }

  verifyEmployer(id: string): Observable<EmployerAdminRow> {
    return this.http.post<EmployerAdminRow>(`${this.base}/employers/${id}/verify`, {});
  }

  getEmployerDetail(id: string): Observable<EmployerDetailResponse> {
    return this.http.get<EmployerDetailResponse>(`${this.base}/employers/${id}`);
  }

  createEmployer(data: AdminEmployerRequest): Observable<EmployerDetailResponse> {
    return this.http.post<EmployerDetailResponse>(`${this.base}/employers`, data);
  }

  updateEmployer(id: string, data: AdminEmployerRequest): Observable<EmployerDetailResponse> {
    return this.http.put<EmployerDetailResponse>(`${this.base}/employers/${id}`, data);
  }

  deleteEmployer(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/employers/${id}`);
  }

  getModerationQueue(status?: string, page = 0, size = 20): Observable<PageResponse<AdminModerationItem>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) params = params.set('status', status);
    return this.http.get<PageResponse<AdminModerationItem>>(`${this.base}/moderation/queue`, { params });
  }

  getPendingModeration(page = 0, size = 20): Observable<PageResponse<AdminModerationItem>> {
    return this.getModerationQueue('PENDING', page, size);
  }

  approveModeration(id: string): Observable<void> {
    return this.http.post<void>(`${this.base}/moderation/${id}/approve`, {});
  }

  rejectModeration(id: string, reason: string): Observable<void> {
    return this.http.post<void>(`${this.base}/moderation/${id}/reject`, { reason });
  }

  getFraudAlerts(reviewed = false, page = 0, size = 20): Observable<PageResponse<AdminFraudAlert>> {
    const params = new HttpParams()
      .set('reviewed', reviewed)
      .set('page', page)
      .set('size', size);
    return this.http.get<PageResponse<AdminFraudAlert>>(`${this.base}/fraud`, { params });
  }

  reviewFraudAlert(id: string): Observable<{ status: string }> {
    return this.http.patch<{ status: string }>(`${this.base}/fraud/${id}/review`, {});
  }

  getAdminUsers(page = 0, size = 20, search?: string): Observable<PageResponse<AdminUserRow>> {
    let params = new HttpParams()
      .set('type', 'ADMIN')
      .set('page', page)
      .set('size', size);
    if (search) params = params.set('search', search);
    return this.http.get<PageResponse<AdminUserRow>>(`${this.base}/users`, { params });
  }

  createAdminUser(payload: { email: string; password: string; role: string }): Observable<AdminUserRow> {
    return this.http.post<AdminUserRow>(`${this.base}/users/admins`, payload);
  }

  inviteAdminUser(payload: { email: string; role: string }): Observable<AdminInviteResponse> {
    return this.http.post<AdminInviteResponse>(`${this.base}/users/admins/invite`, payload);
  }

  updateAdminRole(id: string, role: string): Observable<AdminUserRow> {
    return this.http.patch<AdminUserRow>(`${this.base}/users/admins/${id}/role`, { role });
  }

  resetAdminPassword(id: string, password: string): Observable<AdminUserRow> {
    return this.http.post<AdminUserRow>(`${this.base}/users/admins/${id}/reset-password`, { password });
  }

  // Users (all types: candidates, employers, admins)
  getUsers(type: string, page = 0, size = 20, search?: string): Observable<PageResponse<any>> {
    let params = new HttpParams().set('type', type).set('page', page).set('size', size);
    if (search) params = params.set('search', search);
    return this.http.get<PageResponse<any>>(`${this.base}/users`, { params });
  }

  suspendUser(id: string): Observable<any> {
    return this.http.put(`${this.base}/users/${id}/suspend`, {});
  }

  activateUser(id: string): Observable<any> {
    return this.http.put(`${this.base}/users/${id}/activate`, {});
  }

  // A/B Experiments
  getExperiments(page = 0): Observable<PageResponse<any>> {
    const params = new HttpParams().set('page', page);
    return this.http.get<PageResponse<any>>(`${this.base}/ab/experiments`, { params });
  }

  createExperiment(name: string, description: string): Observable<any> {
    return this.http.post(`${this.base}/ab/experiments`, { name, description });
  }

  getExperimentStats(name: string): Observable<any> {
    return this.http.get(`${this.base}/ab/experiments/${name}/stats`);
  }

  activateExperiment(name: string): Observable<any> {
    return this.http.post(`${this.base}/ab/experiments/${name}/activate`, {});
  }

  deactivateExperiment(name: string): Observable<any> {
    return this.http.post(`${this.base}/ab/experiments/${name}/deactivate`, {});
  }

  // System settings
  getSystemConfig(): Observable<any> {
    return this.http.get(`${this.base}/settings`);
  }

  saveSystemConfig(config: any): Observable<any> {
    return this.http.put(`${this.base}/settings`, config);
  }

  // Health
  getHealthStatus(): Observable<Record<string, boolean>> {
    return this.http.get<Record<string, boolean>>(`${this.base}/health`);
  }

  // ── References (Справочники) ──────────────────────────

  // Cities
  getCities(page: number, size: number, search?: string): Observable<PageResponse<RefCity>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search) params = params.set('search', search);
    return this.http.get<PageResponse<RefCity>>(`${this.base}/references/cities`, { params });
  }
  createCity(city: RefCityRequest): Observable<RefCity> {
    return this.http.post<RefCity>(`${this.base}/references/cities`, city);
  }
  updateCity(id: string, city: RefCityRequest): Observable<RefCity> {
    return this.http.put<RefCity>(`${this.base}/references/cities/${id}`, city);
  }
  deleteCity(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/references/cities/${id}`);
  }

  getRegionsByCountry(countryIso2: string): Observable<RefRegion[]> {
    return this.http.get<RefRegion[]>(`${this.base}/references/regions/by-country/${countryIso2}`);
  }

  getCitiesByCountry(countryIso2: string, region?: string, activeOnly = false): Observable<RefCity[]> {
    let params = new HttpParams();
    if (region) params = params.set('region', region);
    if (activeOnly) params = params.set('activeOnly', 'true');
    return this.http.get<RefCity[]>(`${this.base}/references/cities/by-country/${countryIso2}`, { params });
  }
  toggleCityActive(id: string): Observable<RefCity> {
    return this.http.patch<RefCity>(`${this.base}/references/cities/${id}/toggle-active`, {});
  }

  // Regions
  getRegions(page: number, size: number, search?: string): Observable<PageResponse<RefRegion>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search) params = params.set('search', search);
    return this.http.get<PageResponse<RefRegion>>(`${this.base}/references/regions`, { params });
  }
  createRegion(region: RefRegionRequest): Observable<RefRegion> {
    return this.http.post<RefRegion>(`${this.base}/references/regions`, region);
  }
  updateRegion(id: string, region: RefRegionRequest): Observable<RefRegion> {
    return this.http.put<RefRegion>(`${this.base}/references/regions/${id}`, region);
  }
  deleteRegion(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/references/regions/${id}`);
  }
  toggleRegionActive(id: string): Observable<RefRegion> {
    return this.http.patch<RefRegion>(`${this.base}/references/regions/${id}/toggle-active`, {});
  }

  // Countries
  getCountries(): Observable<RefCountry[]> {
    return this.http.get<RefCountry[]>(`${this.base}/references/countries`);
  }
  updateCountry(id: string, country: RefCountryRequest): Observable<RefCountry> {
    return this.http.put<RefCountry>(`${this.base}/references/countries/${id}`, country);
  }
}

// Reference interfaces
export interface RefCity {
  id: string; nameUzLat: string; nameRu: string; nameEn: string;
  country: string; region: string; countryIso2?: string; regionId?: string;
  population: number | null; isActive: boolean;
}
export interface RefCityRequest {
  nameUzLat: string; nameRu: string; nameEn: string;
  country: string; region: string; population: number | null;
}
export interface RefRegion {
  id: string; code: string; fullCode: string;
  nameUzLat: string; nameRu: string; nameEn: string; countryIso2: string;
  isActive: boolean;
}
export interface RefRegionRequest {
  code: string; fullCode: string;
  nameUzLat: string; nameRu: string; nameEn: string;
  countryIso2?: string;
}
export interface RefCountry {
  id: string; iso2: string;
  nameUzLat: string; nameRu: string; nameEn: string;
  capital: string; phoneCode: string;
}
export interface RefCountryRequest {
  nameUzLat: string; nameRu: string; nameEn: string;
  capital: string; phoneCode: string;
}
