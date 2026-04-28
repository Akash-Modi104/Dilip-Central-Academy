import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

export interface SiteSettings {
  id: number;
  school_name: string;
  tagline: string;
  founded_year: number | null;
  logo: string | null;
  favicon: string | null;
  primary_color: string;
  accent_color: string;
  phone: string;
  email: string;
  address: string;
  map_embed_url: string;
  office_hours: string;
  facebook_url: string;
  instagram_url: string;
  youtube_url: string;
  twitter_url: string;
  linkedin_url: string;
}

@Injectable({ providedIn: 'root' })
export class ThemeService {
  settings: SiteSettings | null = null;

  constructor(private api: ApiService) {}

  bootstrap(): Promise<void> {
    return new Promise(resolve => {
      this.api.get<SiteSettings>('site/settings/').subscribe({
        next: s => { this.settings = s; this.applyTheme(s); resolve(); },
        error: () => resolve(),
      });
    });
  }

  refresh(): Promise<void> { return this.bootstrap(); }

  applyTheme(s: SiteSettings): void {
    const root = document.documentElement;
    if (s.primary_color) root.style.setProperty('--color-primary', s.primary_color);
    if (s.accent_color) root.style.setProperty('--color-accent', s.accent_color);
    if (s.school_name) document.title = s.school_name;
  }
}
