import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { ThemeService, SiteSettings } from '../../core/theme.service';

interface StaffMember {
  id: number;
  name: string;
  designation: string;
  bio: string;
  photo: string | null;
  order: number;
}

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent implements OnInit {
  settings: SiteSettings | null = null;
  staff: StaffMember[] = [];
  loading = true;

  constructor(private api: ApiService, public theme: ThemeService) {}

  ngOnInit(): void {
    this.settings = this.theme.settings;
    this.api.get<{ results: StaffMember[] } | StaffMember[]>('about/staff/').subscribe({
      next: res => {
        this.staff = Array.isArray(res) ? res : (res as any).results || [];
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  photoUrl(path: string | null): string {
    return path ? this.api.mediaUrl(path) : '';
  }
}
