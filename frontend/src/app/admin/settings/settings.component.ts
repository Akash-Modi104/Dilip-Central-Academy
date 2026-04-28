import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { ThemeService, SiteSettings } from '../../core/theme.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  model: Partial<SiteSettings> = {};
  logoFile: File | null = null;
  faviconFile: File | null = null;
  loading = true;
  saving = false;
  saved = false;
  error = '';

  constructor(private api: ApiService, private theme: ThemeService) {}

  ngOnInit(): void {
    this.api.get<SiteSettings>('site/settings/').subscribe({
      next: s => { this.model = { ...s }; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  onLogoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.logoFile = input.files[0];
  }

  onFaviconChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.faviconFile = input.files[0];
  }

  save(form: NgForm): void {
    if (form.invalid) return;
    this.saving = true;
    this.saved = false;
    this.error = '';

    const fd = new FormData();
    Object.entries(this.model).forEach(([k, v]) => {
      if (v !== null && v !== undefined && k !== 'logo' && k !== 'favicon') {
        fd.append(k, String(v));
      }
    });
    if (this.logoFile) fd.append('logo', this.logoFile);
    if (this.faviconFile) fd.append('favicon', this.faviconFile);

    this.api.patchForm<SiteSettings>('site/settings/', fd).subscribe({
      next: s => {
        this.model = { ...s };
        this.theme.applyTheme(s);
        this.saving = false;
        this.saved = true;
        setTimeout(() => (this.saved = false), 3000);
      },
      error: () => { this.saving = false; this.error = 'Failed to save settings.'; },
    });
  }

  logoUrl(): string { return this.model.logo ? this.api.mediaUrl(this.model.logo) : ''; }
}
