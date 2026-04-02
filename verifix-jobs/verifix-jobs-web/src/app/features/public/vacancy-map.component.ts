import { Component, OnInit, OnDestroy, signal, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PublicHeaderComponent } from '../../shared/components/public-header.component';
import { PublicFooterComponent } from '../../shared/components/public-footer.component';
import { SeoService } from '../../core/services/seo.service';
import * as L from 'leaflet';

@Component({
  selector: 'vjw-vacancy-map',
  standalone: true,
  imports: [CommonModule, RouterLink, PublicHeaderComponent, PublicFooterComponent],
  template: `
    <vjw-public-header />

    <div class="max-w-7xl mx-auto px-4 pt-4 pb-20 md:pb-8">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h1 class="text-xl font-bold text-gray-900">&#128205; Yaqindagi ishlar</h1>
        <div class="flex flex-wrap items-center gap-2">
          <a routerLink="/jobs" class="h-9 px-4 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition flex items-center">
            &#128203; Ro'yxat
          </a>
          <button (click)="locateMe()" class="h-9 px-4 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition flex items-center gap-1">
            &#128205; Meni top
          </button>
        </div>
      </div>

      @if (error()) {
        <div class="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl p-4 mb-4">{{ error() }}</div>
      }

      <div id="vacancy-map" class="w-full h-[420px] sm:h-[500px] md:h-[600px] rounded-xl border border-gray-200 overflow-hidden"></div>

      @if (nearbyVacancies().length) {
        <div class="mt-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-3">{{ nearbyVacancies().length }} ta vakansiya yaqinda</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            @for (v of nearbyVacancies(); track v.id) {
              <a [routerLink]="['/jobs', v.slug || v.id]" class="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition">
                @if (v.salaryFrom) {
                  <div class="text-lg font-bold text-gray-900">{{ fmt(v.salaryFrom) }}{{ v.salaryTo ? ' - ' + fmt(v.salaryTo) : '+' }} <span class="text-xs font-normal text-gray-400">UZS</span></div>
                }
                <div class="text-sm font-semibold text-gray-800 truncate">{{ v.title }}</div>
                <div class="text-xs text-gray-400 mt-0.5">{{ v.employerName || v.employer?.name }}</div>
                <div class="text-xs text-gray-400 mt-2">&#128205; {{ v.city }} @if (v.distance) { · {{ v.distance.toFixed(1) }} km }</div>
              </a>
            }
          </div>
        </div>
      }
    </div>

    <vjw-public-footer />
  `,
  styles: [`
    :host ::ng-deep .leaflet-popup-content-wrapper { border-radius: 12px; }
    :host ::ng-deep .leaflet-popup-content { margin: 10px 14px; }
  `]
})
export class VacancyMapComponent implements OnInit, AfterViewInit, OnDestroy {
  nearbyVacancies = signal<any[]>([]);
  error = signal('');
  private map!: L.Map;
  private markers: L.Marker[] = [];
  private userLat = 41.311;
  private userLon = 69.279;

  constructor(private http: HttpClient, private seo: SeoService) {}

  ngOnInit() {
    this.updateSeo();
  }

  ngAfterViewInit() {
    this.initMap();
    this.loadVacancies();
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap() {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });

    this.map = L.map('vacancy-map').setView([this.userLat, this.userLon], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 18,
    }).addTo(this.map);
  }

  locateMe() {
    if (!navigator.geolocation) {
      this.error.set('Geolokatsiya qo\'llab-quvvatlanmaydi');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.userLat = position.coords.latitude;
        this.userLon = position.coords.longitude;
        this.map.setView([this.userLat, this.userLon], 13);

        L.circleMarker([this.userLat, this.userLon], {
          radius: 10,
          fillColor: '#3b82f6',
          fillOpacity: 0.8,
          color: '#fff',
          weight: 2
        }).addTo(this.map).bindPopup('You are here');

        this.loadNearby();
      },
      () => this.error.set('Joylashuvni aniqlab bo\'lmadi. Ruxsat bering.')
    );
  }

  private loadVacancies() {
    this.http.get<any>(`${environment.apiUrl}/public/vacancies?size=50`).subscribe({
      next: (response: any) => {
        const vacancies = response.content || [];
        this.addMarkers(vacancies);
        this.updateSeo(vacancies);
      },
      error: () => {}
    });
  }

  private loadNearby() {
    this.http.get<any[]>(`${environment.apiUrl}/vacancies/nearby?lat=${this.userLat}&lon=${this.userLon}&radiusKm=10`).subscribe({
      next: (vacancies: any[]) => {
        this.nearbyVacancies.set(vacancies || []);
        this.clearMarkers();
        this.addMarkers(vacancies || []);
        this.updateSeo(vacancies || []);
      },
      error: () => {}
    });
  }

  private addMarkers(vacancies: any[]) {
    for (const vacancy of vacancies) {
      const lat = vacancy.latitude || vacancy.location?.lat;
      const lon = vacancy.longitude || vacancy.location?.lon;
      if (!lat || !lon) {
        continue;
      }

      const salary = vacancy.salaryFrom
        ? `${this.fmt(vacancy.salaryFrom)}${vacancy.salaryTo ? ` - ${this.fmt(vacancy.salaryTo)}` : '+'} UZS`
        : 'Kelishiladi';
      const popup = `
        <div style="min-width:180px">
          <div style="font-weight:700;font-size:14px">${vacancy.title}</div>
          <div style="color:#666;font-size:12px;margin-top:2px">${vacancy.employerName || vacancy.employer?.name || ''}</div>
          <div style="font-weight:700;color:#16a34a;margin-top:4px">${salary}</div>
          <a href="/jobs/${vacancy.slug || vacancy.id}" style="display:inline-block;margin-top:8px;padding:4px 12px;background:#000;color:#fff;border-radius:6px;font-size:12px;text-decoration:none">Batafsil</a>
        </div>
      `;

      const marker = L.marker([lat, lon]).addTo(this.map).bindPopup(popup);
      this.markers.push(marker);
    }
  }

  private clearMarkers() {
    this.markers.forEach(marker => marker.remove());
    this.markers = [];
  }

  fmt(n: number): string {
    return n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${Math.round(n / 1e3)}K` : `${n}`;
  }

  private updateSeo(vacancies: any[] = this.nearbyVacancies()) {
    this.seo.setPage({
      title: 'Vacancy map',
      description: 'Find jobs near you on the Verifix Jobs map, compare nearby salaries, and open vacancy pages by location.',
      path: '/map',
      keywords: ['job map', 'nearby jobs', 'vacancy map', 'uzbekistan jobs'],
      schema: [
        this.seo.buildCollectionPageSchema('Vacancy map', 'Map view for nearby public vacancies.', '/map'),
        this.seo.buildBreadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Map', path: '/map' }
        ]),
        this.seo.buildItemListSchema(
          'Nearby vacancies',
          (vacancies || []).slice(0, 10).map((vacancy: any) => ({
            name: vacancy.title,
            path: `/jobs/${vacancy.slug || vacancy.id}`,
            description: [vacancy.city, vacancy.distance ? `${vacancy.distance.toFixed(1)} km away` : 'Map vacancy'].join(' | ')
          }))
        )
      ]
    });
  }
}
