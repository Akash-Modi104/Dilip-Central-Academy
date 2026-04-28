import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { ThemeService, SiteSettings } from '../../core/theme.service';

interface NewsItem {
  id: number;
  title: string;
  slug: string;
  summary: string;
  thumbnail: string | null;
  published_at: string;
  category: string;
}

interface Stat {
  label: string;
  value: string;
  icon: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  settings: SiteSettings | null = null;
  latestNews: NewsItem[] = [];
  stats: Stat[] = [
    { label: 'Years of Excellence', value: '25+', icon: '🏆' },
    { label: 'Students Enrolled', value: '1200+', icon: '🎓' },
    { label: 'Qualified Teachers', value: '80+', icon: '👩‍🏫' },
    { label: 'Awards Won', value: '50+', icon: '🥇' },
  ];

  constructor(private api: ApiService, public theme: ThemeService) {}

  ngOnInit(): void {
    this.settings = this.theme.settings;
    this.api.get<{ results: NewsItem[] } | NewsItem[]>('news/?limit=3&ordering=-published_at').subscribe({
      next: res => {
        this.latestNews = Array.isArray(res) ? res.slice(0, 3) : ((res as any).results || []).slice(0, 3);
      },
      error: () => {},
    });
  }

  thumbnailUrl(path: string | null): string {
    return path ? this.api.mediaUrl(path) : 'assets/news-placeholder.jpg';
  }
}
