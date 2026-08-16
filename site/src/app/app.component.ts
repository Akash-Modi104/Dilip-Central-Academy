import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

type Notice = { date: string; title: string; detail: string };
type GalleryItem = { title: string; image: string };
type InfoCard = { title: string; detail: string };
type Content = {
  schoolName: string; tagline: string; since: string; heroTitle: string; heroText: string;
  phone: string; email: string; address: string; mapLink: string; notice: string;
  aboutTitle: string; aboutText: string; principalMessage: string; notices: Notice[]; gallery: GalleryItem[];
  logo: string; learningTitle: string; facilities: InfoCard[]; admissionsTitle: string; admissionsText: string;
  admissionSteps: InfoCard[]; admissionDocuments: string[]; resourcesTitle: string; resources: InfoCard[];
};

const defaults: Content = {
  schoolName: 'Dilip Central Academy', tagline: 'Light of Knowledge', since: 'Nurturing Students Since 2006',
  heroTitle: 'Caring young minds toward Excellence',
  heroText: 'We believe & Spread Quality Education',
  phone: '7352164288, 7782994099, 9955328635, 7903970825', email: 'dilipcentralacademy100@gmail.com',
  address: 'Mandu, Ramgarh, Jharkhand', mapLink: 'https://maps.app.goo.gl/6zgQWxNckKgL4XKb8',
  notice: 'Admissions are open. Contact the school office for eligibility and required documents.',
  aboutTitle: 'Opportunities for students to grow their talents',
  aboutText: 'We provide a platform to expose students’ interests by conducting Quiz, Seminars, Debates, Sports, Exhibitions, Speeches and Dramas—a compact basic package for all-round development.',
  principalMessage: 'Let’s lit the lamp of education, be educated and tune yourself to a Smart Career.',
  logo: 'assets/dca-logo.png', learningTitle: 'Learning with purpose. Growing with confidence.',
  facilities: [
    { title: 'Student-centred learning', detail: 'Individual attention and regular effort are part of the teaching environment.' },
    { title: 'Beyond academics', detail: 'Quiz, seminars, debates, sports, exhibitions, speeches and dramas.' },
    { title: 'Values & discipline', detail: 'Attendance, neat uniform, responsibility and serious study within the school campus.' }
  ],
  admissionsTitle: 'Eligibility for Admissions', admissionsText: 'Children seeking admission to Nursery and LKG should meet the age eligibility as on 1st April. Admission is based on the school process and verification of documents.',
  admissionSteps: [
    { title: 'Enquire', detail: 'Contact the school office for class availability and current eligibility.' },
    { title: 'Visit the campus', detail: 'Meet the school team and collect the admission form.' },
    { title: 'Submit documents', detail: 'Complete the form with verified documents and photographs.' }
  ],
  admissionDocuments: ['Birth certificate', 'Child’s Aadhaar card', 'Parent / guardian Aadhaar', 'Address proof', 'Mobile number', 'Recent photograph'],
  resourcesTitle: 'Opportunities for students to grow their talents',
  resources: [
    { title: 'Quiz & Seminars', detail: 'Opportunities to build knowledge, confidence and communication.' },
    { title: 'Sports & Yoga', detail: 'Activities supporting discipline, teamwork and wellbeing.' },
    { title: 'Drama & Singing', detail: 'Creative programmes that help students express their talents.' },
    { title: 'Exhibitions', detail: 'Hands-on learning and presentation of student work.' }
  ],
  notices: [
    { date: 'Admissions', title: 'Admission enquiries open', detail: 'Contact the school office for class availability and current eligibility.' },
    { date: 'Uniform', title: 'Wednesday & Saturday', detail: 'White uniform with house T-shirt (all white) is mandatory.' }
  ],
  gallery: [
    { title: 'Recognition', image: 'assets/prospectus-10.jpeg' }, { title: 'School Drama', image: 'assets/prospectus-13.jpeg' },
    { title: 'School Function & Rangoli', image: 'assets/prospectus-12.jpeg' }, { title: 'Excursion & Champions', image: 'assets/prospectus-9.jpeg' }
  ],
};

