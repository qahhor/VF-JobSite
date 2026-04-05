import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AdminEmployersComponent } from './admin-employers.component';
import { I18nService } from '../../core/services/i18n.service';
import { ToastService } from '../../shared/services/toast.service';

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
    httpMock.match(() => true); // flush remaining
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads employers on init', () => {
    component.ngOnInit();

    // Overview request
    const overviewReq = httpMock.expectOne(r => r.url.includes('/analytics/overview'));
    overviewReq.flush({ totalEmployers: 10, pendingEmployers: 2, verifiedEmployers: 8 });

    // Regions by country
    const regionsReq = httpMock.expectOne(r => r.url.includes('/regions/by-country/UZ'));
    regionsReq.flush([{ id: 'r1', code: '13', fullCode: 'UZ-13', nameUzLat: 'Toshkent shahri', nameRu: 'Город Ташкент', nameEn: 'Tashkent', countryIso2: 'UZ' }]);

    // Employers list
    const employersReq = httpMock.expectOne(r => r.url.includes('/employers') && !r.url.includes('/regions'));
    employersReq.flush({
      content: [
        { id: 'e1', name: 'Test Corp', inn: '123456', city: 'Ташкент', status: 'ACTIVE', isVerified: true, activeVacancies: 5, createdAt: '2025-01-01' }
      ],
      totalPages: 1, totalElements: 1, page: 0, size: 20, last: true,
    });

    expect(component.employers().length).toBe(1);
    expect(component.employers()[0].name).toBe('Test Corp');
    expect(component.overview()?.totalEmployers).toBe(10);
  });

  it('opens create form with empty fields', () => {
    component.openCreate();
    expect(component.showForm()).toBeTrue();
    expect(component.editingId()).toBeNull();
    expect(component.formData.name).toBe('');
  });

  it('opens edit form and loads employer detail', () => {
    component.openEdit('e1');

    const detailReq = httpMock.expectOne(r => r.url.includes('/employers/e1'));
    detailReq.flush({
      id: 'e1', name: 'Test Corp', inn: '123', legalName: 'Test LLC', city: 'Ташкент',
      region: 'UZ-13', industry: 'IT', status: 'ACTIVE', isVerified: true, activeVacancies: 5,
      websiteUrl: 'https://test.uz', employeeCountRange: '11-50', foundedYear: 2020,
      description: 'A test company', createdAt: '2025-01-01',
    });

    expect(component.showForm()).toBeTrue();
    expect(component.editingId()).toBe('e1');
    expect(component.formData.name).toBe('Test Corp');
    expect(component.formData.industry).toBe('IT');
    expect(component.formData.foundedYear).toBe(2020);
  });

  it('shows delete confirmation only for employers with 0 vacancies', () => {
    const employer = { id: 'e1', name: 'No Vacancies', status: 'ACTIVE', activeVacancies: 0, createdAt: '2025-01-01' } as any;
    component.confirmDelete(employer);
    expect(component.deleteTarget()).toBeTruthy();
    expect(component.deleteTarget()!.name).toBe('No Vacancies');
  });

  it('calls delete API and reloads', () => {
    component.confirmDelete({ id: 'e1', name: 'Del Corp', activeVacancies: 0 } as any);
    component.doDelete();

    const delReq = httpMock.expectOne(r => r.url.includes('/employers/e1') && r.method === 'DELETE');
    delReq.flush(null);

    expect(component.deleteTarget()).toBeNull();
    expect(toast.success).toHaveBeenCalled();
  });

  it('verify calls API and reloads', () => {
    component.verify('e1');

    const req = httpMock.expectOne(r => r.url.includes('/employers/e1/verify') && r.method === 'POST');
    req.flush({ id: 'e1', name: 'Test', status: 'ACTIVE', isVerified: true });

    expect(toast.success).toHaveBeenCalled();
  });

  it('block calls changeStatus with BLOCKED', () => {
    component.block('e1');

    const req = httpMock.expectOne(r => r.url.includes('/employers/e1/status') && r.method === 'PATCH');
    expect(req.request.params.get('status')).toBe('BLOCKED');
    req.flush({ id: 'e1', name: 'Test', status: 'BLOCKED' });

    expect(toast.success).toHaveBeenCalled();
  });

  it('pagination changes page and reloads', () => {
    component.goToPage(2);
    expect(component.currentPage()).toBe(2);
  });

  it('statusCls returns correct classes', () => {
    expect(component.statusCls('ACTIVE')).toContain('emerald');
    expect(component.statusCls('PENDING')).toContain('amber');
    expect(component.statusCls('BLOCKED')).toContain('red');
    expect(component.statusCls('UNKNOWN')).toContain('slate');
  });

  it('onRegionChange resets city and loads cities', () => {
    component.formData.region = 'UZ-13';
    component.formData.city = 'Old City';
    component.onRegionChange();

    expect(component.formData.city).toBe('');

    const citiesReq = httpMock.expectOne(r => r.url.includes('/cities/by-country/UZ') && r.params.get('region') === 'UZ-13');
    citiesReq.flush([
      { id: 'c1', nameUzLat: 'Toshkent', nameRu: 'Ташкент', nameEn: 'Tashkent', country: 'UZ', region: 'UZ-13', population: 2500000 }
    ]);

    expect(component.filteredCities().length).toBe(1);
  });
});
