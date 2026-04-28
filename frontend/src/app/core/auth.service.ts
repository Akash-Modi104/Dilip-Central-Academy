import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'super_admin' | 'teacher' | 'staff';
  first_name?: string;
  last_name?: string;
  avatar?: string | null;
}

interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

const ACCESS_KEY = 'dca_access';
const REFRESH_KEY = 'dca_refresh';
const USER_KEY = 'dca_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(this.loadUser());
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<User | null> {
    return this.http.post<LoginResponse>(`${environment.apiBase}/auth/login/`, { username, password }).pipe(
      tap(res => {
        localStorage.setItem(ACCESS_KEY, res.access);
        localStorage.setItem(REFRESH_KEY, res.refresh);
        localStorage.setItem(USER_KEY, JSON.stringify(res.user));
        this.userSubject.next(res.user);
      }),
      tap(() => {}),
      catchError(err => { console.error('login failed', err); return of(null); }),
      tap(res => res ? null : null),
    ) as any;
  }

  logout(): void {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    this.userSubject.next(null);
  }

  get accessToken(): string | null { return localStorage.getItem(ACCESS_KEY); }
  get refreshToken(): string | null { return localStorage.getItem(REFRESH_KEY); }
  get currentUser(): User | null { return this.userSubject.value; }
  get isAuthenticated(): boolean { return !!this.accessToken; }
  hasRole(...roles: User['role'][]): boolean {
    const u = this.currentUser;
    return !!u && roles.includes(u.role);
  }

  private loadUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) as User : null;
    } catch { return null; }
  }
}
