import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Only add Authorization header for API requests (excluding auth endpoints)
        if (req.url.startsWith('/api') && !req.url.includes('/api/auth/login')) {
            const token = this.authService.getToken();
            console.log('Interceptor: Processing request to', req.url);

            if (token) {
                console.log('Interceptor: Adding token to request');
                req = req.clone({
                    setHeaders: {
                        Authorization: `Bearer ${token}`
                    }
                });
            } else {
                console.warn('Interceptor: No token found for request to', req.url);
            }
        }

        return next.handle(req).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status === 401) {
                    // Unauthorized - clear auth and redirect to login
                    this.authService.logout();
                } else if (error.status === 403) {
                    // Forbidden - show error message (could use a toast service)
                    console.error('Access Denied: You do not have permission to access this resource');
                }

                return throwError(() => error);
            })
        );
    }
}
