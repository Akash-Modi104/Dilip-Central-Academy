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

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '', component: AdminLayoutComponent, canActivate: [AuthGuard], children: [
      { path: '', component: DashboardComponent },
      { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard], data: { roles: ['super_admin'] } },
      { path: 'news', component: NewsListComponent },
      { path: 'news/new', component: NewsFormComponent },
      { path: 'news/:id/edit', component: NewsFormComponent },
      { path: 'gallery', component: GalleryComponent },
      { path: 'admissions', component: AdmissionsComponent },
      { path: 'nav-links', component: NavLinksComponent, canActivate: [AuthGuard], data: { roles: ['super_admin'] } },
    ],
  },
];

@NgModule({
  declarations: [
    AdminLayoutComponent,
    LoginComponent,
    DashboardComponent,
    SettingsComponent,
    NewsListComponent,
    NewsFormComponent,
    GalleryComponent,
    AdmissionsComponent,
    NavLinksComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
  ],
})
export class AdminModule {}
