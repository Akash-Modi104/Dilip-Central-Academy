import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/api.service';

interface Inquiry {
  id: number;
  student_name: string;
  grade_applying: string;
  parent_name: string;
  phone: string;
  email: string;
  message: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  created_at: string;
}

@Component({
  selector: 'app-admin-admissions',
  templateUrl: './admissions.component.html',
  styleUrls: ['./admissions.component.scss'],
})
export class AdmissionsComponent implements OnInit {
  inquiries: Inquiry[] = [];
  loading = true;
  filterStatus = '';
  selectedInquiry: Inquiry | null = null;

  statuses: Inquiry['status'][] = ['pending', 'reviewed', 'accepted', 'rejected'];

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    const query = this.filterStatus ? `admissions/inquiries/?status=${this.filterStatus}` : 'admissions/inquiries/';
    this.api.get<{ results: Inquiry[] } | Inquiry[]>(query).subscribe({
      next: res => { this.inquiries = Array.isArray(res) ? res : (res as any).results || []; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  updateStatus(inquiry: Inquiry, status: Inquiry['status']): void {
    this.api.patch(`admissions/inquiries/${inquiry.id}/`, { status }).subscribe({
      next: (updated: any) => {
        inquiry.status = updated.status;
        if (this.selectedInquiry?.id === inquiry.id) this.selectedInquiry = { ...inquiry };
      },
      error: () => {},
    });
  }

  statusClass(s: string): string {
    const map: Record<string, string> = { pending: 'yellow', reviewed: 'blue', accepted: 'green', rejected: 'red' };
    return map[s] || '';
  }
}
