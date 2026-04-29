import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../core/api.service';

interface NewsItem {
  id: number;
  title: string;
  slug: string;
  tag: string;
  summary: string;
  body: string;
  image: string | null;
  status: 'draft' | 'published';
  is_featured: boolean;
  publish_at: string;
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
  tags: string[] = [];
  activeTag = '';

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
    const query = this.activeTag
      ? `news/articles/?tag=${encodeURIComponent(this.activeTag)}&ordering=-publish_at`
      : 'news/articles/?ordering=-publish_at';
    this.api.get<{ results: NewsItem[] } | NewsItem[]>(query).subscribe({
      next: res => {
        this.news = Array.isArray(res) ? res : (res as any).results || [];
        this.tags = [...new Set(this.news.map(n => n.tag).filter(Boolean))];
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  loadArticle(slug: string): void {
    this.loading = true;
    this.api.get<NewsItem>(`news/articles/${slug}/`).subscribe({
      next: item => { this.selected = item; this.loading = false; },
      error: () => { this.router.navigate(['/news']); },
    });
  }

  filterBy(tag: string): void {
    this.activeTag = tag;
    this.loadList();
  }

  imageUrl(path: string | null): string {
    return path ? this.api.mediaUrl(path) : '';
  }
}
