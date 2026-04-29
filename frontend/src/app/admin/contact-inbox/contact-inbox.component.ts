import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-admin-contact-inbox',
  template: `
  <div class="page">
    <h2>Contact Inbox</h2>
    <p class="muted">Messages submitted via the public contact form.</p>
    <div *ngFor="let m of items" class="card" style="margin-bottom:.5rem"
         [style.background]="m.is_read ? '#fafafa' : '#fff'">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:1rem">
        <div>
          <strong>{{m.name}}</strong> &lt;{{m.email}}&gt;
          <span class="muted" style="margin-left:6px" *ngIf="m.phone">· {{m.phone}}</span>
          <div class="muted" style="font-size:.85rem">{{m.submitted_at | date:'medium'}} <span *ngIf="m.subject"> · subject: {{m.subject}}</span></div>
          <p style="margin:.5rem 0 0;white-space:pre-wrap">{{m.message}}</p>
        </div>
        <button *ngIf="!m.is_read" class="btn btn-outline" (click)="markRead(m)">Mark read</button>
        <span *ngIf="m.is_read" class="muted">✓ read</span>
      </div>
    </div>
    <p *ngIf="!items.length" class="muted">No messages yet.</p>
  </div>`,
  styles: [],
})
export class AdminContactInboxComponent implements OnInit {
  items: any[] = [];
  constructor(private api: ApiService) {}
  ngOnInit() { this.load(); }
  load() { this.api.get<any>('contact/submissions/').subscribe(r => this.items = Array.isArray(r) ? r : r.results || []); }
  markRead(m: any) { this.api.post(`contact/submissions/${m.id}/mark_read/`, {}).subscribe(() => m.is_read = true); }
}
