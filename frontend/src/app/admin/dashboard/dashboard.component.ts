import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';

interface DashboardStats {
  total_news: number;
  total_gallery_photos: number;
  total_admissions: number;
  pending_admissions: number;
  total_messages: number;
  unread_messages: number;
}

interface StatCard {
  label: string;
  value: number;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  loading = true;
  cards: StatCard[] = [];

  constructor(public auth: AuthService, private api: ApiService) {}

  ngOnInit(): void {
    this.api.get<DashboardStats>('dashboard/stats/').subscribe({
      next: s => {
        this.stats = s;
        this.buildCards(s);
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  private buildCards(s: DashboardStats): void {
    this.cards = [
      { label: 'News Articles', value: s.total_news, icon: '📰', color: '#3b82f6' },
      { label: 'Gallery Photos', value: s.total_gallery_photos, icon: '🖼️', color: '#8b5cf6' },
      { label: 'Admissions', value: s.total_admissions, icon: '📋', color: '#10b981' },
      { label: 'Pending Admissions', value: s.pending_admissions, icon: '⏳', color: '#f59e0b' },
      { label: 'Contact Messages', value: s.total_messages, icon: '✉️', color: '#6366f1' },
      { label: 'Unread Messages', value: s.unread_messages, icon: '🔔', color: '#ef4444' },
    ];
  }
}
