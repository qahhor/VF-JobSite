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

  // Vacancies — employer's own vacancies
  getVacancies(page = 0, size = 20, status?: string): Observable<PageResponse<Vacancy>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) params = params.set('status', status);
    return this.http.get<PageResponse<Vacancy>>(`${this.base}/vacancies/employer`, { params });
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

  // Candidates (POST with search body)
  searchCandidates(query: string, page = 0, size = 20): Observable<PageResponse<Candidate>> {
    return this.http.post<PageResponse<Candidate>>(`${this.base}/candidates/search`, {
      city: null, skills: null, category: query || null, page, size,
      minSalary: null, maxSalary: null, educationLevel: null, gender: null, myidVerified: null
    });
  }

  // Analytics
  getDashboard(): Observable<any> { return this.http.get<any>(`${this.base}/analytics/overview`); }
  getFunnel(): Observable<any> { return this.http.get<any>(`${this.base}/analytics/funnel`); }

  // Employer
  getProfile(): Observable<EmployerProfile> { return this.http.get<EmployerProfile>(`${this.base}/employer/profile`); }
  updateProfile(data: Partial<EmployerProfile>): Observable<EmployerProfile> { return this.http.put<EmployerProfile>(`${this.base}/employer/profile`, data); }

  // Billing
  getPlans(): Observable<PricingPlan[]> { return this.http.get<PricingPlan[]>(`${this.base}/subscription/plans`); }
  getPayments(page = 0): Observable<PageResponse<Payment>> { return this.http.get<PageResponse<Payment>>(`${this.base}/payments`, { params: { page } }); }
  initiatePayment(planCode: string, period: string): Observable<{ redirectUrl: string }> {
    return this.http.post<{ redirectUrl: string }>(`${this.base}/payments/initiate`, { planCode, period });
  }
}
