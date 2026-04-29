import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { ThemeService, SiteSettings } from '../../core/theme.service';

interface Hero {
  headline: string;
  subtext: string;
  background_image: string | null;
  cta_primary_label: string;
  cta_primary_url: string;
  cta_secondary_label: string;
  cta_secondary_url: string;
  is_active: boolean;
  show_stats: boolean;
  show_programs: boolean;
  show_testimonials: boolean;
  show_news: boolean;
}

interface Stat { id: number; label: string; value: string; icon: string; order: number; is_active: boolean; }

interface Testimonial {
  id: number; name: string; role: string; photo: string | null;
  quote: string; rating: number; is_active: boolean;
}

interface Program {
  id: number; slug: string; title: string; short_description: string;
  icon: string; image: string | null; is_featured: boolean;
}

interface NewsItem {
  id: number; title: string; slug: string; summary: string;
  image: string | null; publish_at: string; tag: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  settings: SiteSettings | null = null;
  hero: Hero | null = null;
  stats: Stat[] = [];
  testimonials: Testimonial[] = [];
  programs: Program[] = [];
  latestNews: NewsItem[] = [];

  // Sensible icon defaults so the page never looks empty
  private readonly fallbackStats: Stat[] = [
    { id: 0, label: 'Years of Excellence', value: '15+', icon: '🏆', order: 0, is_active: true },
    { id: 0, label: 'Students Enrolled',   value: '500+', icon: '🎓', order: 1, is_active: true },
    { id: 0, label: 'Qualified Teachers',  value: '40+', icon: '👩‍🏫', order: 2, is_active: true },
    { id: 0, label: 'Awards Won',          value: '25+', icon: '🥇', order: 3, is_active: true },
  ];

  constructor(public api: ApiService, public theme: ThemeService) {}

  ngOnInit(): void {
    this.settings = this.theme.settings;

    this.api.get<Hero>('homepage/hero/').subscribe({
      next: h => this.hero = h,
      error: () => {},
    });

    this.api.get<{ results: Stat[] } | Stat[]>('homepage/stats/').subscribe({
      next: r => {
        const list = (Array.isArray(r) ? r : (r as any).results || []) as Stat[];
        const active = list.filter(s => s.is_active !== false).sort((a, b) => a.order - b.order);
        this.stats = active.length ? active : this.fallbackStats;
      },
      error: () => { this.stats = this.fallbackStats; },
    });

    this.api.get<{ results: Testimonial[] } | Testimonial[]>('homepage/testimonials/').subscribe({
      next: r => {
        const list = (Array.isArray(r) ? r : (r as any).results || []) as Testimonial[];
        this.testimonials = list.filter(t => t.is_active !== false).slice(0, 6);
      },
      error: () => {},
    });

    this.api.get<{ results: Program[] } | Program[]>('academics/programs/').subscribe({
      next: r => {
        const list = (Array.isArray(r) ? r : (r as any).results || []) as Program[];
        this.programs = list.filter(p => p.is_featured).slice(0, 4);
      },
      error: () => {},
    });

    this.api.get<{ results: NewsItem[] } | NewsItem[]>('news/articles/?ordering=-publish_at').subscribe({
      next: r => {
        const list = (Array.isArray(r) ? r : (r as any).results || []) as NewsItem[];
        this.latestNews = list.slice(0, 3);
      },
      error: () => {},
    });
  }

  imageUrl(path: string | null): string {
    return path ? this.api.mediaUrl(path) : '';
  }

  heroBg(): string {
    return this.hero?.background_image ? this.api.mediaUrl(this.hero.background_image) : '';
  }

  starsArray(n: number): number[] {
    const v = Math.max(0, Math.min(5, Math.round(n || 0)));
    return Array.from({ length: v });
  }
}
