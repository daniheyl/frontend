// src/app/components/profile/profile.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  profileForm: FormGroup;
  message: string = '';
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder
  ) {
    this.profileForm = this.formBuilder.group({
      username: [{ value: '', disabled: true }],
      email: ['', [Validators.required, Validators.email]],
      first_name: [''],
      last_name: ['']
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.loading = true;
    this.authService.getUserProfile().subscribe({
      next: (user) => {
        this.user = user;
        this.profileForm.patchValue({
          username: user.username,
          email: user.email,
          first_name: user.first_name || '',
          last_name: user.last_name || ''
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load user profile:', err);
        this.message = 'Failed to load user profile. Please try again.';
        this.loading = false;
      }
    });
  }

  // Note: This method would need a new endpoint in your Django backend
  // to handle profile updates. You would need to implement that separately.
  onSubmit(): void {
    if (this.profileForm.invalid) {
      return;
    }

    // This is where you would call the profile update service
    // For now, just display a message
    this.message = 'Profile updated successfully!';
  }
}