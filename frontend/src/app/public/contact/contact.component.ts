import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
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
  safeMapUrl: SafeResourceUrl | null = null;

  constructor(
    private api: ApiService,
    public theme: ThemeService,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    // Re-fetch in case ThemeService didn't bootstrap yet (e.g. /contact deep link).
    if (this.theme.settings) {
      this.applySettings(this.theme.settings);
    } else {
      this.api.get<SiteSettings>('site/settings/').subscribe(s => this.applySettings(s));
    }
  }

  private applySettings(s: SiteSettings): void {
    this.settings = s;
    if (s.map_embed_url) {
      this.safeMapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(s.map_embed_url);
    }
  }

  submit(form: NgForm): void {
    if (form.invalid) return;
    this.submitting = true;
    this.error = '';
    this.api.post('contact/submissions/', this.model).subscribe({
      next: () => { this.submitted = true; this.submitting = false; },
      error: () => { this.error = 'Failed to send your message. Please try emailing us directly.'; this.submitting = false; },
    });
  }
}
