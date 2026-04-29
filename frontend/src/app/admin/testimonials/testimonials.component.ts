import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-admin-testimonials',
  template: `
  <div class="page">
    <header class="page-head"><h2>Testimonials</h2>
      <button class="btn btn-primary" (click)="openNew()">+ New</button></header>
    <div *ngFor="let t of items" class="card" style="margin-bottom:.75rem">
      <div style="display:flex;gap:1rem;align-items:flex-start">
        <img *ngIf="t.photo" [src]="api.mediaUrl(t.photo)" style="width:60px;height:60px;border-radius:50%;object-fit:cover">
        <div style="flex:1">
          <strong>{{t.name}}</strong> <span class="muted">{{t.role}}</span>
          <p style="margin:.25rem 0">{{t.quote}}</p>
          <div class="muted" style="font-size:.85rem">order: {{t.order}} · {{ t.is_active ? 'active' : 'inactive' }} · ★{{t.rating}}</div>
        </div>
        <div>
          <button class="btn btn-outline" (click)="edit(t)">Edit</button>
          <button class="btn btn-outline" style="margin-left:6px" (click)="del(t)">Delete</button>
        </div>
      </div>
    </div>
    <p *ngIf="!items.length" class="muted">No testimonials yet.</p>

    <div class="modal" *ngIf="showForm">
      <div class="modal-card card">
        <h3>{{ editing ? 'Edit' : 'New' }} Testimonial</h3>
        <div class="form-row"><label>Name</label><input [(ngModel)]="form.name"></div>
        <div class="form-row"><label>Role / Relation</label><input [(ngModel)]="form.role"></div>
        <div class="form-row"><label>Quote</label><textarea rows="4" [(ngModel)]="form.quote"></textarea></div>
        <div class="form-row"><label>Rating (1-5)</label><input type="number" min="1" max="5" [(ngModel)]="form.rating"></div>
        <div class="form-row"><label>Order</label><input type="number" [(ngModel)]="form.order"></div>
        <div class="form-row"><label>Photo</label><input type="file" (change)="onFile($event)"></div>
        <div class="form-row"><label><input type="checkbox" [(ngModel)]="form.is_active"> Active</label></div>
        <div style="display:flex;justify-content:flex-end;gap:8px">
          <button class="btn btn-outline" (click)="showForm=false">Cancel</button>
          <button class="btn btn-primary" (click)="save()" [disabled]="saving">{{ saving ? 'Saving…' : 'Save' }}</button>
        </div>
      </div>
    </div>
  </div>`,
  styles: [],
})
export class AdminTestimonialsComponent implements OnInit {
  items: any[] = []; showForm=false; editing: any=null; saving=false;
  form: any = this.empty(); pendingFile: File | null = null;
  constructor(public api: ApiService) {}
  empty() { return { name:'', role:'', quote:'', rating:5, order:0, is_active:true }; }
  ngOnInit() { this.load(); }
  load() { this.api.get<any>('homepage/testimonials/').subscribe(r => this.items = Array.isArray(r) ? r : r.results || []); }
  openNew() { this.editing=null; this.form=this.empty(); this.pendingFile=null; this.showForm=true; }
  edit(t: any) { this.editing=t; this.form={...t}; this.pendingFile=null; this.showForm=true; }
  onFile(e: Event) { this.pendingFile = (e.target as HTMLInputElement).files?.[0] || null; }
  save() {
    this.saving=true;
    const fd = new FormData();
    Object.keys(this.form).forEach(k => { if (k === 'photo') return; const v = this.form[k]; if (v !== null && v !== undefined) fd.append(k, typeof v === 'boolean' ? (v ? 'true' : 'false') : String(v)); });
    if (this.pendingFile) fd.append('photo', this.pendingFile);
    const url = this.editing ? `homepage/testimonials/${this.editing.id}/` : 'homepage/testimonials/';
    const req$ = this.editing ? this.api.patchForm(url, fd) : this.api.postForm(url, fd);
    req$.subscribe({ next: () => { this.saving=false; this.showForm=false; this.load(); }, error: () => this.saving=false });
  }
  del(t: any) { if (!confirm(`Delete ${t.name}?`)) return; this.api.delete(`homepage/testimonials/${t.id}/`).subscribe(() => this.load()); }
}
