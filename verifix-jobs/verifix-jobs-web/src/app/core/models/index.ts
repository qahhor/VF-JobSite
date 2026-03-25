// Auth
export interface LoginRequest { email: string; password: string; }
export interface AuthResponse { accessToken: string; refreshToken: string; }
export interface AuthUser { userId: string; email: string; role: string; employerId: string; }

// Vacancy
export interface Vacancy {
  id: string; title: string; description: string; category: string; city: string; region: string;
  salaryFrom: number | null; salaryTo: number | null; currency: string;
  employmentType: string; shiftSchedule: string; benefits: string[];
  status: string; isMassHiring: boolean; positionsCount: number; positionsFilled: number;
  expiresAt: string; moderationStatus: string; source: string;
  employerId: string; employerName: string;
  createdAt: string; updatedAt: string;
}
export interface VacancyCreateRequest {
  title: string; description: string; category: string; city: string; region?: string;
  salaryFrom?: number; salaryTo?: number; currency?: string;
  employmentType: string; shiftSchedule?: string; benefits?: string[];
  isMassHiring?: boolean; positionsCount?: number; expiresAt?: string;
}

// Application
export interface Application {
  id: string; vacancyId: string; vacancyTitle: string;
  candidateId: string; candidateName: string; candidatePhone: string;
  status: string; source: string; recruiterNotes: string;
  appliedAt: string; viewedAt: string | null; invitedAt: string | null;
  rejectedAt: string | null; hiredAt: string | null;
}
export type ApplicationStatus = 'NEW' | 'VIEWED' | 'SHORTLIST' | 'INVITED' | 'INTERVIEW' | 'OFFER' | 'HIRED' | 'REJECTED' | 'WITHDRAWN';

// Candidate
export interface Candidate {
  id: string; firstName: string; lastName: string; phone: string;
  city: string; skills: string[]; preferredCategories: string[];
  educationLevel: string; myidStatus: string; matchScore?: number;
}

// Employer
export interface EmployerProfile {
  id: string; name: string; legalName: string; inn: string;
  city: string; status: string; isVerified: boolean;
  subscriptionPlan: string; brandingTier: string;
}

// Billing
export interface PricingPlan {
  code: string; name: string; maxVacancies: number; maxResumeViews: number;
  hasAts: boolean; hasAnalytics: boolean; hasApi: boolean; hasBranding: boolean;
  priceMonthlyUzs: number; priceAnnualUzs: number;
}
export interface Payment {
  id: string; amount: number; currency: string; gateway: string;
  status: string; paidAt: string | null; createdAt: string;
}

// Analytics
export interface DashboardData {
  activeVacancies: number; totalApplications: number;
  hiredThisMonth: number; avgTimeToHire: number;
  applicationsByDay: { date: string; count: number }[];
  applicationsBySource: { source: string; count: number }[];
  recentApplications: Application[];
}

// Common
export interface PageResponse<T> {
  content: T[]; page: number; size: number;
  totalElements: number; totalPages: number; last: boolean;
}
