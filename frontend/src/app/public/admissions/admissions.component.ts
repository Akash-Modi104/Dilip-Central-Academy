import { Component } from '@angular/core';
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

@Component({
  selector: 'app-admissions',
  templateUrl: './admissions.component.html',
  styleUrls: ['./admissions.component.scss'],
})
export class AdmissionsComponent {
  model: InquiryForm = { student_name: '', grade_applying: '', parent_name: '', phone: '', email: '', message: '' };
  submitting = false;
  submitted = false;
  error = '';

  grades = ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];

  steps = [
    { num: '01', title: 'Fill Inquiry Form', desc: 'Complete the online inquiry form with your details.' },
    { num: '02', title: 'Document Submission', desc: 'Submit required documents (birth certificate, previous marksheets).' },
    { num: '03', title: 'Entrance Assessment', desc: 'Attend the scheduled entrance test/interview.' },
    { num: '04', title: 'Admission Confirmation', desc: 'Receive admission confirmation and pay fees.' },
  ];

  constructor(private api: ApiService) {}

  submit(form: NgForm): void {
    if (form.invalid) return;
    this.submitting = true;
    this.error = '';
    this.api.post('admissions/inquiries/', this.model).subscribe({
      next: () => { this.submitted = true; this.submitting = false; },
      error: () => { this.error = 'Submission failed. Please try again or contact us directly.'; this.submitting = false; },
    });
  }
}
