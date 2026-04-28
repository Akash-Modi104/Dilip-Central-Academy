import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  base = environment.apiBase;
  mediaBase = environment.mediaBase;

  constructor(private http: HttpClient) {}

  get<T>(path: string): Observable<T> { return this.http.get<T>(`${this.base}/${path}`); }
  post<T>(path: string, body: any): Observable<T> { return this.http.post<T>(`${this.base}/${path}`, body); }
  put<T>(path: string, body: any): Observable<T> { return this.http.put<T>(`${this.base}/${path}`, body); }
  patch<T>(path: string, body: any): Observable<T> { return this.http.patch<T>(`${this.base}/${path}`, body); }
  delete<T>(path: string): Observable<T> { return this.http.delete<T>(`${this.base}/${path}`); }

  postForm<T>(path: string, formData: FormData): Observable<T> {
    return this.http.post<T>(`${this.base}/${path}`, formData);
  }
  patchForm<T>(path: string, formData: FormData): Observable<T> {
    return this.http.patch<T>(`${this.base}/${path}`, formData);
  }

  mediaUrl(path: string | null | undefined): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${this.mediaBase}${path}`;
  }
}
