import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService, User } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!this.auth.isAuthenticated) {
      this.router.navigate(['/admin/login']);
      return false;
    }
    const allowed = route.data && (route.data['roles'] as User['role'][] | undefined);
    if (allowed && allowed.length && !this.auth.hasRole(...allowed)) {
      this.router.navigate(['/admin']);
      return false;
    }
    return true;
  }
}
