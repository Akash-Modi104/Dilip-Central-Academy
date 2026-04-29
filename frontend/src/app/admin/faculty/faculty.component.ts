import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-admin-faculty',
  template: `
  <div class="page">
    <header class="page-head"><h2>Faculty</h2>
      <button class="btn btn-primary" (click)="openNew()">+ New Profile</button></header>
    <div class="grid">
      <div *ngFor="let f of items" class="card">
        <div style="display:flex;gap:1rem">
          <img *ngIf="f.photo" [src]="api.mediaUrl(f.photo)" style="width:80px;height:80px;border-radius:50%;object-fit:cover">
          <div style="flex:1">
            <strong>{{f.name}}</strong>
            <div class="muted" style="font-size:.85rem">{{f.designation}} · {{f.subject}}</div>
            <p style="margin:.25rem 0;font-size:.9rem">{{f.bio}}</p>
            <div class="muted" style="font-size:.8rem">order: {{f.order}} · {{f.is_active?'active':'inactive'}}<span *ngIf="f.is_highlighted"> · highlighted</span></div>
          </div>
        </div>
        <div style="margin-top:.5rem;text-align:right">
          <button class="btn btn-outline" (click)="edit(f)">Edit</button>
          <button class="btn btn-outline" style="margin-left:6px" (click)="del(f)">Delete</button>
        </div>
      </div>
    </div>
    <p *ngIf="!items.length" class="muted">No faculty profiles yet.</p>

    <div class="modal" *ngIf="showForm">
      <div class="modal-card card">
        <h3>{{ editing ? 'Edit' : 'New' }} Faculty</h3>
        <div class="form-row"><label>Name</label><input [(ngModel)]="form.name"></div>
        <div class="form-row"><label>Designation</label><input [(ngModel)]="form.designation"></div>
        <div class="form-row"><label>Subject</label><input [(ngModel)]="form.subject"></div>
        <div class="form-row"><label>Email</label><input [(ngModel)]="form.email"></div>
        <div class="form-row"><label>Bio</label><textarea rows="4" [(ngModel)]="form.bio"></textarea></div>
        <div class="form-row"><label>Order</label><input type="number" [(ngModel)]="form.order"></div>
        <div class="form-row"><label>Photo</label><input type="file" (change)="onFile($event)"></div>
        <div class="form-row"><label><input type="checkbox" [(ngModel)]="form.is_highlighted"> Show on About page</label></div>
        <div class="form-row"><label><input type="checkbox" [(ngModel)]="form.is_active"> Active</label></div>
        <div style="display:flex;justify-content:flex-end;gap:8px">
          <button class="btn btn-outline" (click)="showForm=false">Cancel</button>
          <button class="btn btn-primary" (click)="save()" [disabled]="saving">{{ saving?'Saving…':'Save' }}</button>
        </div>
      </div>
    </div>
  </div>`,
  styles: [],
})
export class AdminFacultyComponent implements OnInit {
  items: any[] = []; showForm=false; editing: any=null; saving=false;
  form: any = this.empty(); pendingFile: File | null = null;
  constructor(public api: ApiService) {}
  empty() { return { name:'', designation:'', subject:'', email:'', bio:'', order:0, is_highlighted:false, is_active:true }; }
  ngOnInit() { this.load(); }
  load() { this.api.get<any>('faculty/profiles/').subscribe(r => this.items = Array.isArray(r) ? r : r.results || []); }
  openNew() { this.editing=null; this.form=this.empty(); this.pendingFile=null; this.showForm=true; }
  edit(f: any) { this.editing=f; this.form={...f}; this.pendingFile=null; this.showForm=true; }
  onFile(e: Event) { this.pendingFile = (e.target as HTMLInputElement).files?.[0] || null; }
  save() {
    this.saving=true;
    const fd = new FormData();
    Object.keys(this.form).forEach(k => { if (k === 'photo') return; const v = this.form[k]; if (v !== null && v !== undefined) fd.append(k, typeof v === 'boolean' ? (v ? 'true' : 'false') : String(v)); });
    if (this.pendingFile) fd.append('photo', this.pendingFile);
    const req$ = this.editing
      ? this.api.patchForm(`faculty/profiles/${this.editing.id}/`, fd)
      : this.api.postForm('faculty/profiles/', fd);
    req$.subscribe({ next: () => { this.saving=false; this.showForm=false; this.load(); }, error: () => this.saving=false });
  }
  del(f: any) { if (!confirm(`Delete ${f.name}?`)) return; this.api.delete(`faculty/profiles/${f.id}/`).subscribe(() => this.load()); }
}
