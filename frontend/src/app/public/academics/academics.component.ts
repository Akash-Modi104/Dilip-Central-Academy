import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/api.service';

interface Program {
  id: number;
  slug: string;
  title: string;
  short_description: string;
  description: string;
  curriculum: string;
  icon: string;
  image: string | null;
  is_featured: boolean;
  is_active: boolean;
  order: number;
}

@Component({
  selector: 'app-academics',
  templateUrl: './academics.component.html',
  styleUrls: ['./academics.component.scss'],
})
export class AcademicsComponent implements OnInit {
  programs: Program[] = [];
  selected: Program | null = null;
  loading = true;

  constructor(public api: ApiService) {}

  ngOnInit(): void {
    this.api.get<{ results: Program[] } | Program[]>('academics/programs/').subscribe({
      next: res => {
        const list = (Array.isArray(res) ? res : (res as any).results || []) as Program[];
        this.programs = list.filter(p => p.is_active !== false).sort((a, b) => a.order - b.order);
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  imageUrl(path: string | null): string { return path ? this.api.mediaUrl(path) : ''; }
}
