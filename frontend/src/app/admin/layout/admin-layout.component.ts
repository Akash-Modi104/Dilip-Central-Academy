import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../../core/auth.service';

interface NavItem { label: string; icon: string; route: string; roles?: User['role'][]; }

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
})
export class AdminLayoutComponent {
  sidebarOpen = true;

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: '📊', route: '/admin' },
    { label: 'Site Settings', icon: '⚙️', route: '/admin/settings', roles: ['super_admin'] },
    { label: 'News', icon: '📰', route: '/admin/news' },
    { label: 'Gallery', icon: '🖼️', route: '/admin/gallery' },
    { label: 'Admissions', icon: '📋', route: '/admin/admissions' },
    { label: 'Nav Links', icon: '🔗', route: '/admin/nav-links', roles: ['super_admin'] },
  ];

  constructor(public auth: AuthService, private router: Router) {}

  get visibleNav(): NavItem[] {
    return this.navItems.filter(n => !n.roles || this.auth.hasRole(...n.roles));
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/admin/login']);
  }
}
