import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ApiService } from '../../core/api.service';

interface NavLink {
  id: number;
  label: string;
  url: string;
  order: number;
  is_active: boolean;
  open_in_new_tab: boolean;
}

@Component({
  selector: 'app-nav-links',
  templateUrl: './nav-links.component.html',
  styleUrls: ['./nav-links.component.scss'],
})
export class NavLinksComponent implements OnInit {
  links: NavLink[] = [];
  loading = true;
  editingId: number | null = null;
  deleteId: number | null = null;
  saving = false;

  newLink: Partial<NavLink> = { label: '', url: '', order: 0, is_active: true, open_in_new_tab: false };
  showForm = false;

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.api.get<{ results: NavLink[] } | NavLink[]>('site/nav-links/').subscribe({
      next: res => {
        const all = Array.isArray(res) ? res : (res as any).results || [];
        this.links = all.sort((a: NavLink, b: NavLink) => a.order - b.order);
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  save(form: NgForm): void {
    if (form.invalid) return;
    this.saving = true;
    const req$ = this.editingId
      ? this.api.put<NavLink>(`site/nav-links/${this.editingId}/`, this.newLink)
      : this.api.post<NavLink>('site/nav-links/', this.newLink);

    req$.subscribe({
      next: () => { this.saving = false; this.showForm = false; this.editingId = null; this.newLink = { label: '', url: '', order: 0, is_active: true, open_in_new_tab: false }; this.load(); },
      error: () => { this.saving = false; },
    });
  }

  edit(link: NavLink): void {
    this.editingId = link.id;
    this.newLink = { ...link };
    this.showForm = true;
  }

  toggleActive(link: NavLink): void {
    this.api.patch(`site/nav-links/${link.id}/`, { is_active: !link.is_active }).subscribe({
      next: (updated: any) => { link.is_active = updated.is_active; },
      error: () => {},
    });
  }

  confirmDelete(id: number): void { this.deleteId = id; }

  delete(): void {
    if (!this.deleteId) return;
    this.api.delete(`site/nav-links/${this.deleteId}/`).subscribe({
      next: () => { this.links = this.links.filter(l => l.id !== this.deleteId); this.deleteId = null; },
      error: () => { this.deleteId = null; },
    });
  }

  cancelForm(): void { this.showForm = false; this.editingId = null; this.newLink = { label: '', url: '', order: 0, is_active: true, open_in_new_tab: false }; }
}
