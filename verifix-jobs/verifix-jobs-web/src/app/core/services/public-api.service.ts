import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PageResponse, Vacancy } from '../models';

export interface PublicVacancy extends Vacancy {
  slug: string;
  employerLogo?: string;
  employerIndustry?: string;
  employerSize?: string;
  employerVerified?: boolean;
  viewCount?: number;
  applicationCount?: number;
}

export interface PublicCompany {
  id: string;
  slug: string;
  name: string;
  legalName: string;
  logo?: string;
  industry: string;
  city: string;
  size: string;
  isVerified: boolean;
  about?: string;
  website?: string;
  vacancyCount: number;
  foundedYear?: number;
}

export interface PublicStats {
  totalVacancies: number;
  totalEmployers: number;
  totalHired: number;
}

export interface OtpSendRequest {
  phone: string;
}

export interface OtpVerifyRequest {
  phone: string;
  code: string;
}

export interface QuickApplyRequest {
  vacancyId: string;
  phone: string;
  otpCode: string;
  firstName: string;
  city: string;
}

export interface VacancySearchParams {
  q?: string;
  city?: string;
  category?: string;
  salaryMin?: number;
  salaryMax?: number;
  employmentType?: string;
  sort?: string;
  page?: number;
  size?: number;
}

@Injectable({ providedIn: 'root' })
export class PublicApiService {
  private base = `${environment.apiUrl}/public`;

  constructor(private http: HttpClient) {}

  getVacancies(params: VacancySearchParams = {}): Observable<PageResponse<PublicVacancy>> {
    let httpParams = new HttpParams();
    if (params.q) httpParams = httpParams.set('q', params.q);
    if (params.city) httpParams = httpParams.set('city', params.city);
    if (params.category) httpParams = httpParams.set('category', params.category);
    if (params.salaryMin) httpParams = httpParams.set('salaryMin', params.salaryMin);
    if (params.salaryMax) httpParams = httpParams.set('salaryMax', params.salaryMax);
    if (params.employmentType) httpParams = httpParams.set('employmentType', params.employmentType);
    if (params.sort) httpParams = httpParams.set('sort', params.sort);
    httpParams = httpParams.set('page', params.page ?? 0).set('size', params.size ?? 12);
    return this.http.get<PageResponse<PublicVacancy>>(`${this.base}/vacancies`, { params: httpParams });
  }

  getVacancy(slug: string): Observable<PublicVacancy> {
    return this.http.get<PublicVacancy>(`${this.base}/vacancies/${slug}`);
  }

  getVacanciesByCategory(category: string, page = 0, size = 12): Observable<PageResponse<PublicVacancy>> {
    return this.http.get<PageResponse<PublicVacancy>>(`${this.base}/vacancies/category/${category}`, {
      params: new HttpParams().set('page', page).set('size', size)
    });
  }

  getVacanciesByCity(city: string, page = 0, size = 12): Observable<PageResponse<PublicVacancy>> {
    return this.http.get<PageResponse<PublicVacancy>>(`${this.base}/vacancies/city/${city}`, {
      params: new HttpParams().set('page', page).set('size', size)
    });
  }

  getLatestVacancies(size = 6): Observable<PageResponse<PublicVacancy>> {
    return this.http.get<PageResponse<PublicVacancy>>(`${this.base}/vacancies`, {
      params: new HttpParams().set('page', 0).set('size', size).set('sort', 'newest')
    });
  }

  getStats(): Observable<PublicStats> {
    return this.http.get<PublicStats>(`${this.base}/stats`);
  }

  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/categories`);
  }

  getCities(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/cities`);
  }

  getCompanies(params: { q?: string; industry?: string; page?: number; size?: number } = {}): Observable<PageResponse<PublicCompany>> {
    let httpParams = new HttpParams();
    if (params.q) httpParams = httpParams.set('q', params.q);
    if (params.industry) httpParams = httpParams.set('industry', params.industry);
    httpParams = httpParams.set('page', params.page ?? 0).set('size', params.size ?? 12);
    return this.http.get<PageResponse<PublicCompany>>(`${this.base}/companies`, { params: httpParams });
  }

  getCompany(slug: string): Observable<PublicCompany> {
    return this.http.get<PublicCompany>(`${this.base}/companies/${slug}`);
  }

  getCompanyVacancies(slug: string, page = 0, size = 10): Observable<PageResponse<PublicVacancy>> {
    return this.http.get<PageResponse<PublicVacancy>>(`${this.base}/companies/${slug}/vacancies`, {
      params: new HttpParams().set('page', page).set('size', size)
    });
  }

  getSimilarVacancies(slug: string, size = 4): Observable<PublicVacancy[]> {
    return this.http.get<PublicVacancy[]>(`${this.base}/vacancies/${slug}/similar`, {
      params: new HttpParams().set('size', size)
    });
  }

  sendOtp(phone: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${environment.apiUrl}/auth/candidate/otp/send`, { phone });
  }

  quickApply(data: QuickApplyRequest): Observable<{ success: boolean; applicationId: string }> {
    return this.http.post<{ success: boolean; applicationId: string }>(`${this.base}/apply`, data);
  }
}
