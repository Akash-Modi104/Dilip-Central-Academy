import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { ApiService } from '../../core/api.service';

interface NewsForm {
  title: string;
  slug: string;
  tag: string;
  summary: string;
  body: string;
  status: 'draft' | 'published';
  is_featured: boolean;
  publish_at: string; // datetime-local string
}

@Component({
  selector: 'app-news-form',
  templateUrl: './news-form.component.html',
  styleUrls: ['./news-form.component.scss'],
})
export class NewsFormComponent implements OnInit {
  isEdit = false;
  articleSlug: string | null = null;
  model: NewsForm = this.empty();
  imageFile: File | null = null;
  existingImage: string | null = null;
  loading = false;
  saving = false;
  error = '';

  constructor(private api: ApiService, private route: ActivatedRoute, private router: Router) {}

  empty(): NewsForm {
    const today = new Date();
    const localIso = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
      .toISOString().slice(0, 16);
    return {
      title: '', slug: '', tag: '', summary: '', body: '',
      status: 'draft', is_featured: false, publish_at: localIso,
    };
  }

  ngOnInit(): void {
    const slug = this.route.snapshot.params['slug'];
    if (slug) {
      this.isEdit = true;
      this.articleSlug = slug;
      this.loading = true;
      this.api.get<any>(`news/articles/${slug}/`).subscribe({
        next: a => {
          this.model = {
            title: a.title || '',
            slug: a.slug || '',
            tag: a.tag || '',
            summary: a.summary || '',
            body: a.body || '',
            status: a.status || 'draft',
            is_featured: !!a.is_featured,
            publish_at: a.publish_at ? a.publish_at.slice(0, 16) : this.empty().publish_at,
          };
          this.existingImage = a.image || null;
          this.loading = false;
        },
        error: () => { this.loading = false; this.router.navigate(['/admin/news']); },
      });
    }
  }

  onImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.imageFile = input.files[0];
  }

  autoSlug(): void {
    if (!this.isEdit && !this.model.slug) {
      this.model.slug = this.model.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
  }

  imageUrl(p: string | null): string { return p ? this.api.mediaUrl(p) : ''; }

  save(form: NgForm): void {
    if (form.invalid) return;
    this.saving = true;
    this.error = '';

    const fd = new FormData();
    fd.append('title', this.model.title);
    fd.append('slug', this.model.slug);
    fd.append('tag', this.model.tag || '');
    fd.append('summary', this.model.summary || '');
    fd.append('body', this.model.body || '');
    fd.append('status', this.model.status);
    fd.append('is_featured', this.model.is_featured ? 'true' : 'false');
    // datetime-local has no zone — backend's default tz will read it as local.
    fd.append('publish_at', this.model.publish_at);
    if (this.imageFile) fd.append('image', this.imageFile);

    const req$ = this.isEdit
      ? this.api.patchForm(`news/articles/${this.articleSlug}/`, fd)
      : this.api.postForm('news/articles/', fd);

    req$.subscribe({
      next: () => this.router.navigate(['/admin/news']),
      error: err => {
        this.saving = false;
        this.error = this.formatError(err) || 'Failed to save. Please check all fields.';
      },
    });
  }

  private formatError(err: any): string {
    const e = err?.error;
    if (!e) return '';
    if (typeof e === 'string') return e;
    return Object.entries(e).map(([k, v]) => `${k}: ${(Array.isArray(v) ? v.join(', ') : v)}`).join('  ');
  }
}
