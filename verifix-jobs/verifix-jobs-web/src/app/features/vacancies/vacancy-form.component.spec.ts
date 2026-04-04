import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { I18nService } from '../../core/services/i18n.service';
import { VacancyFormComponent } from './vacancy-form.component';

describe('VacancyFormComponent', () => {
  it('prefills gps coordinates and expiry date in edit mode', async () => {
    const apiMock = {
      getVacancy: jasmine.createSpy('getVacancy').and.returnValue(of({
        id: 'vac-1',
        title: 'Cashier',
        description: 'Shift cashier role',
        category: 'CASHIER',
        city: 'Tashkent',
        region: null,
        country: 'UZ',
        latitude: 41.311081,
        longitude: 69.240562,
        salaryFrom: 2500000,
        salaryTo: 3500000,
        currency: 'UZS',
        employmentType: 'FULL_TIME',
        shiftSchedule: 'MORNING',
        benefits: ['transport'],
        status: 'PENDING_MODERATION',
        isMassHiring: false,
        positionsCount: 2,
        positionsFilled: 0,
        expiresAt: '2026-07-15T18:59:59Z',
        moderationStatus: 'PENDING',
        source: 'WEB',
        employerId: 'emp-1',
        employerName: 'QA Employer',
        createdAt: '2026-04-04T00:00:00Z',
        updatedAt: '2026-04-04T00:00:00Z',
      })),
      updateVacancy: jasmine.createSpy('updateVacancy'),
      createVacancy: jasmine.createSpy('createVacancy'),
      publishVacancy: jasmine.createSpy('publishVacancy'),
    };

    await TestBed.configureTestingModule({
      imports: [VacancyFormComponent],
      providers: [
        { provide: ApiService, useValue: apiMock },
        { provide: I18nService, useValue: { t: (key: string) => key } },
        { provide: ActivatedRoute, useValue: { snapshot: { params: { id: 'vac-1' } } } },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(VacancyFormComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    expect(component.isEdit).toBeTrue();
    expect(component.form.latitude).toBe(41.311081);
    expect(component.form.longitude).toBe(69.240562);
    expect(component.form.expiresAt).toBe('2026-07-15');
    expect(component.canPublishAction()).toBeFalse();
    expect(component.locationPreview()).toContain('41.311081');
    expect(component.locationPreview()).toContain('69.240562');
  });
});