@Component({
  selector: 'app-root', standalone: true, imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html', styleUrl: './app.component.css'
})
export class AppComponent {
  private key = 'dca-site-content-v1';
  private apiBase = String((window as unknown as { DCA_API_URL?: string }).DCA_API_URL || '').replace(/\/$/, '');
  private token = sessionStorage.getItem('dca-api-token') || '';
  content = signal<Content>(this.load());
  draft: Content = structuredClone(this.content());
  adminOpen = signal(false); menuOpen = signal(false); saved = signal(false);
  isAdmin = signal(sessionStorage.getItem('dca-admin-session') === 'active' || !!sessionStorage.getItem('dca-api-token'));
  login = { username: '', password: '' }; loginError = signal('');
  mapUrl: SafeResourceUrl;
  enquiry = { parent: '', child: '', className: '', phone: '' };
  constructor(private sanitizer: DomSanitizer) { this.mapUrl = this.makeMapUrl(); void this.loadRemote(); }
  private async loadRemote(): Promise<void> { if (!this.apiBase) return; try { const response = await fetch(`${this.apiBase}/api/content/`); if (!response.ok) return; const result = await response.json() as { data?: Partial<Content> }; if (result.data && Object.keys(result.data).length) { const next = { ...defaults, ...result.data }; this.content.set(next); this.draft = structuredClone(next); } } catch { /* remain usable offline */ } }
  private load(): Content { try { return { ...defaults, ...JSON.parse(localStorage.getItem(this.key) || '{}') }; } catch { return defaults; } }
  private makeMapUrl(): SafeResourceUrl { return this.sanitizer.bypassSecurityTrustResourceUrl('https://www.google.com/maps?q=23.8025032,85.465326&z=16&output=embed'); }
  openAdmin(): void { this.draft = structuredClone(this.content()); this.adminOpen.set(true); document.body.classList.add('modal-open'); }
  closeAdmin(): void { this.adminOpen.set(false); document.body.classList.remove('modal-open'); }
  async save(): Promise<void> { if (this.apiBase) { const response = await fetch(`${this.apiBase}/api/content/`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.token}` }, body: JSON.stringify({ data: this.draft }) }); if (!response.ok) { alert('Could not save to the server. Please sign in again.'); return; } } this.content.set(structuredClone(this.draft)); localStorage.setItem(this.key, JSON.stringify(this.draft)); this.saved.set(true); setTimeout(() => this.saved.set(false), 1800); }
  reset(): void { if (confirm('Reset all editable content to the original school information?')) { this.draft = structuredClone(defaults); this.save(); } }
  exportData(): void { const blob = new Blob([JSON.stringify(this.content(), null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'dca-site-backup.json'; a.click(); URL.revokeObjectURL(a.href); }
  importData(event: Event): void { const input = event.target as HTMLInputElement; const file = input.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { try { this.draft = { ...defaults, ...JSON.parse(String(reader.result)) }; this.save(); } catch { alert('That backup file is not valid.'); } }; reader.readAsText(file); }
  scroll(id: string): void { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); this.menuOpen.set(false); }
  sendEnquiry(): void { const phone = this.content().phone.replace(/\D/g, '').slice(0, 10); const message = `Admission enquiry\nParent: ${this.enquiry.parent}\nChild: ${this.enquiry.child}\nClass: ${this.enquiry.className}\nPhone: ${this.enquiry.phone}`; window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener'); }
  async signIn(): Promise<void> { if (this.apiBase) { try { const response = await fetch(`${this.apiBase}/api/login/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(this.login) }); if (!response.ok) throw new Error(); const result = await response.json() as { token: string }; this.token = result.token; sessionStorage.setItem('dca-api-token', this.token); this.isAdmin.set(true); this.loginError.set(''); return; } catch { this.loginError.set('Incorrect username or password.'); return; } } if (this.login.username === 'admin' && this.login.password === 'DCA@2026!') { this.isAdmin.set(true); this.loginError.set(''); sessionStorage.setItem('dca-admin-session', 'active'); this.login = { username: '', password: '' }; } else { this.loginError.set('Incorrect username or password.'); } }
  signOut(): void { sessionStorage.removeItem('dca-admin-session'); sessionStorage.removeItem('dca-api-token'); this.token=''; this.isAdmin.set(false); this.closeAdmin(); }
  async uploadGallery(event: Event): Promise<void> { const file=(event.target as HTMLInputElement).files?.[0]; if (!file) return; if (!this.apiBase) { alert('Configure the Django API URL before uploading images. You can still paste an image URL below.'); return; } const form=new FormData(); form.append('image',file); form.append('title',file.name.replace(/\.[^.]+$/,'')); const response=await fetch(`${this.apiBase}/api/gallery/upload/`,{method:'POST',headers:{Authorization:`Bearer ${this.token}`},body:form}); if(!response.ok){alert('Upload failed. Please sign in again.');return;} const item=await response.json() as GalleryItem; this.draft.gallery.push(item); }
}
