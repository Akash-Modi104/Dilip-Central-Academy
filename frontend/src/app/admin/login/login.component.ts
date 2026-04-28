import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  credentials = { username: '', password: '' };
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  submit(form: NgForm): void {
    if (form.invalid) return;
    this.loading = true;
    this.error = '';
    this.auth.login(this.credentials.username, this.credentials.password).subscribe({
      next: user => {
        this.loading = false;
        if (user) {
          this.router.navigate(['/admin']);
        } else {
          this.error = 'Invalid username or password.';
        }
      },
      error: () => { this.loading = false; this.error = 'Login failed. Please try again.'; },
    });
  }
}
