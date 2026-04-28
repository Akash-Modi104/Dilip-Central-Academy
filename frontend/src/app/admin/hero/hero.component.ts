import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-admin-hero',
  template: `
  <div class="page">
    <h2>Homepage / Hero</h2>
    <p class="muted">Edit the hero banner shown on the home page, plus toggles for which sections appear.</p>
    <div *ngIf="!hero">Loading…</div>
    <div *ngIf="hero" class="card">
      <div class="form-row"><label>Headline</label><input [(ngModel)]="hero.headline"></div>
      <div class="form-row"><label>Subtext</label><textarea rows="3" [(ngModel)]="hero.subtext"></textarea></div>
      <div class="form-row"><label>Primary CTA label</label><input [(ngModel)]="hero.cta_primary_label"></div>
      <div class="form-row"><label>Primary CTA url</label><input [(ngModel)]="hero.cta_primary_url"></div>
      <div class="form-row"><label>Secondary CTA label</label><input [(ngModel)]="hero.cta_secondary_label"></div>
      <div class="form-row"><label>Secondary CTA url</label><input [(ngModel)]="hero.cta_secondary_url"></div>
      <div class="form-row"><label>Background image</label>
        <input type="file" (change)="onFile($event)">
        <img *ngIf="hero.background_image" [src]="api.mediaUrl(hero.background_image)" style="max-height:120px;margin-top:8px;border-radius:6px">
      </div>
      <fieldset style="border:1px solid var(--color-border);border-radius:6px;padding:.75rem;margin-top:1rem">
        <legend>Section toggles</legend>
        <label><input type="checkbox" [(ngModel)]="hero.show_stats"> Stats bar</label><br>
        <label><input type="checkbox" [(ngModel)]="hero.show_programs"> Featured programs</label><br>
        <label><input type="checkbox" [(ngModel)]="hero.show_testimonials"> Testimonials</label><br>
        <label><input type="checkbox" [(ngModel)]="hero.show_news"> Latest news</label><br>
        <label><input type="checkbox" [(ngModel)]="hero.is_active"> Hero is active</label>
      </fieldset>
      <div style="display:flex;justify-content:flex-end;margin-top:1rem">
        <button class="btn btn-primary" (click)="save()" [disabled]="saving">{{ saving ? 'Saving…' : 'Save' }}</button>
      </div>
      <p *ngIf="msg" class="muted" style="text-align:right;margin-top:.5rem">{{msg}}</p>
    </div>
  </div>`,
  styles: [`.page{padding:1rem;max-width:760px}`],
})
export class AdminHeroComponent implements OnInit {
  hero: any = null; saving=false; msg=''; pendingFile: File | null = null;
  constructor(public api: ApiService) {}
  ngOnInit() { this.api.get('homepage/hero/').subscribe(h => this.hero = h); }
  onFile(ev: Event) { const f = (ev.target as HTMLInputElement).files?.[0]; if (f) this.pendingFile = f; }
  save() {
    this.saving = true;
    const fd = new FormData();
    Object.keys(this.hero).forEach(k => {
      if (k === 'background_image') return;
      const v = this.hero[k];
      if (v === null || v === undefined) return;
      fd.append(k, typeof v === 'boolean' ? (v ? 'true' : 'false') : String(v));
    });
    if (this.pendingFile) fd.append('background_image', this.pendingFile);
    this.api.patchForm('homepage/hero/', fd).subscribe({
      next: (h: any) => { this.hero = h; this.saving=false; this.msg='Saved.'; this.pendingFile=null; },
      error: () => { this.saving=false; this.msg='Save failed.'; },
    });
  }
}
