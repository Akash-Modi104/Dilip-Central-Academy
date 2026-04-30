import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ApiService } from '../../core/api.service';

interface InquiryForm {
  student_name: string;
  grade_applying: string;
  parent_name: string;
  phone: string;
  email: string;
  message: string;
}

interface Step { id: number; title: string; description: string; icon: string; order: number; is_active: boolean; }
interface Fee { id: number; label: string; amount: string; note: string; order: number; }
interface ImportantDate { id: number; label: string; date_text: string; order: number; is_active: boolean; }

@Component({
  selector: 'app-admissions',
  templateUrl: './admissions.component.html',
  styleUrls: ['./admissions.component.scss'],
})
export class AdmissionsComponent implements OnInit {
  model: InquiryForm = { student_name: '', grade_applying: '', parent_name: '', phone: '', email: '', message: '' };
  submitting = false;
  submitted = false;
  error = '';

  grades = ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];

  defaultSteps: Step[] = [
    { id: 0, title: 'Fill Inquiry Form', description: 'Complete the online inquiry form with your details.', icon: '📝', order: 0, is_active: true },
    { id: 0, title: 'Document Submission', description: 'Submit required documents (birth certificate, previous marksheets).', icon: '📂', order: 1, is_active: true },
    { id: 0, title: 'Entrance Assessment', description: 'Attend the scheduled entrance test/interview.', icon: '✏️', order: 2, is_active: true },
    { id: 0, title: 'Admission Confirmation', description: 'Receive admission confirmation and pay fees.', icon: '🎉', order: 3, is_active: true },
  ];

  steps: Step[] = this.defaultSteps;
  fees: Fee[] = [];
  importantDates: ImportantDate[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.get<{ results: Step[] } | Step[]>('admissions/steps/').subscribe({
      next: r => {
        const list = (Array.isArray(r) ? r : (r as any).results || []) as Step[];
        const active = list.filter(s => s.is_active !== false).sort((a, b) => a.order - b.order);
        if (active.length) this.steps = active;
      },
      error: () => {},
    });

    this.api.get<{ results: Fee[] } | Fee[]>('admissions/fees/').subscribe({
      next: r => {
        const list = (Array.isArray(r) ? r : (r as any).results || []) as Fee[];
        this.fees = list.sort((a, b) => a.order - b.order);
      },
      error: () => {},
    });

    this.api.get<{ results: ImportantDate[] } | ImportantDate[]>('admissions/dates/').subscribe({
      next: r => {
        const list = (Array.isArray(r) ? r : (r as any).results || []) as ImportantDate[];
        this.importantDates = list.filter(d => d.is_active !== false).sort((a, b) => a.order - b.order);
      },
      error: () => {},
    });
  }

  stepNum(i: number): string {
    return String(i + 1).padStart(2, '0');
  }

  submit(form: NgForm): void {
    if (form.invalid) return;
    this.submitting = true;
    this.error = '';
    this.api.post('admissions/inquiries/', this.model).subscribe({
      next: () => { this.submitted = true; this.submitting = false; },
      error: err => {
        const fieldErrors = err?.error;
        if (fieldErrors && typeof fieldErrors === 'object') {
          this.error = Object.entries(fieldErrors)
            .map(([k, v]) => `${k}: ${(Array.isArray(v) ? v.join(', ') : v)}`).join('  ');
        } else {
          this.error = 'Submission failed. Please try again or contact us directly.';
        }
        this.submitting = false;
      },
    });
  }
}
