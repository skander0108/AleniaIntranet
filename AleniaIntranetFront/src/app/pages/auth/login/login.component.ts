import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    loginForm: FormGroup;
    loading = false;
    errorMessage: string = '';
    showPassword = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            rememberMe: [false]
        });
    }

    get email() {
        return this.loginForm.get('email');
    }

    get password() {
        return this.loginForm.get('password');
    }

    togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
    }

    onSubmit() {
        if (this.loginForm.invalid) {
            Object.keys(this.loginForm.controls).forEach(key => {
                this.loginForm.controls[key].markAsTouched();
            });
            return;
        }

        this.loading = true;
        this.errorMessage = '';

        const { email, password, rememberMe } = this.loginForm.value;

        this.authService.login(email, password, rememberMe).subscribe({
            next: (response) => {
                const user = {
                    id: response.id,
                    email: response.email,
                    fullName: response.fullName,
                    roles: response.roles
                };

                // Get return URL or use role-based redirect
                const returnUrl = this.route.snapshot.queryParams['returnUrl'] || this.authService.getRedirectUrl(user);
                this.router.navigate([returnUrl]);
            },
            error: (error) => {
                this.loading = false;
                if (error.status === 401 || error.status === 403) {
                    this.errorMessage = 'Invalid email or password. Please try again.';
                } else {
                    this.errorMessage = 'An error occurred. Please try again later.';
                }
            }
        });
    }
}
