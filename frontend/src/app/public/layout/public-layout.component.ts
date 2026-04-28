import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { ThemeService, SiteSettings } from '../../core/theme.service';

interface NavLink { id: number; label: string; url: string; order: number; is_active: boolean; open_in_new_tab: boolean; }

@Component({
  selector: 'app-public-layout',
  templateUrl: './public-layout.component.html',
  styleUrls: ['./public-layout.component.scss'],
})
export class PublicLayoutComponent implements OnInit {
  settings: SiteSettings | null = null;
  navLinks: NavLink[] = [];
  defaultNav = [
    { label: 'Home', url: '/' },
    { label: 'About', url: '/about' },
    { label: 'Academics', url: '/academics' },
    { label: 'Admissions', url: '/admissions' },
    { label: 'News', url: '/news' },
    { label: 'Gallery', url: '/gallery' },
    { label: 'Contact', url: '/contact' },
  ];

  constructor(private api: ApiService, public theme: ThemeService) {}

  ngOnInit(): void {
    this.settings = this.theme.settings;
    this.api.get<{ results: NavLink[] } | NavLink[]>('site/nav-links/').subscribe(res => {
      const links = Array.isArray(res) ? res : (res as any).results || [];
      this.navLinks = links.filter(l => l.is_active).sort((a, b) => a.order - b.order);
    });
  }

  logoUrl(): string { return this.settings?.logo ? this.api.mediaUrl(this.settings.logo) : ''; }
}
