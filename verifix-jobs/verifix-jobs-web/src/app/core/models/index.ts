// Auth
export interface LoginRequest { email: string; password: string; }
export interface AuthResponse { accessToken: string; refreshToken: string; }
export interface AuthUser { userId: string; email: string; role: string; employerId: string; }

// Vacancy
export interface Vacancy {
  id: string; title: string; description: string; category: string; city: string; region: string;
  country?: string; latitude?: number | null; longitude?: number | null;
  salaryFrom: number | null; salaryTo: number | null; currency: string;
  employmentType: string; shiftSchedule: string; benefits: string[];
  status: string; isMassHiring: boolean; positionsCount: number; positionsFilled: number;
  expiresAt: string; moderationStatus: string; source: string;
  employerId: string; employerName: string;
  createdAt: string; updatedAt: string;
}
export interface VacancyCreateRequest {
  title: string; description: string; category: string; city: string; region?: string;
  country?: string; latitude?: number; longitude?: number;
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

// Vacancy extended (public view)
export interface PublicVacancy extends Vacancy {
  slug: string;
  employer?: { id: string; name: string; slug: string; isVerified: boolean; activeVacancies: number; brandingTier: string; };
  isBranded?: boolean;
  promoted?: boolean;
  applicationCount?: number;
  branchName?: string; branchAddress?: string; district?: string;
  latitude?: number; longitude?: number;
}

// Candidate extended
export interface CandidateExtended extends Candidate {
  lastActiveAt?: string;
  referralCode?: string;
  telegramId?: number;
}

// Dashboard overview (actual API response)
export interface DashboardOverview {
  activeVacancies: number; draftVacancies: number; pausedVacancies: number; closedVacancies: number;
  totalApplications: number; newApplications: number; hiredCount: number;
}

// Funnel response
export interface FunnelResponse {
  statusCounts: Record<string, number>;
  total: number;
}

// Vacancy Health
export interface VacancyHealth {
  vacancyId: string; title: string; impressions: number; detailViews: number; applies: number;
  conversionRate: number; avgResponseTimeHours: number | null;
  salaryCompetitiveness: string; geoCompetitiveness: string;
  healthScore: number; healthGrade: string; recommendations: string[];
}

// Value Report
export interface ValueReport {
  totalHires: number; totalApplications: number; activeVacancies: number;
  avgTimeToHireHours: number; estimatedTimeSavedHours: number;
  costPerHire: number; automatedActions: number; maturityLevel: string;
}

// Activity Event
export interface ActivityEvent {
  id: string; eventType: string; title: string; description: string;
  actorType: string; actorName: string; entityType: string; entityId: string;
  createdAt: string;
}

// Integration Hub
export interface IntegrationStatus {
  name: string; category: string; connected: boolean; description: string;
}
export interface HubOverview {
  integrations: IntegrationStatus[]; maturityLevel: number; maturityLabel: string; connectedCount: number;
}

// Company Review
export interface CompanyReview {
  id: string; authorName: string; rating: number; title: string;
  pros: string; cons: string; isAnonymous: boolean; createdAt: string;
}

// Chat
export interface ChatMessage {
  id: string; employerId: string; candidateId: string; vacancyId: string;
  senderType: string; message: string; isRead: boolean; createdAt: string;
}

// Common
export interface PageResponse<T> {
  content: T[]; page: number; size: number;
  totalElements: number; totalPages: number; last: boolean;
}
