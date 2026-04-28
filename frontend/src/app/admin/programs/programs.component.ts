import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/api.service';

interface Program {
  id?: number; title: string; slug: string; short_description: string;
  description: string; curriculum: string; icon: string; image: string | null;
  is_featured: boolean; is_active: boolean; order: number;
}

@Component({
  selector: 'app-admin-programs',
  template: `
  <div class="page">
    <header class="page-head">
      <h2>Programs</h2>
      <button class="btn btn-primary" (click)="openNew()">+ New Program</button>
    </header>

    <div *ngIf="loading">Loading…</div>
    <table *ngIf="!loading && items.length" class="card">
      <thead><tr><th>Order</th><th>Title</th><th>Slug</th><th>Featured</th><th>Active</th><th></th></tr></thead>
      <tbody>
        <tr *ngFor="let p of items">
          <td>{{p.order}}</td><td>{{p.title}}</td><td class="muted">{{p.slug}}</td>
          <td><input type="checkbox" [checked]="p.is_featured" (change)="toggle(p,'is_featured')"></td>
          <td><input type="checkbox" [checked]="p.is_active" (change)="toggle(p,'is_active')"></td>
          <td>
            <button class="btn btn-outline" (click)="edit(p)">Edit</button>
            <button class="btn btn-outline" style="margin-left:6px" (click)="del(p)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p *ngIf="!loading && !items.length" class="muted">No programs yet.</p>

    <div class="modal" *ngIf="showForm">
      <div class="modal-card card">
        <h3>{{ editing ? 'Edit Program' : 'New Program' }}</h3>
        <div class="form-row"><label>Title</label><input [(ngModel)]="form.title"></div>
        <div class="form-row"><label>Slug</label><input [(ngModel)]="form.slug" placeholder="grade-1"></div>
        <div class="form-row"><label>Short description</label><input [(ngModel)]="form.short_description"></div>
        <div class="form-row"><label>Description (HTML allowed)</label><textarea rows="4" [(ngModel)]="form.description"></textarea></div>
        <div class="form-row"><label>Curriculum (HTML allowed)</label><textarea rows="4" [(ngModel)]="form.curriculum"></textarea></div>
        <div class="form-row"><label>Icon (name or class)</label><input [(ngModel)]="form.icon"></div>
        <div class="form-row"><label>Order</label><input type="number" [(ngModel)]="form.order"></div>
        <div class="form-row"><label><input type="checkbox" [(ngModel)]="form.is_featured"> Featured on homepage</label></div>
        <div class="form-row"><label><input type="checkbox" [(ngModel)]="form.is_active"> Active</label></div>
        <div style="display:flex; gap:8px; justify-content:flex-end">
          <button class="btn btn-outline" (click)="showForm=false">Cancel</button>
          <button class="btn btn-primary" (click)="save()" [disabled]="saving">{{ saving ? 'Saving…' : 'Save' }}</button>
        </div>
      </div>
    </div>
  </div>`,
  styles: [`.page{padding:1rem} .page-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem}
  .modal{position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:1000}
  .modal-card{width:min(640px,92vw);max-height:90vh;overflow:auto}`],
})
export class AdminProgramsComponent implements OnInit {
  items: Program[] = []; loading = true;
  showForm = false; editing: Program | null = null; saving = false;
  form: Program = this.empty();

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.load(); }

  empty(): Program { return { title:'', slug:'', short_description:'', description:'', curriculum:'', icon:'', image:null, is_featured:false, is_active:true, order:0 }; }

  load(): void {
    this.loading = true;
    this.api.get<any>('academics/programs/').subscribe({
      next: r => { this.items = (Array.isArray(r) ? r : r.results || []).sort((a:any,b:any)=>a.order-b.order); this.loading=false; },
      error: () => this.loading=false,
    });
  }

  openNew(): void { this.editing=null; this.form=this.empty(); this.showForm=true; }
  edit(p: Program): void { this.editing=p; this.form={...p}; this.showForm=true; }

  save(): void {
    this.saving = true;
    const req$ = this.editing
      ? this.api.patch(`academics/programs/${this.editing.slug}/`, this.form)
      : this.api.post('academics/programs/', this.form);
    req$.subscribe({ next: () => { this.saving=false; this.showForm=false; this.load(); }, error: () => this.saving=false });
  }

  toggle(p: Program, field: 'is_active'|'is_featured'): void {
    this.api.patch(`academics/programs/${p.slug}/`, { [field]: !p[field] }).subscribe({
      next: (u: any) => { (p as any)[field] = u[field]; },
    });
  }

  del(p: Program): void {
    if (!confirm(`Delete program "${p.title}"?`)) return;
    this.api.delete(`academics/programs/${p.slug}/`).subscribe(() => this.load());
  }
}
