import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { ApiService } from '../../core/api.service';

interface NewsForm {
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  is_published: boolean;
  is_featured: boolean;
  published_at: string;
}

@Component({
  selector: 'app-news-form',
  templateUrl: './news-form.component.html',
  styleUrls: ['./news-form.component.scss'],
})
export class NewsFormComponent implements OnInit {
  isEdit = false;
  articleId: number | null = null;
  model: NewsForm = {
    title: '', slug: '', summary: '', content: '', category: '',
    is_published: false, is_featured: false, published_at: new Date().toISOString().slice(0, 10),
  };
  thumbnailFile: File | null = null;
  loading = false;
  saving = false;
  error = '';

  constructor(private api: ApiService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEdit = true;
      this.articleId = +id;
      this.loading = true;
      this.api.get<any>(`news/${id}/`).subscribe({
        next: a => {
          this.model = {
            title: a.title, slug: a.slug, summary: a.summary || '', content: a.content || '',
            category: a.category || '', is_published: a.is_published, is_featured: a.is_featured,
            published_at: a.published_at ? a.published_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
          };
          this.loading = false;
        },
        error: () => { this.loading = false; this.router.navigate(['/admin/news']); },
      });
    }
  }

  onThumbnailChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.thumbnailFile = input.files[0];
  }

  autoSlug(): void {
    if (!this.isEdit) {
      this.model.slug = this.model.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
  }

  save(form: NgForm): void {
    if (form.invalid) return;
    this.saving = true;
    this.error = '';

    const fd = new FormData();
    Object.entries(this.model).forEach(([k, v]) => fd.append(k, String(v)));
    if (this.thumbnailFile) fd.append('thumbnail', this.thumbnailFile);

    const req$ = this.isEdit
      ? this.api.patchForm(`news/${this.articleId}/`, fd)
      : this.api.postForm('news/', fd);

    req$.subscribe({
      next: () => this.router.navigate(['/admin/news']),
      error: () => { this.saving = false; this.error = 'Failed to save. Please check all fields.'; },
    });
  }
}
