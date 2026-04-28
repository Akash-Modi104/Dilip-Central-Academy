import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/api.service';

interface NewsItem {
  id: number;
  title: string;
  slug: string;
  category: string;
  is_published: boolean;
  is_featured: boolean;
  published_at: string;
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

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.api.get<{ results: NewsItem[] } | NewsItem[]>('news/?ordering=-published_at').subscribe({
      next: res => { this.news = Array.isArray(res) ? res : (res as any).results || []; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  confirmDelete(id: number): void { this.deleteId = id; }

  cancelDelete(): void { this.deleteId = null; }

  delete(): void {
    if (!this.deleteId) return;
    this.api.delete(`news/${this.deleteId}/`).subscribe({
      next: () => { this.deleteId = null; this.load(); },
      error: () => { this.deleteId = null; },
    });
  }
}
