import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/api.service';

interface GalleryAlbum {
  id: number;
  name: string;
  slug: string;
  description: string;
  cover_image: string | null;
  is_visible: boolean;
  photo_count: number;
  created_at: string;
}

interface GalleryPhoto {
  id: number;
  image: string;
  caption: string;
  album: number;
}

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
})
export class GalleryComponent implements OnInit {
  albums: GalleryAlbum[] = [];
  photos: GalleryPhoto[] = [];
  selectedAlbum: GalleryAlbum | null = null;
  loadingAlbums = true;
  loadingPhotos = false;
  lightboxPhoto: GalleryPhoto | null = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.get<{ results: GalleryAlbum[] } | GalleryAlbum[]>('gallery/albums/').subscribe({
      next: res => {
        const list = (Array.isArray(res) ? res : (res as any).results || []) as GalleryAlbum[];
        this.albums = list.filter(a => a.is_visible !== false);
        this.loadingAlbums = false;
      },
      error: () => { this.loadingAlbums = false; },
    });
  }

  openAlbum(album: GalleryAlbum): void {
    this.selectedAlbum = album;
    this.photos = [];
    this.loadingPhotos = true;
    this.api.get<{ results: GalleryPhoto[] } | GalleryPhoto[]>(`gallery/photos/?album=${album.id}`).subscribe({
      next: res => {
        this.photos = Array.isArray(res) ? res : (res as any).results || [];
        this.loadingPhotos = false;
      },
      error: () => { this.loadingPhotos = false; },
    });
  }

  imageUrl(path: string | null): string {
    return path ? this.api.mediaUrl(path) : '';
  }
}
