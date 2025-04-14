// src/app/services/auth.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { User } from '../models/user';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth-response';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl + '/api/auth';
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private tokenSubject: BehaviorSubject<string | null>;
  public token: Observable<string | null>;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    const isBrowser = isPlatformBrowser(this.platformId);
    this.currentUserSubject = new BehaviorSubject<User | null>(
      isBrowser ? JSON.parse(localStorage.getItem('currentUser') || 'null') : null
    );
    this.currentUser = this.currentUserSubject.asObservable();

    this.tokenSubject = new BehaviorSubject<string | null>(
      isBrowser ? localStorage.getItem('token') : null
    );
    this.token = this.tokenSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get tokenValue(): string | null {
    return this.tokenSubject.value;
  }

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  register(registerData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register/`, registerData)
      .pipe(
        tap(response => {
          if (this.isBrowser && response && response.token) {
            localStorage.setItem('currentUser', JSON.stringify(response.user));
            localStorage.setItem('token', response.token);
            this.currentUserSubject.next(response.user || null);
            this.tokenSubject.next(response.token);
          }
        }),
        catchError(error => {
          console.error('Registration failed:', error);
          return throwError(() => error);
        })
      );
  }

  login(loginData: LoginRequest): Observable<AuthResponse> {
    // Add headers if not set globally
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
  
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/login/`, 
      loginData,
      { headers }
    ).pipe(
      tap(response => {
        if (this.isBrowser && response?.token) {
          const user: User = {
            id: response.user_id,
            username: response.username || '',
            email: response.email || ''
          };
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('token', response.token);
          this.currentUserSubject.next(user);
          this.tokenSubject.next(response.token);
        }
      }),
      catchError(error => {
        // Enhanced error logging
        console.error('Login error details:', {
          status: error.status,
          message: error.message,
          error: error.error,  // This often contains server validation messages
          url: error.url
        });
        return throwError(() => error);
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/logout/`, {}, {
      headers: new HttpHeaders({
        'Authorization': `Token ${this.tokenValue}`
      })
    }).pipe(
      tap(() => {
        if (this.isBrowser) {
          localStorage.removeItem('currentUser');
          localStorage.removeItem('token');
        }
        this.currentUserSubject.next(null);
        this.tokenSubject.next(null);
      }),
      catchError(error => {
        if (this.isBrowser) {
          localStorage.removeItem('currentUser');
          localStorage.removeItem('token');
        }
        this.currentUserSubject.next(null);
        this.tokenSubject.next(null);
        return throwError(() => error);
      })
    );
  }

  getUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/user/`, {
      headers: new HttpHeaders({
        'Authorization': `Token ${this.tokenValue}`
      })
    }).pipe(
      tap(user => {
        if (this.isBrowser) {
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
        this.currentUserSubject.next(user);
      })
    );
  }

  isLoggedIn(): boolean {
    return !!this.tokenValue;
  }
}