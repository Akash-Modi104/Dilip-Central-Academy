import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ApiService } from '../../core/api.service';

interface Album {
  id: number;
  title: string;
  description: string;
  cover_image: string | null;
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

  newAlbum = { title: '', description: '' };
  savingAlbum = false;
  showAlbumForm = false;

  uploadFiles: File[] = [];
  uploadCaption = '';
  uploading = false;
  uploadError = '';

  deletePhotoId: number | null = null;
  deleteAlbumId: number | null = null;

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

  saveAlbum(form: NgForm): void {
    if (form.invalid) return;
    this.savingAlbum = true;
    this.api.post<Album>('gallery/albums/', this.newAlbum).subscribe({
      next: a => { this.albums.push(a); this.newAlbum = { title: '', description: '' }; this.showAlbumForm = false; this.savingAlbum = false; },
      error: () => { this.savingAlbum = false; },
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
    let done = 0;
    this.uploadFiles.forEach(file => {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('album', String(this.selectedAlbum!.id));
      if (this.uploadCaption) fd.append('caption', this.uploadCaption);
      this.api.postForm<Photo>('gallery/photos/', fd).subscribe({
        next: p => {
          this.photos.push(p);
          done++;
          if (done === this.uploadFiles.length) { this.uploading = false; this.uploadFiles = []; this.uploadCaption = ''; }
        },
        error: () => { this.uploading = false; this.uploadError = 'Some uploads failed.'; },
      });
    });
  }

  confirmDeletePhoto(id: number): void { this.deletePhotoId = id; }
  confirmDeleteAlbum(id: number): void { this.deleteAlbumId = id; }

  deletePhoto(): void {
    if (!this.deletePhotoId) return;
    this.api.delete(`gallery/photos/${this.deletePhotoId}/`).subscribe({
      next: () => { this.photos = this.photos.filter(p => p.id !== this.deletePhotoId); this.deletePhotoId = null; },
      error: () => { this.deletePhotoId = null; },
    });
  }

  deleteAlbum(): void {
    if (!this.deleteAlbumId) return;
    this.api.delete(`gallery/albums/${this.deleteAlbumId}/`).subscribe({
      next: () => {
        this.albums = this.albums.filter(a => a.id !== this.deleteAlbumId);
        if (this.selectedAlbum?.id === this.deleteAlbumId) this.selectedAlbum = null;
        this.deleteAlbumId = null;
      },
      error: () => { this.deleteAlbumId = null; },
    });
  }

  imageUrl(p: string | null): string { return p ? this.api.mediaUrl(p) : ''; }
}
