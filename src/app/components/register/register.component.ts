// src/app/components/register/register.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  error: string = '';
  loading: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password2: ['', Validators.required],
      first_name: [''],
      last_name: ['']
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('password2')?.value
      ? null : { 'mismatch': true };
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.register(this.registerForm.value)
      .subscribe({
        next: () => {
          this.router.navigate(['/todos']);
        },
        error: err => {
          this.loading = false;
          
          if (err.error) {
            // Format Django validation errors
            if (typeof err.error === 'object') {
              const errorMessages = [];
              for (const key in err.error) {
                if (err.error.hasOwnProperty(key)) {
                  errorMessages.push(`${key}: ${err.error[key]}`);
                }
              }
              this.error = errorMessages.join(', ');
            } else {
              this.error = err.error;
            }
          } else {
            this.error = 'Registration failed. Please try again.';
          }
        }
      });
  }
}