import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, User } from '../models/auth.model';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly API_URL = '/api/auth';
    private readonly TOKEN_KEY = 'access_token';
    private readonly USER_KEY = 'current_user';

    private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(
        private http: HttpClient,
        private router: Router
    ) { }

    login(email: string, password: string, rememberMe: boolean = false): Observable<LoginResponse> {
        const payload: LoginRequest = { email, password };

        return this.http.post<LoginResponse>(`${this.API_URL}/login`, payload).pipe(
            tap(response => {
                // Store token
                if (rememberMe) {
                    localStorage.setItem(this.TOKEN_KEY, response.accessToken);
                } else {
                    sessionStorage.setItem(this.TOKEN_KEY, response.accessToken);
                }

                // Store user info
                const user: User = {
                    id: response.id,
                    email: response.email,
                    fullName: response.fullName,
                    roles: response.roles
                };

                const storage = rememberMe ? localStorage : sessionStorage;
                storage.setItem(this.USER_KEY, JSON.stringify(user));

                this.currentUserSubject.next(user);
            })
        );
    }

    logout(): void {
        // Clear both storages
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        sessionStorage.removeItem(this.TOKEN_KEY);
        sessionStorage.removeItem(this.USER_KEY);

        this.currentUserSubject.next(null);
        this.router.navigate(['/auth/login']);
    }

    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY);
    }

    getCurrentUser(): User | null {
        return this.currentUserSubject.value;
    }

    isAuthenticated(): boolean {
        return this.getToken() !== null && this.getCurrentUser() !== null;
    }

    getUserRoles(): string[] {
        const user = this.getCurrentUser();
        return user?.roles || [];
    }

    hasRole(role: string): boolean {
        const user = this.getCurrentUser();
        if (!user || !user.roles) return false;
        return user.roles.includes(role) || user.roles.includes(`ROLE_${role}`);
    }

    hasAnyRole(roles: string[]): boolean {
        const user = this.getCurrentUser();
        if (!user || !user.roles) return false;
        return roles.some(role =>
            user.roles.includes(role) || user.roles.includes(`ROLE_${role}`)
        );
    }

    getRedirectUrl(user: User): string {
        // Admin users go to admin panel
        if (user.roles.includes('ADMIN') || user.roles.includes('ROLE_ADMIN')) {
            return '/admin-panel';
        }

        // Managers and collaborators go to dashboard
        return '/dashboard';
    }

    private getUserFromStorage(): User | null {
        const userJson = localStorage.getItem(this.USER_KEY) || sessionStorage.getItem(this.USER_KEY);
        if (!userJson) {
            return null;
        }

        try {
            return JSON.parse(userJson) as User;
        } catch {
            return null;
        }
    }
}
