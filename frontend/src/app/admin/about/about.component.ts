import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-admin-about',
  template: `
  <div class="page">
    <h2>About Page Content</h2>

    <section class="card" *ngIf="about" style="margin-bottom:1rem">
      <h3>History / Mission / Vision</h3>
      <div class="form-row"><label>History (HTML allowed)</label><textarea rows="5" [(ngModel)]="about.history"></textarea></div>
      <div class="form-row"><label>Mission (HTML allowed)</label><textarea rows="4" [(ngModel)]="about.mission"></textarea></div>
      <div class="form-row"><label>Vision (HTML allowed)</label><textarea rows="4" [(ngModel)]="about.vision"></textarea></div>
      <div style="text-align:right"><button class="btn btn-primary" (click)="saveAbout()">Save About</button></div>
    </section>

    <section class="card" *ngIf="principal" style="margin-bottom:1rem">
      <h3>Principal's Message</h3>
      <div class="form-row"><label>Name</label><input [(ngModel)]="principal.name"></div>
      <div class="form-row"><label>Designation</label><input [(ngModel)]="principal.designation"></div>
      <div class="form-row"><label>Photo</label>
        <input type="file" (change)="onPhoto($event)">
        <img *ngIf="principal.photo" [src]="api.mediaUrl(principal.photo)" style="max-height:120px;margin-top:8px;border-radius:6px">
      </div>
      <div class="form-row"><label>Message (HTML allowed)</label><textarea rows="6" [(ngModel)]="principal.message"></textarea></div>
      <div style="text-align:right"><button class="btn btn-primary" (click)="savePrincipal()">Save Principal Message</button></div>
    </section>

    <section class="card">
      <h3>Core Values</h3>
      <table style="width:100%">
        <thead><tr><th>#</th><th>Title</th><th>Description</th><th>Icon</th><th></th></tr></thead>
        <tbody>
          <tr *ngFor="let v of values">
            <td><input type="number" [(ngModel)]="v.order" style="width:60px"></td>
            <td><input [(ngModel)]="v.title"></td>
            <td><input [(ngModel)]="v.description"></td>
            <td><input [(ngModel)]="v.icon"></td>
            <td>
              <button class="btn btn-outline" (click)="saveValue(v)">Save</button>
              <button class="btn btn-outline" style="margin-left:6px" (click)="delValue(v)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
      <button class="btn btn-primary" style="margin-top:.5rem" (click)="addValue()">+ Add Core Value</button>
    </section>
  </div>`,
  styles: [],
})
export class AdminAboutComponent implements OnInit {
  about: any = null; principal: any = null; values: any[] = []; pendingPhoto: File | null = null;
  constructor(public api: ApiService) {}
  ngOnInit() {
    this.api.get('faculty/about/').subscribe(a => this.about = a);
    this.api.get('faculty/principal-message/').subscribe(p => this.principal = p);
    this.api.get<any>('faculty/core-values/').subscribe(r => this.values = Array.isArray(r) ? r : r.results || []);
  }
  saveAbout() { this.api.patch('faculty/about/', this.about).subscribe(a => { this.about = a; alert('Saved.'); }); }
  onPhoto(e: Event) { this.pendingPhoto = (e.target as HTMLInputElement).files?.[0] || null; }
  savePrincipal() {
    const fd = new FormData();
    Object.keys(this.principal).forEach(k => { if (k === 'photo') return; const v = this.principal[k]; if (v !== null && v !== undefined) fd.append(k, String(v)); });
    if (this.pendingPhoto) fd.append('photo', this.pendingPhoto);
    this.api.patchForm('faculty/principal-message/', fd).subscribe(p => { this.principal = p; this.pendingPhoto = null; alert('Saved.'); });
  }
  addValue() { this.api.post<any>('faculty/core-values/', { title:'New value', description:'', icon:'', order:this.values.length }).subscribe(v => this.values.push(v)); }
  saveValue(v: any) { this.api.patch(`faculty/core-values/${v.id}/`, v).subscribe(); }
  delValue(v: any) { if (!confirm('Delete?')) return; this.api.delete(`faculty/core-values/${v.id}/`).subscribe(() => this.values = this.values.filter(x => x.id !== v.id)); }
}
