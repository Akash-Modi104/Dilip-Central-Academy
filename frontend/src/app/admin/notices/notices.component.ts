import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-admin-notices',
  template: `
  <div class="page">
    <header class="page-head"><h2>Notice Board</h2>
      <button class="btn btn-primary" (click)="openNew()">+ New Notice</button>
    </header>
    <div *ngFor="let n of items" class="card" style="margin-bottom:.75rem">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:1rem">
        <div>
          <strong>{{n.title}}</strong>
          <span *ngIf="n.is_expired" class="muted" style="margin-left:8px">[expired]</span>
          <span *ngIf="!n.is_active" class="muted" style="margin-left:8px">[inactive]</span>
          <p style="margin:.25rem 0">{{n.body}}</p>
          <div class="muted" style="font-size:.85rem">posted {{n.posted_at | date:'medium'}} · expires {{ n.expires_at ? (n.expires_at | date:'medium') : '—' }}</div>
        </div>
        <div>
          <button class="btn btn-outline" (click)="edit(n)">Edit</button>
          <button class="btn btn-outline" style="margin-left:6px" (click)="del(n)">Delete</button>
        </div>
      </div>
    </div>
    <p *ngIf="!items.length" class="muted">No notices yet.</p>

    <div class="modal" *ngIf="showForm">
      <div class="modal-card card">
        <h3>{{ editing ? 'Edit' : 'New' }} Notice</h3>
        <div class="form-row"><label>Title</label><input [(ngModel)]="form.title"></div>
        <div class="form-row"><label>Body</label><textarea rows="5" [(ngModel)]="form.body"></textarea></div>
        <div class="form-row"><label>Expires at (optional)</label>
          <input type="datetime-local" [(ngModel)]="form.expires_at"></div>
        <div class="form-row"><label><input type="checkbox" [(ngModel)]="form.is_active"> Active</label></div>
        <div style="display:flex;justify-content:flex-end;gap:8px">
          <button class="btn btn-outline" (click)="showForm=false">Cancel</button>
          <button class="btn btn-primary" (click)="save()" [disabled]="saving">{{ saving ? 'Saving…' : 'Save' }}</button>
        </div>
      </div>
    </div>
  </div>`,
  styles: [`.page{padding:1rem} .page-head{display:flex;justify-content:space-between;margin-bottom:1rem}
  .modal{position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:1000}
  .modal-card{width:min(560px,92vw);max-height:90vh;overflow:auto}`],
})
export class AdminNoticesComponent implements OnInit {
  items: any[] = []; showForm=false; editing: any=null; saving=false;
  form: any = this.empty();
  constructor(private api: ApiService) {}
  empty() { return { title:'', body:'', expires_at:null, is_active:true }; }
  ngOnInit() { this.load(); }
  load() { this.api.get<any>('news/notices/').subscribe(r => this.items = Array.isArray(r) ? r : r.results || []); }
  openNew() { this.editing=null; this.form=this.empty(); this.showForm=true; }
  edit(n: any) { this.editing=n; this.form={...n}; this.showForm=true; }
  save() {
    this.saving = true;
    const payload = { ...this.form, expires_at: this.form.expires_at || null };
    const req$ = this.editing
      ? this.api.patch(`news/notices/${this.editing.id}/`, payload)
      : this.api.post('news/notices/', payload);
    req$.subscribe({ next: () => { this.saving=false; this.showForm=false; this.load(); }, error: () => this.saving=false });
  }
  del(n: any) { if (!confirm(`Delete "${n.title}"?`)) return; this.api.delete(`news/notices/${n.id}/`).subscribe(() => this.load()); }
}
