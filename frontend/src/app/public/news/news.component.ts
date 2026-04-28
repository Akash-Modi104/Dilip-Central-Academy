import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../core/api.service';

interface NewsItem {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  thumbnail: string | null;
  published_at: string;
  category: string;
  is_featured: boolean;
}

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss'],
})
export class NewsComponent implements OnInit {
  news: NewsItem[] = [];
  selected: NewsItem | null = null;
  loading = true;
  categories: string[] = [];
  activeCategory = '';

  constructor(private api: ApiService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['slug']) {
        this.loadArticle(params['slug']);
      } else {
        this.loadList();
      }
    });
  }

  loadList(): void {
    this.selected = null;
    this.loading = true;
    const query = this.activeCategory ? `news/?category=${encodeURIComponent(this.activeCategory)}&ordering=-published_at` : 'news/?ordering=-published_at';
    this.api.get<{ results: NewsItem[] } | NewsItem[]>(query).subscribe({
      next: res => {
        this.news = Array.isArray(res) ? res : (res as any).results || [];
        this.categories = [...new Set(this.news.map(n => n.category).filter(Boolean))];
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  loadArticle(slug: string): void {
    this.loading = true;
    this.api.get<NewsItem>(`news/${slug}/`).subscribe({
      next: item => { this.selected = item; this.loading = false; },
      error: () => { this.router.navigate(['/news']); },
    });
  }

  filterBy(cat: string): void {
    this.activeCategory = cat;
    this.loadList();
  }

  thumbnailUrl(path: string | null): string {
    return path ? this.api.mediaUrl(path) : '';
  }
}
