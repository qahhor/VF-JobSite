import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Vacancy, VacancyCreateRequest, Application, Candidate,
  DashboardData, EmployerProfile, PricingPlan, Payment, PageResponse
} from '../models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Vacancies
  getVacancies(page = 0, size = 20, status?: string, category?: string, city?: string): Observable<PageResponse<Vacancy>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) params = params.set('status', status);
    if (category) params = params.set('category', category);
    if (city) params = params.set('city', city);
    return this.http.get<PageResponse<Vacancy>>(`${this.base}/vacancies`, { params });
  }
  getVacancy(id: string): Observable<Vacancy> { return this.http.get<Vacancy>(`${this.base}/vacancies/${id}`); }
  createVacancy(req: VacancyCreateRequest): Observable<Vacancy> { return this.http.post<Vacancy>(`${this.base}/vacancies`, req); }
  updateVacancy(id: string, req: Partial<VacancyCreateRequest>): Observable<Vacancy> { return this.http.put<Vacancy>(`${this.base}/vacancies/${id}`, req); }
  deleteVacancy(id: string): Observable<void> { return this.http.delete<void>(`${this.base}/vacancies/${id}`); }
  publishVacancy(id: string): Observable<Vacancy> { return this.http.post<Vacancy>(`${this.base}/vacancies/${id}/publish`, {}); }

  // Applications
  getApplications(vacancyId?: string, status?: string, page = 0, size = 20): Observable<PageResponse<Application>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (vacancyId) params = params.set('vacancyId', vacancyId);
    if (status) params = params.set('status', status);
    return this.http.get<PageResponse<Application>>(`${this.base}/applications`, { params });
  }
  changeApplicationStatus(id: string, status: string, note?: string): Observable<Application> {
    return this.http.put<Application>(`${this.base}/applications/${id}/status`, { status, note });
  }

  // Candidates
  searchCandidates(query: string, page = 0, size = 20): Observable<PageResponse<Candidate>> {
    return this.http.get<PageResponse<Candidate>>(`${this.base}/candidates/search`, { params: { query, page, size } });
  }

  // Analytics
  getDashboard(): Observable<DashboardData> { return this.http.get<DashboardData>(`${this.base}/analytics/dashboard`); }

  // Employer
  getProfile(): Observable<EmployerProfile> { return this.http.get<EmployerProfile>(`${this.base}/employers/profile`); }
  updateProfile(data: Partial<EmployerProfile>): Observable<EmployerProfile> { return this.http.put<EmployerProfile>(`${this.base}/employers/profile`, data); }

  // Billing
  getPlans(): Observable<PricingPlan[]> { return this.http.get<PricingPlan[]>(`${this.base}/subscription/plans`); }
  getPayments(page = 0): Observable<PageResponse<Payment>> { return this.http.get<PageResponse<Payment>>(`${this.base}/payments`, { params: { page } }); }
  initiatePayment(planCode: string, period: string): Observable<{ redirectUrl: string }> {
    return this.http.post<{ redirectUrl: string }>(`${this.base}/payments/initiate`, { planCode, period });
  }
}
