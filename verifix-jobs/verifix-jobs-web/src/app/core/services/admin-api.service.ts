import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PageResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private base = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  // Auth
  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.base}/auth/login`, { email, password });
  }

  // Analytics
  getOverview(): Observable<any> {
    return this.http.get<any>(`${this.base}/analytics/overview`);
  }

  // Employers
  getEmployers(page = 0, size = 20, status?: string): Observable<PageResponse<any>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) params = params.set('status', status);
    return this.http.get<PageResponse<any>>(`${this.base}/employers`, { params });
  }

  changeEmployerStatus(id: string, status: string): Observable<any> {
    return this.http.patch<any>(`${this.base}/employers/${id}/status`, null, { params: { status } });
  }

  verifyEmployer(id: string): Observable<any> {
    return this.http.post<any>(`${this.base}/employers/${id}/verify`, {});
  }

  // Moderation
  getPendingModeration(page = 0, size = 20): Observable<PageResponse<any>> {
    return this.http.get<PageResponse<any>>(`${this.base}/moderation/pending`, {
      params: new HttpParams().set('page', page).set('size', size)
    });
  }

  approveModeration(id: string): Observable<void> {
    return this.http.post<void>(`${this.base}/moderation/${id}/approve`, {});
  }

  rejectModeration(id: string, reason: string): Observable<void> {
    return this.http.post<void>(`${this.base}/moderation/${id}/reject`, { reason });
  }

  // Fraud
  getFraudAlerts(page = 0, size = 20): Observable<any> {
    return this.http.get<any>(`${this.base}/fraud/alerts`, {
      params: new HttpParams().set('page', page).set('size', size)
    });
  }

  reviewFraudAlert(id: string, reviewedBy: string): Observable<any> {
    return this.http.patch<any>(`${this.base}/fraud/alerts/${id}/review`, null, { params: { reviewedBy } });
  }
}
