import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AdminEmployersComponent } from './admin-employers.component';
import { I18nService } from '../../core/services/i18n.service';
import { ToastService } from '../../shared/services/toast.service';

const MOCK_EMPLOYER_DETAIL = {
  id: 'e1', name: 'Test Corp', inn: '123', legalName: 'Test LLC', city: 'Ташкент',
  region: 'UZ-13', industry: 'IT', status: 'ACTIVE', isVerified: true, activeVacancies: 5,
  websiteUrl: 'https://test.uz', employeeCountRange: '11-50', foundedYear: 2020,
  description: 'A test company', createdAt: '2025-01-01',
};

const MOCK_CITIES = [
  { id: 'c1', nameUzLat: 'Toshkent', nameRu: 'Ташкент', nameEn: 'Tashkent', country: 'UZ', region: 'UZ-13', population: 2500000 }
];

const MOCK_REGIONS = [
  { id: 'r1', code: '13', fullCode: 'UZ-13', nameUzLat: 'Toshkent shahri', nameRu: 'Город Ташкент', nameEn: 'Tashkent', countryIso2: 'UZ' }
];

describe('AdminEmployersComponent', () => {
  let component: AdminEmployersComponent;
  let httpMock: HttpTestingController;
  let toast: jasmine.SpyObj<ToastService>;

  beforeEach(() => {
    toast = jasmine.createSpyObj('ToastService', ['success', 'error']);

    TestBed.configureTestingModule({
      imports: [AdminEmployersComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        I18nService,
        { provide: ToastService, useValue: toast },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(AdminEmployersComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpMock.match(() => true); // flush any remaining requests
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── Init ─────────────────────────────────────────────────────────────────

  it('loads overview, regions and employers on init', () => {
    component.ngOnInit();

    const overviewReq = httpMock.expectOne(r => r.url.includes('/analytics/overview'));
    overviewReq.flush({ totalEmployers: 10, pendingEmployers: 2, verifiedEmployers: 8 });

    const regionsReq = httpMock.expectOne(r => r.url.includes('/regions/by-country/UZ'));
    regionsReq.flush(MOCK_REGIONS);

    const employersReq = httpMock.expectOne(r => r.url.includes('/employers') && !r.url.includes('/regions'));
    employersReq.flush({
      content: [{ id: 'e1', name: 'Test Corp', inn: '123456', city: 'Ташкент', status: 'ACTIVE', isVerified: true, activeVacancies: 5, createdAt: '2025-01-01' }],
      totalPages: 1, totalElements: 1, page: 0, size: 20, last: true,
    });

    expect(component.employers().length).toBe(1);
    expect(component.employers()[0].name).toBe('Test Corp');
    expect(component.overview()?.totalEmployers).toBe(10);
    expect(component.regions().length).toBe(1);
  });

  // ── Create form ───────────────────────────────────────────────────────────

  it('opens create form with empty fields and null editingId', () => {
    component.openCreate();
    expect(component.showForm()).toBeTrue();
    expect(component.editingId()).toBeNull();
    expect(component.formData.name).toBe('');
    expect(component.formData.region).toBe('');
    expect(component.formData.city).toBe('');
    expect(component.formData.industry).toBe('');
  });

  // ── Edit form ─────────────────────────────────────────────────────────────

  it('openEdit loads employer detail and shows form', () => {
    component.openEdit('e1');

    const detailReq = httpMock.expectOne(r => r.url.includes('/employers/e1') && r.method === 'GET');
    detailReq.flush(MOCK_EMPLOYER_DETAIL);

    // Bug fix: openEdit must also load cities for pre-selected region
    const citiesReq = httpMock.expectOne(r => r.url.includes('/cities/by-country/UZ'));
    citiesReq.flush(MOCK_CITIES);

    expect(component.showForm()).toBeTrue();
    expect(component.editingId()).toBe('e1');
    expect(component.formData.name).toBe('Test Corp');
    expect(component.formData.region).toBe('UZ-13');
    expect(component.formData.city).toBe('Ташкент');
    expect(component.formData.industry).toBe('IT');
    expect(component.formData.foundedYear).toBe(2020);
  });

  it('openEdit populates filteredCities so city dropdown is not empty', () => {
    component.openEdit('e1');

    const detailReq = httpMock.expectOne(r => r.url.includes('/employers/e1') && r.method === 'GET');
    detailReq.flush(MOCK_EMPLOYER_DETAIL);

    const citiesReq = httpMock.expectOne(r => r.url.includes('/cities/by-country/UZ'));
    citiesReq.flush(MOCK_CITIES);

    // filteredCities must be populated — previously was empty (the bug)
    expect(component.filteredCities().length).toBe(1);
    expect(component.filteredCities()[0].nameRu).toBe('Ташкент');
  });

  it('openEdit with no region sets filteredCities to empty', () => {
    component.openEdit('e2');

    const detailReq = httpMock.expectOne(r => r.url.includes('/employers/e2') && r.method === 'GET');
    detailReq.flush({ ...MOCK_EMPLOYER_DETAIL, id: 'e2', region: '', city: '' });

    // No cities request should be made for employer with no region
    httpMock.expectNone(r => r.url.includes('/cities/by-country/UZ'));
    expect(component.filteredCities().length).toBe(0);
  });

  it('openEdit shows toast on API error', () => {
    component.openEdit('e1');

    const detailReq = httpMock.expectOne(r => r.url.includes('/employers/e1') && r.method === 'GET');
    detailReq.flush('Not found', { status: 404, statusText: 'Not Found' });

    expect(toast.error).toHaveBeenCalled();
    expect(component.showForm()).toBeFalse();
  });

  // ── Save form ─────────────────────────────────────────────────────────────

  it('saveForm creates new employer and clears state', () => {
    component.openCreate();
    component.formData.name = 'New Corp';
    component.formData.industry = 'IT';
    component.saveForm();

    const createReq = httpMock.expectOne(r => r.url.includes('/employers') && r.method === 'POST');
    createReq.flush({ id: 'new1', name: 'New Corp' });

    // After create: flush the reload request
    const reloadReq = httpMock.expectOne(r => r.url.includes('/employers') && r.method === 'GET');
    reloadReq.flush({ content: [], totalPages: 0, totalElements: 0, page: 0, size: 20, last: true });

    expect(component.showForm()).toBeFalse();
    expect(component.editingId()).toBeNull();
    expect(toast.success).toHaveBeenCalled();
  });

  it('saveForm updates employer, clears editingId and filteredCities', () => {
    component.editingId.set('e1');
    component.formData = {
      name: 'Updated Corp', inn: '999', legalName: 'Updated LLC',
      city: 'Ташкент', region: 'UZ-13', industry: 'RETAIL',
      websiteUrl: '', employeeCountRange: '51-200', foundedYear: 2021, description: ''
    };
    component.filteredCities.set(MOCK_CITIES as any);
    component.saveForm();

    const updateReq = httpMock.expectOne(r => r.url.includes('/employers/e1') && r.method === 'PUT');
    updateReq.flush({ id: 'e1', name: 'Updated Corp' });

    const reloadReq = httpMock.expectOne(r => r.url.includes('/employers') && r.method === 'GET');
    reloadReq.flush({ content: [], totalPages: 0, totalElements: 0, page: 0, size: 20, last: true });

    expect(component.showForm()).toBeFalse();
    expect(component.editingId()).toBeNull();           // Bug fix: editingId cleared after save
    expect(component.filteredCities().length).toBe(0); // Bug fix: cities cleared after save
    expect(toast.success).toHaveBeenCalled();
  });

  it('saveForm does nothing when name is empty', () => {
    component.formData.name = '';
    component.saveForm();
    httpMock.expectNone(r => r.url.includes('/employers'));
  });

  it('saveForm shows error toast on API failure', () => {
    component.editingId.set(null);
    component.formData.name = 'Corp';
    component.saveForm();

    const req = httpMock.expectOne(r => r.url.includes('/employers') && r.method === 'POST');
    req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

    expect(toast.error).toHaveBeenCalled();
  });

  // ── Delete ─────────────────────────────────────────────────────────────────

  it('shows delete confirmation target', () => {
    const employer = { id: 'e1', name: 'No Vacancies', status: 'ACTIVE', activeVacancies: 0, createdAt: '2025-01-01' } as any;
    component.confirmDelete(employer);
    expect(component.deleteTarget()).toBeTruthy();
    expect(component.deleteTarget()!.name).toBe('No Vacancies');
  });

  it('doDelete calls API, clears target and reloads', () => {
    component.confirmDelete({ id: 'e1', name: 'Del Corp', activeVacancies: 0 } as any);
    component.doDelete();

    const delReq = httpMock.expectOne(r => r.url.includes('/employers/e1') && r.method === 'DELETE');
    delReq.flush(null);

    const reloadReq = httpMock.expectOne(r => r.url.includes('/employers') && r.method === 'GET');
    reloadReq.flush({ content: [], totalPages: 0, totalElements: 0, page: 0, size: 20, last: true });

    expect(component.deleteTarget()).toBeNull();
    expect(toast.success).toHaveBeenCalled();
  });

  it('doDelete does nothing when deleteTarget is null', () => {
    component.deleteTarget.set(null);
    component.doDelete();
    httpMock.expectNone(r => r.url.includes('/employers') && r.method === 'DELETE');
  });

  it('doDelete shows error toast on failure', () => {
    component.confirmDelete({ id: 'e1', name: 'Corp', activeVacancies: 0 } as any);
    component.doDelete();

    const delReq = httpMock.expectOne(r => r.url.includes('/employers/e1') && r.method === 'DELETE');
    delReq.flush('Error', { status: 500, statusText: 'Server Error' });

    expect(toast.error).toHaveBeenCalled();
  });

  // ── Status actions ─────────────────────────────────────────────────────────

  it('verify calls POST and shows success toast', () => {
    component.verify('e1');

    const req = httpMock.expectOne(r => r.url.includes('/employers/e1/verify') && r.method === 'POST');
    req.flush({ id: 'e1', name: 'Test', status: 'ACTIVE', isVerified: true });

    const reloadReq = httpMock.expectOne(r => r.url.includes('/employers') && r.method === 'GET');
    reloadReq.flush({ content: [], totalPages: 0, totalElements: 0, page: 0, size: 20, last: true });

    expect(toast.success).toHaveBeenCalled();
  });

  it('activate calls PATCH with status=ACTIVE and shows success toast', () => {
    component.activate('e1');

    const req = httpMock.expectOne(r => r.url.includes('/employers/e1/status') && r.method === 'PATCH');
    expect(req.request.params.get('status')).toBe('ACTIVE');
    req.flush({ id: 'e1', name: 'Test', status: 'ACTIVE' });

    const reloadReq = httpMock.expectOne(r => r.url.includes('/employers') && r.method === 'GET');
    reloadReq.flush({ content: [], totalPages: 0, totalElements: 0, page: 0, size: 20, last: true });

    expect(toast.success).toHaveBeenCalled();
  });

  it('block calls PATCH with status=BLOCKED and shows success toast', () => {
    component.block('e1');

    const req = httpMock.expectOne(r => r.url.includes('/employers/e1/status') && r.method === 'PATCH');
    expect(req.request.params.get('status')).toBe('BLOCKED');
    req.flush({ id: 'e1', name: 'Test', status: 'BLOCKED' });

    const reloadReq = httpMock.expectOne(r => r.url.includes('/employers') && r.method === 'GET');
    reloadReq.flush({ content: [], totalPages: 0, totalElements: 0, page: 0, size: 20, last: true });

    expect(toast.success).toHaveBeenCalled();
  });

  it('verify shows error toast on failure', () => {
    component.verify('e1');
    const req = httpMock.expectOne(r => r.url.includes('/employers/e1/verify'));
    req.flush('Error', { status: 500, statusText: 'Server Error' });
    expect(toast.error).toHaveBeenCalled();
  });

  // ── Pagination ─────────────────────────────────────────────────────────────

  it('goToPage sets currentPage and reloads', () => {
    component.goToPage(2);
    expect(component.currentPage()).toBe(2);

    const req = httpMock.expectOne(r => r.url.includes('/employers') && r.method === 'GET');
    req.flush({ content: [], totalPages: 3, totalElements: 50, page: 2, size: 20, last: false });

    expect(component.totalPages()).toBe(3);
  });

  // ── Region / City cascade ──────────────────────────────────────────────────

  it('onRegionChange resets city and loads cities for selected region', () => {
    component.formData.region = 'UZ-13';
    component.formData.city = 'Old City';
    component.onRegionChange();

    expect(component.formData.city).toBe('');

    const citiesReq = httpMock.expectOne(r => r.url.includes('/cities/by-country/UZ') && r.params.get('region') === 'UZ-13');
    citiesReq.flush(MOCK_CITIES);

    expect(component.filteredCities().length).toBe(1);
    expect(component.filteredCities()[0].nameUzLat).toBe('Toshkent');
  });

  it('onRegionChange with empty region clears filteredCities', () => {
    component.filteredCities.set(MOCK_CITIES as any);
    component.formData.region = '';
    component.onRegionChange();

    httpMock.expectNone(r => r.url.includes('/cities/by-country'));
    expect(component.filteredCities().length).toBe(0);
  });

  // ── Helpers ────────────────────────────────────────────────────────────────

  it('statusCls returns correct CSS classes for each status', () => {
    expect(component.statusCls('ACTIVE')).toContain('emerald');
    expect(component.statusCls('PENDING')).toContain('amber');
    expect(component.statusCls('BLOCKED')).toContain('red');
    expect(component.statusCls('UNKNOWN')).toContain('slate');
  });

  it('statusLabel returns translated label for known statuses', () => {
    expect(component.statusLabel('ACTIVE')).toBeTruthy();
    expect(component.statusLabel('PENDING')).toBeTruthy();
    expect(component.statusLabel('BLOCKED')).toBeTruthy();
    expect(component.statusLabel('UNKNOWN')).toBe('UNKNOWN');
  });

  it('industries list contains expected values', () => {
    expect(component.industries).toContain('IT');
    expect(component.industries).toContain('FOOD');
    expect(component.industries).toContain('HEALTHCARE');
    expect(component.industries.length).toBeGreaterThan(5);
  });
});
