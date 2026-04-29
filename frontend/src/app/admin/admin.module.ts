import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AuthGuard } from '../core/auth.guard';
import { AdminLayoutComponent } from './layout/admin-layout.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SettingsComponent } from './settings/settings.component';
import { NewsListComponent } from './news/news-list.component';
import { NewsFormComponent } from './news/news-form.component';
import { GalleryComponent } from './gallery/gallery.component';
import { AdmissionsComponent } from './admissions/admissions.component';
import { NavLinksComponent } from './nav-links/nav-links.component';
import { AdminProgramsComponent } from './programs/programs.component';
import { AdminHeroComponent } from './hero/hero.component';
import { AdminStatsComponent } from './stats/stats.component';
import { AdminTestimonialsComponent } from './testimonials/testimonials.component';
import { AdminNoticesComponent } from './notices/notices.component';
import { AdminContactInboxComponent } from './contact-inbox/contact-inbox.component';
import { AdminUsersComponent } from './users/users.component';
import { AdminFacultyComponent } from './faculty/faculty.component';
import { AdminAboutComponent } from './about/about.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '', component: AdminLayoutComponent, canActivate: [AuthGuard], children: [
      { path: '', component: DashboardComponent },
      { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard], data: { roles: ['super_admin'] } },
      { path: 'hero', component: AdminHeroComponent, canActivate: [AuthGuard], data: { roles: ['super_admin'] } },
      { path: 'stats', component: AdminStatsComponent, canActivate: [AuthGuard], data: { roles: ['super_admin'] } },
      { path: 'testimonials', component: AdminTestimonialsComponent, canActivate: [AuthGuard], data: { roles: ['super_admin'] } },
      { path: 'programs', component: AdminProgramsComponent, canActivate: [AuthGuard], data: { roles: ['super_admin'] } },
      { path: 'about', component: AdminAboutComponent, canActivate: [AuthGuard], data: { roles: ['super_admin'] } },
      { path: 'faculty', component: AdminFacultyComponent },
      { path: 'news', component: NewsListComponent },
      { path: 'news/new', component: NewsFormComponent },
      { path: 'news/:slug/edit', component: NewsFormComponent },
      { path: 'notices', component: AdminNoticesComponent },
      { path: 'gallery', component: GalleryComponent },
      { path: 'admissions', component: AdmissionsComponent },
      { path: 'contact-inbox', component: AdminContactInboxComponent },
      { path: 'nav-links', component: NavLinksComponent, canActivate: [AuthGuard], data: { roles: ['super_admin'] } },
      { path: 'users', component: AdminUsersComponent, canActivate: [AuthGuard], data: { roles: ['super_admin'] } },
    ],
  },
];

@NgModule({
  declarations: [
    AdminLayoutComponent, LoginComponent, DashboardComponent, SettingsComponent,
    NewsListComponent, NewsFormComponent, GalleryComponent, AdmissionsComponent, NavLinksComponent,
    AdminProgramsComponent, AdminHeroComponent, AdminStatsComponent, AdminTestimonialsComponent,
    AdminNoticesComponent, AdminContactInboxComponent, AdminUsersComponent,
    AdminFacultyComponent, AdminAboutComponent,
  ],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule.forChild(routes)],
})
export class AdminModule {}
