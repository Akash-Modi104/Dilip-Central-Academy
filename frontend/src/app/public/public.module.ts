import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PublicLayoutComponent } from './layout/public-layout.component';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { AcademicsComponent } from './academics/academics.component';
import { AdmissionsComponent } from './admissions/admissions.component';
import { NewsComponent } from './news/news.component';
import { GalleryComponent } from './gallery/gallery.component';
import { ContactComponent } from './contact/contact.component';

const routes: Routes = [
  {
    path: '', component: PublicLayoutComponent, children: [
      { path: '', component: HomeComponent },
      { path: 'about', component: AboutComponent },
      { path: 'academics', component: AcademicsComponent },
      { path: 'admissions', component: AdmissionsComponent },
      { path: 'news', component: NewsComponent },
      { path: 'news/:slug', component: NewsComponent },
      { path: 'gallery', component: GalleryComponent },
      { path: 'contact', component: ContactComponent },
    ],
  },
];

@NgModule({
  declarations: [
    PublicLayoutComponent, HomeComponent, AboutComponent, AcademicsComponent,
    AdmissionsComponent, NewsComponent, GalleryComponent, ContactComponent,
  ],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule.forChild(routes)],
})
export class PublicModule {}
