import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Vacancy, VacancyCreateRequest, Application, Candidate,
  EmployerProfile, PricingPlan, Payment, PageResponse
} from '../models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // === Vacancies ===
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

  // === Applications ===
  getApplications(vacancyId?: string, status?: string, page = 0, size = 20): Observable<PageResponse<Application>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) params = params.set('status', status);
    if (vacancyId) return this.http.get<PageResponse<Application>>(`${this.base}/applications/vacancy/${vacancyId}`, { params });
    return this.http.get<PageResponse<Application>>(`${this.base}/applications/vacancy/all`, { params });
  }
  changeApplicationStatus(id: string, status: string, note?: string): Observable<Application> {
    return this.http.patch<Application>(`${this.base}/applications/${id}/status`, null, { params: { status } });
  }

  // === Candidates ===
  searchCandidates(query: string, page = 0, size = 20): Observable<PageResponse<Candidate>> {
    return this.http.post<PageResponse<Candidate>>(`${this.base}/candidates/search`, {
      city: null, skills: null, category: query || null, page, size,
      minSalary: null, maxSalary: null, educationLevel: null, gender: null, myidVerified: null
    });
  }
  inviteCandidate(vacancyId: string, candidateId: string, note?: string): Observable<Application> {
    return this.http.post<Application>(`${this.base}/applications/invite`, { vacancyId, candidateId, note });
  }

  // === Talent Hub ===
  getTalentLists(): Observable<Array<{ id: string; name: string; description: string; candidateCount: number; createdAt: string }>> {
    return this.http.get<Array<{ id: string; name: string; description: string; candidateCount: number; createdAt: string }>>(
      `${this.base}/talent-hub/lists`
    );
  }
  createTalentList(name: string, description = ''): Observable<{ id: string; name: string; description: string }> {
    return this.http.post<{ id: string; name: string; description: string }>(`${this.base}/talent-hub/lists`, { name, description });
  }
  getTalentListCandidates(listId: string): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(`${this.base}/talent-hub/lists/${listId}/candidates`);
  }
  addTalentListCandidate(listId: string, candidateId: string, notes?: string, tags?: string[]): Observable<void> {
    return this.http.post<void>(`${this.base}/talent-hub/lists/${listId}/candidates`, { candidateId, notes, tags });
  }
  removeTalentListCandidate(listId: string, candidateId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/talent-hub/lists/${listId}/candidates/${candidateId}`);
  }
  getTalentHubHired(): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(`${this.base}/talent-hub/hired`);
  }

  // === Analytics & Dashboard ===
  getDashboard(): Observable<any> { return this.http.get<any>(`${this.base}/analytics/overview`); }
  getFunnel(): Observable<any> { return this.http.get<any>(`${this.base}/analytics/funnel`); }
  getHiringFunnels(): Observable<any[]> { return this.http.get<any[]>(`${this.base}/intelligence/hiring/funnel`); }

  // === Salary Intelligence ===
  getSalaryPredict(category: string, city?: string): Observable<any> {
    let params = new HttpParams().set('category', category);
    if (city) params = params.set('city', city);
    return this.http.get<any>(`${this.base}/salary/predict`, { params });
  }
  getSalaryTrends(category: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/intelligence/salary/trends`, { params: { category } });
  }
  getSalaryCities(category: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/intelligence/salary/cities`, { params: { category } });
  }

  // === Vacancy Health ===
  getVacancyHealth(vacancyId: string): Observable<any> {
    return this.http.get<any>(`${this.base}/vacancy-health/${vacancyId}`);
  }
  getAllVacancyHealth(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/vacancy-health/all`);
  }
  getCivilityScore(): Observable<any> {
    return this.http.get<any>(`${this.base}/vacancy-health/civility`);
  }

  // === Vacancy Board & Response Inbox ===
  getVacancyBoard(status?: string): Observable<any[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<any[]>(`${this.base}/employer/vacancy-board`, { params });
  }
  getResponseInbox(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/employer/response-inbox`);
  }
  bulkAction(applicationIds: string[], status: string, note?: string): Observable<any> {
    return this.http.post<any>(`${this.base}/employer/response-inbox/bulk`, { applicationIds, status, note });
  }

  // === Activity Feed ===
  getActivityFeed(page = 0, size = 20): Observable<PageResponse<any>> {
    return this.http.get<PageResponse<any>>(`${this.base}/employer/dashboard/feed`, {
      params: { page: page.toString(), size: size.toString() }
    });
  }
  getTaskCounts(): Observable<{ open: number; urgent: number }> {
    return this.http.get<{ open: number; urgent: number }>(`${this.base}/employer/dashboard/tasks/count`);
  }
  getTasks(status = 'OPEN', page = 0, size = 20): Observable<PageResponse<any>> {
    return this.http.get<PageResponse<any>>(`${this.base}/employer/dashboard/tasks`, {
      params: { status, page: page.toString(), size: size.toString() }
    });
  }
  updateTask(taskId: string, status: string): Observable<any> {
    return this.http.patch<any>(`${this.base}/employer/dashboard/tasks/${taskId}`, { status });
  }

  // === Value Report (ROI) ===
  getValueReport(): Observable<any> {
    return this.http.get<any>(`${this.base}/employer/value-report`);
  }

  // === Employer Profile ===
  getProfile(): Observable<EmployerProfile> { return this.http.get<EmployerProfile>(`${this.base}/employer/profile`); }
  updateProfile(data: Partial<EmployerProfile>): Observable<EmployerProfile> { return this.http.put<EmployerProfile>(`${this.base}/employer/profile`, data); }

  // === Billing ===
  getPlans(): Observable<PricingPlan[]> { return this.http.get<PricingPlan[]>(`${this.base}/subscription/plans`); }
  getCurrentSubscription(): Observable<any> { return this.http.get<any>(`${this.base}/subscription/current`); }
  getPayments(page = 0): Observable<PageResponse<Payment>> {
    return this.http.get<PageResponse<Payment>>(`${this.base}/subscription/history`, { params: new HttpParams().set('page', page) });
  }
  purchaseSubscription(planCode: string, billingPeriod: string, gateway = 'CLICK'): Observable<any> {
    return this.http.post<any>(`${this.base}/subscription/purchase`, {
      planCode, gateway, billingPeriod, returnUrl: window.location.origin + '/employer/billing'
    });
  }
}
