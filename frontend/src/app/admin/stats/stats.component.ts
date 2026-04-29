import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-admin-stats',
  template: `
  <div class="page">
    <header class="page-head"><h2>Stats Bar</h2>
      <button class="btn btn-primary" (click)="add()">+ Add Stat</button>
    </header>
    <table class="card" *ngIf="items.length">
      <thead><tr><th>#</th><th>Label</th><th>Value</th><th>Icon</th><th>Active</th><th></th></tr></thead>
      <tbody>
        <tr *ngFor="let s of items; let i=index">
          <td><input type="number" [(ngModel)]="s.order" style="width:60px"></td>
          <td><input [(ngModel)]="s.label"></td>
          <td><input [(ngModel)]="s.value" placeholder="1,200"></td>
          <td><input [(ngModel)]="s.icon" placeholder="optional"></td>
          <td><input type="checkbox" [(ngModel)]="s.is_active"></td>
          <td>
            <button class="btn btn-outline" (click)="save(s)">Save</button>
            <button class="btn btn-outline" style="margin-left:6px" (click)="del(s)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p *ngIf="!items.length" class="muted">No stats yet.</p>
  </div>`,
  styles: [],
})
export class AdminStatsComponent implements OnInit {
  items: any[] = [];
  constructor(private api: ApiService) {}
  ngOnInit() { this.load(); }
  load() { this.api.get<any>('homepage/stats/').subscribe(r => this.items = (Array.isArray(r) ? r : r.results || [])); }
  add() { this.api.post<any>('homepage/stats/', { label:'New stat', value:'0', order:this.items.length, is_active:true }).subscribe(s => this.items.push(s)); }
  save(s: any) { this.api.patch(`homepage/stats/${s.id}/`, s).subscribe(); }
  del(s: any) { if (!confirm('Delete?')) return; this.api.delete(`homepage/stats/${s.id}/`).subscribe(() => this.items = this.items.filter(x => x.id !== s.id)); }
}
