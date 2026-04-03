import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private base = environment.apiUrl;
  constructor(private http: HttpClient) {}

  // Auth
  login(email: string, password: string, totpCode: string): Observable<{ accessToken: string }> {
    return this.http.post<{ accessToken: string }>(`${this.base}/admin/auth/login`, { email, password, totpCode });
  }

  // Moderation
  getModerationQueue(status = 'PENDING', page = 0): Observable<any> {
    if (status !== 'PENDING') {
      return of({ content: [], totalElements: 0, totalPages: 0 });
    }
    return this.http.get(`${this.base}/admin/moderation/pending`, { params: { page } });
  }
  approveModeration(id: string): Observable<any> { return this.http.post(`${this.base}/admin/moderation/${id}/approve`, {}); }
  rejectModeration(id: string, reason: string): Observable<any> { return this.http.post(`${this.base}/admin/moderation/${id}/reject`, { reason }); }

  // Users
  getUsers(type: string, page = 0, search = ''): Observable<any> {
    let params = new HttpParams().set('type', type).set('page', page);
    if (search) params = params.set('search', search);
    return this.http.get(`${this.base}/admin/users`, { params });
  }
  suspendUser(id: string): Observable<any> { return this.http.put(`${this.base}/admin/users/${id}/suspend`, {}); }
  activateUser(id: string): Observable<any> { return this.http.put(`${this.base}/admin/users/${id}/activate`, {}); }

  // Audit
  getAuditLogs(page = 0, action?: string): Observable<any> {
    let params = new HttpParams().set('page', page);
    if (action) params = params.set('action', action);
    return this.http.get(`${this.base}/admin/audit`, { params });
  }

  // Analytics
  getAnalytics(): Observable<any> { return this.http.get(`${this.base}/admin/analytics/overview`); }

  // A/B Testing
  getExperiments(page = 0): Observable<any> { return this.http.get(`${this.base}/admin/ab/experiments`, { params: { page } }); }
  createExperiment(name: string, description: string): Observable<any> { return this.http.post(`${this.base}/admin/ab/experiments`, { name, description }); }
  getExperimentStats(name: string): Observable<any> { return this.http.get(`${this.base}/admin/ab/experiments/${name}/stats`); }
  activateExperiment(name: string): Observable<any> { return this.http.post(`${this.base}/admin/ab/experiments/${name}/activate`, {}); }
  deactivateExperiment(name: string): Observable<any> { return this.http.post(`${this.base}/admin/ab/experiments/${name}/deactivate`, {}); }

  // Fraud
  getFraudAlerts(reviewed = false, page = 0): Observable<any> {
    return this.http.get(`${this.base}/admin/fraud`, { params: { reviewed, page } });
  }
  reviewFraud(id: string): Observable<any> { return this.http.put(`${this.base}/admin/fraud/${id}/review`, {}); }
}
