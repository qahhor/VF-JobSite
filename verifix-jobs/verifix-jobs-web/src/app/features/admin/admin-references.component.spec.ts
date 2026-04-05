import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AdminReferencesComponent } from './admin-references.component';
import { I18nService } from '../../core/services/i18n.service';
import { ToastService } from '../../shared/services/toast.service';

describe('AdminReferencesComponent', () => {
  let component: AdminReferencesComponent;
  let httpMock: HttpTestingController;
  let toast: jasmine.SpyObj<ToastService>;

  beforeEach(() => {
    toast = jasmine.createSpyObj('ToastService', ['success', 'error']);

    TestBed.configureTestingModule({
      imports: [AdminReferencesComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        I18nService,
        { provide: ToastService, useValue: toast },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(AdminReferencesComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpMock.match(() => true);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads countries on init for reference selects', () => {
    component.ngOnInit();

    // Countries for selects
    const countriesReq = httpMock.expectOne(r => r.url.includes('/references/countries') && r.method === 'GET');
    countriesReq.flush([
      { id: 'co1', iso2: 'UZ', nameUzLat: "O'zbekiston", nameRu: 'Узбекистан', nameEn: 'Uzbekistan', capital: 'Tashkent', phoneCode: '998' }
    ]);

    // Cities list (default tab)
    const citiesReq = httpMock.expectOne(r => r.url.includes('/references/cities') && !r.url.includes('by-country'));
    citiesReq.flush({
      content: [{ id: 'c1', nameUzLat: 'Toshkent', nameRu: 'Ташкент', nameEn: 'Tashkent', country: 'UZ', region: 'UZ-13', population: 2500000 }],
      totalPages: 1, totalElements: 1, page: 0, size: 20, last: true,
    });

    expect(component.refCountries().length).toBe(1);
    expect(component.cities().length).toBe(1);
  });

  it('switches tabs correctly', () => {
    component.ngOnInit();
    httpMock.match(() => true); // flush initial

    component.switchTab('regions');
    expect(component.activeTab()).toBe('regions');

    const regionsReq = httpMock.expectOne(r => r.url.includes('/references/regions') && !r.url.includes('by-country'));
    regionsReq.flush({
      content: [{ id: 'r1', code: '13', fullCode: 'UZ-13', nameUzLat: 'Toshkent shahri', nameRu: 'Город Ташкент', nameEn: 'Tashkent', countryIso2: 'UZ' }],
      totalPages: 1, totalElements: 1, page: 0, size: 20, last: true,
    });

    expect(component.regions().length).toBe(1);
  });

  it('onCityCountryChange loads regions for selected country', () => {
    component.cityForm.country = 'UZ';
    component.onCityCountryChange();

    const req = httpMock.expectOne(r => r.url.includes('/regions/by-country/UZ'));
    req.flush([
      { id: 'r1', code: '13', fullCode: 'UZ-13', nameUzLat: 'Toshkent shahri', nameRu: 'Город Ташкент', nameEn: 'Tashkent', countryIso2: 'UZ' }
    ]);

    expect(component.cityFormRegions().length).toBe(1);
    expect(component.cityForm.region).toBe('');
  });

  it('onCityCountryChange clears regions when no country', () => {
    component.cityForm.country = '';
    component.onCityCountryChange();
    expect(component.cityFormRegions().length).toBe(0);
  });

  it('saves new city', () => {
    component.formType.set('city');
    component.editingId = null;
    component.cityForm = { nameUzLat: 'New City', nameRu: 'Новый', nameEn: 'New', country: 'UZ', region: 'UZ-13', population: 1000 };
    component.saveCity();

    const req = httpMock.expectOne(r => r.url.includes('/references/cities') && r.method === 'POST');
    req.flush({ id: 'c2', nameUzLat: 'New City', nameRu: 'Новый', nameEn: 'New', country: 'UZ', region: 'UZ-13', population: 1000 });

    expect(toast.success).toHaveBeenCalled();
    expect(component.showForm()).toBeFalse();
  });

  it('saves new region with countryIso2', () => {
    component.formType.set('region');
    component.editingId = null;
    component.regionForm = { code: 'XX', fullCode: 'UZ-XX', nameUzLat: 'Test', nameRu: 'Тест', nameEn: 'Test', countryIso2: 'UZ' };
    component.saveRegion();

    const req = httpMock.expectOne(r => r.url.includes('/references/regions') && r.method === 'POST');
    expect(req.request.body.countryIso2).toBe('UZ');
    req.flush({ id: 'r2', code: 'XX', fullCode: 'UZ-XX', nameUzLat: 'Test', nameRu: 'Тест', nameEn: 'Test', countryIso2: 'UZ' });

    expect(toast.success).toHaveBeenCalled();
  });

  it('editRegion populates form with countryIso2', () => {
    const region = { id: 'r1', code: '13', fullCode: 'UZ-13', nameUzLat: 'Toshkent', nameRu: 'Ташкент', nameEn: 'Tashkent', countryIso2: 'UZ' } as any;
    component.editRegion(region);

    expect(component.editingId).toBe('r1');
    expect(component.regionForm.countryIso2).toBe('UZ');
    expect(component.showForm()).toBeTrue();
  });

  it('delete confirmation and execution', () => {
    component.confirmDeleteCity({ id: 'c1', nameUzLat: 'Toshkent' } as any);
    expect(component.deleteTarget()).toBeTruthy();
    expect(component.deleteTarget()!.name).toBe('Toshkent');

    component.confirmDelete();

    const req = httpMock.expectOne(r => r.url.includes('/references/cities/c1') && r.method === 'DELETE');
    req.flush(null);

    expect(component.deleteTarget()).toBeNull();
    expect(toast.success).toHaveBeenCalled();
  });
});
