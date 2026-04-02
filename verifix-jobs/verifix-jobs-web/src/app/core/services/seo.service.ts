import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

export interface SeoSchema {
  [key: string]: unknown;
}

export interface SeoBreadcrumb {
  name: string;
  path: string;
}

export interface SeoListItem {
  name: string;
  path: string;
  description?: string;
}

export interface SeoPageConfig {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: string;
  keywords?: string[];
  noindex?: boolean;
  schema?: SeoSchema | SeoSchema[];
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly document = inject(DOCUMENT);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly siteName = 'Verifix Jobs';
  private readonly schemaMarker = 'data-vjw-seo';

  setPage(config: SeoPageConfig) {
    const fullTitle = config.title.includes(this.siteName)
      ? config.title
      : `${config.title} | ${this.siteName}`;
    const description = this.normalizeText(config.description);
    const url = this.absoluteUrl(config.path || this.currentPath());
    const image = this.absoluteUrl(config.image || '/assets/logo-icon.svg');
    const robots = config.noindex
      ? 'noindex,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1'
      : 'index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1';

    this.title.setTitle(fullTitle);
    this.updateMeta('name', 'description', description);
    this.updateMeta('name', 'robots', robots);
    this.updateMeta('name', 'keywords', (config.keywords || []).join(', '));
    this.updateMeta('property', 'og:title', fullTitle);
    this.updateMeta('property', 'og:description', description);
    this.updateMeta('property', 'og:url', url);
    this.updateMeta('property', 'og:type', config.type || 'website');
    this.updateMeta('property', 'og:site_name', this.siteName);
    this.updateMeta('property', 'og:image', image);
    this.updateMeta('property', 'og:locale', 'uz_UZ');
    this.updateMeta('name', 'twitter:card', 'summary_large_image');
    this.updateMeta('name', 'twitter:title', fullTitle);
    this.updateMeta('name', 'twitter:description', description);
    this.updateMeta('name', 'twitter:image', image);
    this.setCanonical(url);
    this.setSchemas(config.schema);
  }

  absoluteUrl(path: string): string {
    if (!path) {
      return environment.siteUrl;
    }
    if (/^https?:\/\//i.test(path)) {
      return path;
    }
    const base = this.baseUrl();
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return `${base}${normalized}`;
  }

  buildBreadcrumbSchema(items: SeoBreadcrumb[]): SeoSchema {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: this.absoluteUrl(item.path)
      }))
    };
  }

  buildItemListSchema(name: string, items: SeoListItem[]): SeoSchema {
    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name,
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: this.absoluteUrl(item.path),
        name: item.name,
        ...(item.description ? { description: this.normalizeText(item.description) } : {})
      }))
    };
  }

  buildCollectionPageSchema(name: string, description: string, path: string): SeoSchema {
    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name,
      description: this.normalizeText(description),
      url: this.absoluteUrl(path),
      isPartOf: {
        '@type': 'WebSite',
        name: this.siteName,
        url: environment.siteUrl
      }
    };
  }

  buildFaqSchema(items: Array<{ question: string; answer: string }>): SeoSchema | null {
    const entities = items
      .filter(item => item.question?.trim() && item.answer?.trim())
      .map(item => ({
        '@type': 'Question',
        name: this.normalizeText(item.question),
        acceptedAnswer: {
          '@type': 'Answer',
          text: this.normalizeText(item.answer)
        }
      }));

    if (!entities.length) {
      return null;
    }

    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: entities
    };
  }

  buildWebSiteSchema(): SeoSchema {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: this.siteName,
      url: environment.siteUrl,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${environment.siteUrl}/jobs?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    };
  }

  private setSchemas(schema?: SeoSchema | SeoSchema[]) {
    this.document
      .querySelectorAll(`script[${this.schemaMarker}="true"]`)
      .forEach(node => node.remove());

    const schemas = Array.isArray(schema) ? schema : schema ? [schema] : [];
    for (const entry of schemas) {
      const script = this.document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute(this.schemaMarker, 'true');
      script.textContent = JSON.stringify(entry);
      this.document.head.appendChild(script);
    }
  }

  private setCanonical(url: string) {
    let link = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private updateMeta(kind: 'name' | 'property', key: string, content: string) {
    if (!content) {
      const selector = `${kind}="${key}"`;
      this.meta.removeTag(selector);
      return;
    }
    this.meta.updateTag({ [kind]: key, content });
  }

  private baseUrl(): string {
    const origin = this.document?.location?.origin;
    if (origin && /^https?:\/\//i.test(origin)) {
      return origin;
    }
    return environment.siteUrl;
  }

  private currentPath(): string {
    const pathname = this.document?.location?.pathname || '/';
    const search = this.document?.location?.search || '';
    return `${pathname}${search}`;
  }

  private normalizeText(value: string): string {
    return value.replace(/\s+/g, ' ').trim();
  }
}
