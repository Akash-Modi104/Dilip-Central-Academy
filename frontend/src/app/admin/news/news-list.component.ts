import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/api.service';

interface NewsItem {
  id: number;
  title: string;
  slug: string;
  tag: string;
  status: 'draft' | 'published';
  is_featured: boolean;
  publish_at: string;
}

@Component({
  selector: 'app-news-list',
  templateUrl: './news-list.component.html',
  styleUrls: ['./news-list.component.scss'],
})
export class NewsListComponent implements OnInit {
  news: NewsItem[] = [];
  loading = true;
  deleteId: number | null = null;
  deleteSlug: string | null = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.api.get<{ results: NewsItem[] } | NewsItem[]>('news/articles/?ordering=-publish_at').subscribe({
      next: res => { this.news = Array.isArray(res) ? res : (res as any).results || []; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  confirmDelete(item: NewsItem): void { this.deleteId = item.id; this.deleteSlug = item.slug; }

  cancelDelete(): void { this.deleteId = null; this.deleteSlug = null; }

  delete(): void {
    if (!this.deleteSlug) return;
    const slug = this.deleteSlug;
    this.api.delete(`news/articles/${slug}/`).subscribe({
      next: () => { this.cancelDelete(); this.load(); },
      error: () => { this.cancelDelete(); },
    });
  }
}
