import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { ThemeService, SiteSettings } from '../../core/theme.service';

interface FacultyMember {
  id: number;
  name: string;
  designation: string;
  subject: string;
  bio: string;
  photo: string | null;
  is_highlighted: boolean;
  is_active: boolean;
  order: number;
}

interface AboutContent { history: string; mission: string; vision: string; }
interface PrincipalMessage {
  name: string;
  designation: string;
  photo: string | null;
  message: string;
}
interface CoreValue { id: number; title: string; description: string; icon: string; order: number; }

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent implements OnInit {
  settings: SiteSettings | null = null;
  about: AboutContent | null = null;
  principal: PrincipalMessage | null = null;
  values: CoreValue[] = [];
  staff: FacultyMember[] = [];
  loading = true;

  constructor(public api: ApiService, public theme: ThemeService) {}

  ngOnInit(): void {
    this.settings = this.theme.settings;

    this.api.get<AboutContent>('faculty/about/').subscribe({
      next: a => this.about = a,
      error: () => {},
    });

    this.api.get<PrincipalMessage>('faculty/principal-message/').subscribe({
      next: p => this.principal = p,
      error: () => {},
    });

    this.api.get<{ results: CoreValue[] } | CoreValue[]>('faculty/core-values/').subscribe({
      next: r => {
        const list = (Array.isArray(r) ? r : (r as any).results || []) as CoreValue[];
        this.values = list.sort((a, b) => a.order - b.order);
      },
      error: () => {},
    });

    this.api.get<{ results: FacultyMember[] } | FacultyMember[]>('faculty/profiles/').subscribe({
      next: r => {
        const list = (Array.isArray(r) ? r : (r as any).results || []) as FacultyMember[];
        this.staff = list
          .filter(f => f.is_active !== false && f.is_highlighted)
          .sort((a, b) => a.order - b.order);
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  photoUrl(path: string | null): string {
    return path ? this.api.mediaUrl(path) : '';
  }

  hasAbout(): boolean { return !!(this.about && (this.about.history || this.about.mission || this.about.vision)); }
}
