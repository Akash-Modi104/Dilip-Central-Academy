import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ApiService } from '../../core/api.service';

interface Album {
  id: number;
  name: string;
  slug: string;
  description: string;
  cover_image: string | null;
  is_visible: boolean;
  order: number;
  photo_count: number;
}

interface Photo {
  id: number;
  image: string;
  caption: string;
  album: number;
}

@Component({
  selector: 'app-admin-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
})
export class GalleryComponent implements OnInit {
  albums: Album[] = [];
  photos: Photo[] = [];
  selectedAlbum: Album | null = null;
  loadingAlbums = true;
  loadingPhotos = false;

  newAlbum: { name: string; slug: string; description: string; is_visible: boolean; order: number } = {
    name: '', slug: '', description: '', is_visible: true, order: 0,
  };
  coverFile: File | null = null;
  savingAlbum = false;
  albumError = '';
  showAlbumForm = false;

  uploadFiles: File[] = [];
  uploadCaption = '';
  uploading = false;
  uploadError = '';

  deletePhotoId: number | null = null;
  deleteAlbumSlug: string | null = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.loadAlbums(); }

  loadAlbums(): void {
    this.loadingAlbums = true;
    this.api.get<{ results: Album[] } | Album[]>('gallery/albums/').subscribe({
      next: res => { this.albums = Array.isArray(res) ? res : (res as any).results || []; this.loadingAlbums = false; },
      error: () => { this.loadingAlbums = false; },
    });
  }

  openAlbum(album: Album): void {
    this.selectedAlbum = album;
    this.loadingPhotos = true;
    this.api.get<{ results: Photo[] } | Photo[]>(`gallery/photos/?album=${album.id}`).subscribe({
      next: res => { this.photos = Array.isArray(res) ? res : (res as any).results || []; this.loadingPhotos = false; },
      error: () => { this.loadingPhotos = false; },
    });
  }

  autoSlug(): void {
    if (!this.newAlbum.slug) {
      this.newAlbum.slug = (this.newAlbum.name || '')
        .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
  }

  onCoverFile(e: Event): void {
    this.coverFile = (e.target as HTMLInputElement).files?.[0] || null;
  }

  saveAlbum(form: NgForm): void {
    if (form.invalid) return;
    if (!this.newAlbum.slug) this.autoSlug();
    if (!this.newAlbum.name || !this.newAlbum.slug) return;
    this.savingAlbum = true;
    this.albumError = '';

    const fd = new FormData();
    fd.append('name', this.newAlbum.name);
    fd.append('slug', this.newAlbum.slug);
    fd.append('description', this.newAlbum.description || '');
    fd.append('is_visible', this.newAlbum.is_visible ? 'true' : 'false');
    fd.append('order', String(this.newAlbum.order || 0));
    if (this.coverFile) fd.append('cover_image', this.coverFile);

    this.api.postForm<Album>('gallery/albums/', fd).subscribe({
      next: a => {
        this.albums.push(a);
        this.newAlbum = { name: '', slug: '', description: '', is_visible: true, order: 0 };
        this.coverFile = null;
        this.showAlbumForm = false;
        this.savingAlbum = false;
      },
      error: err => {
        this.savingAlbum = false;
        this.albumError = this.formatError(err) || 'Failed to create album.';
      },
    });
  }

  onFilesChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.uploadFiles = input.files ? Array.from(input.files) : [];
  }

  uploadPhotos(): void {
    if (!this.uploadFiles.length || !this.selectedAlbum) return;
    this.uploading = true;
    this.uploadError = '';
    let done = 0; let failed = 0;
    const total = this.uploadFiles.length;
    this.uploadFiles.forEach(file => {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('album', String(this.selectedAlbum!.id));
      if (this.uploadCaption) fd.append('caption', this.uploadCaption);
      this.api.postForm<Photo>('gallery/photos/', fd).subscribe({
        next: p => { this.photos.push(p); done++; this.maybeFinish(done, failed, total); },
        error: () => { failed++; this.uploadError = 'Some uploads failed.'; this.maybeFinish(done, failed, total); },
      });
    });
  }
  private maybeFinish(done: number, failed: number, total: number): void {
    if (done + failed >= total) {
      this.uploading = false;
      this.uploadFiles = [];
      this.uploadCaption = '';
      const input = document.querySelector<HTMLInputElement>('input[type="file"][multiple]');
      if (input) input.value = '';
      if (this.selectedAlbum) {
        const a = this.albums.find(x => x.id === this.selectedAlbum!.id);
        if (a) a.photo_count = (a.photo_count || 0) + done;
      }
    }
  }

  confirmDeletePhoto(id: number): void { this.deletePhotoId = id; }
  confirmDeleteAlbum(slug: string): void { this.deleteAlbumSlug = slug; }

  deletePhoto(): void {
    if (!this.deletePhotoId) return;
    const id = this.deletePhotoId;
    this.api.delete(`gallery/photos/${id}/`).subscribe({
      next: () => { this.photos = this.photos.filter(p => p.id !== id); this.deletePhotoId = null; },
      error: () => { this.deletePhotoId = null; },
    });
  }

  deleteAlbum(): void {
    if (!this.deleteAlbumSlug) return;
    const slug = this.deleteAlbumSlug;
    this.api.delete(`gallery/albums/${slug}/`).subscribe({
      next: () => {
        this.albums = this.albums.filter(a => a.slug !== slug);
        if (this.selectedAlbum?.slug === slug) this.selectedAlbum = null;
        this.deleteAlbumSlug = null;
      },
      error: () => { this.deleteAlbumSlug = null; },
    });
  }

  imageUrl(p: string | null): string { return p ? this.api.mediaUrl(p) : ''; }

  private formatError(err: any): string {
    const e = err?.error;
    if (!e) return '';
    if (typeof e === 'string') return e;
    return Object.entries(e).map(([k, v]) => `${k}: ${(Array.isArray(v) ? v.join(', ') : v)}`).join('  ');
  }
}
