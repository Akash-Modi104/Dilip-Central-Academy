import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { ThemeService, SiteSettings } from '../../core/theme.service';

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent implements OnInit {
  settings: SiteSettings | null = null;
  model: ContactForm = { name: '', email: '', phone: '', subject: '', message: '' };
  submitting = false;
  submitted = false;
  error = '';

  constructor(private api: ApiService, public theme: ThemeService) {}

  ngOnInit(): void {
    this.settings = this.theme.settings;
  }

  submit(form: NgForm): void {
    if (form.invalid) return;
    this.submitting = true;
    this.error = '';
    this.api.post('contact/messages/', this.model).subscribe({
      next: () => { this.submitted = true; this.submitting = false; },
      error: () => { this.error = 'Failed to send your message. Please try emailing us directly.'; this.submitting = false; },
    });
  }
}
