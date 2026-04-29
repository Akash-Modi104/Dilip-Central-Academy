import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-admin-users',
  template: `
  <div class="page">
    <header class="page-head">
      <h2>Users</h2>
      <button class="btn btn-primary" (click)="openNew()">+ New User</button>
    </header>

    <table class="card" *ngIf="items.length">
      <thead><tr><th>Username</th><th>Name</th><th>Email</th><th>Role</th><th>Active</th><th></th></tr></thead>
      <tbody>
        <tr *ngFor="let u of items">
          <td>{{u.username}}</td>
          <td>{{u.first_name}} {{u.last_name}}</td>
          <td>{{u.email}}</td>
          <td>{{u.role}}</td>
          <td><input type="checkbox" [checked]="u.is_active" (change)="toggleActive(u)"></td>
          <td>
            <button class="btn btn-outline" (click)="resetPwd(u)">Reset PW</button>
            <button class="btn btn-outline" style="margin-left:6px" (click)="del(u)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="modal" *ngIf="showForm">
      <div class="modal-card card">
        <h3>New User</h3>
        <div class="form-row"><label>Username</label><input [(ngModel)]="form.username"></div>
        <div class="form-row"><label>Email</label><input [(ngModel)]="form.email"></div>
        <div class="form-row"><label>First name</label><input [(ngModel)]="form.first_name"></div>
        <div class="form-row"><label>Last name</label><input [(ngModel)]="form.last_name"></div>
        <div class="form-row"><label>Role</label>
          <select [(ngModel)]="form.role">
            <option value="super_admin">Super Admin</option>
            <option value="staff">Staff</option>
            <option value="teacher">Teacher</option>
          </select>
        </div>
        <div class="form-row"><label>Password</label><input type="password" [(ngModel)]="form.password"></div>
        <div style="display:flex;justify-content:flex-end;gap:8px">
          <button class="btn btn-outline" (click)="showForm=false">Cancel</button>
          <button class="btn btn-primary" (click)="save()" [disabled]="saving">{{ saving ? 'Saving…' : 'Create' }}</button>
        </div>
      </div>
    </div>
  </div>`,
  styles: [],
})
export class AdminUsersComponent implements OnInit {
  items: any[] = []; showForm=false; saving=false;
  form: any = this.empty();
  constructor(private api: ApiService) {}
  empty() { return { username:'', email:'', first_name:'', last_name:'', role:'staff', password:'', is_active:true }; }
  ngOnInit() { this.load(); }
  load() { this.api.get<any>('users/').subscribe(r => this.items = Array.isArray(r) ? r : r.results || []); }
  openNew() { this.form=this.empty(); this.showForm=true; }
  save() {
    this.saving = true;
    this.api.post('users/', this.form).subscribe({
      next: () => { this.saving=false; this.showForm=false; this.load(); },
      error: () => this.saving=false,
    });
  }
  toggleActive(u: any) { this.api.patch(`users/${u.id}/`, { is_active: !u.is_active }).subscribe(() => u.is_active = !u.is_active); }
  resetPwd(u: any) {
    const pw = prompt(`New password for ${u.username}:`); if (!pw) return;
    this.api.post(`users/${u.id}/reset_password/`, { password: pw }).subscribe(() => alert('Password reset.'));
  }
  del(u: any) {
    if (!confirm(`Delete user "${u.username}"?`)) return;
    this.api.delete(`users/${u.id}/`).subscribe(() => this.load());
  }
}
