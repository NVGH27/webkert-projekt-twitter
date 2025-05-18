import { Component } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { User } from '../../shared/models/User';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterLink
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  signUpForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    rePassword: new FormControl('', [Validators.required]),
    birthdate: new FormControl('', []),
    phoneNumber: new FormControl('', []), // Removed async validators to make it optional
  });
  
  showForm = true;
  signupError = '';

  constructor(private router: Router, private authService: AuthService) {}

  async signup(): Promise<void> {
    if (this.signUpForm.invalid) {
      this.signupError = 'Kérlek, javítsd a hibákat a regisztrációhoz!';
      return;
    }

    const password = this.signUpForm.value.password || '';
    const rePassword = this.signUpForm.get('rePassword');
    if (password !== rePassword?.value) {
      this.signupError = 'A jelszavak nem egyeznek!';
      return;
    }

    // Prepare all required fields for Firestore, most as empty string/array if not provided
    const newUser: Partial<User> = {
      username: this.signUpForm.value.username || '',
      email: this.signUpForm.value.email || '',
      created_at: new Date().toISOString(),
      birthday: this.signUpForm.value.birthdate || '',
      phoneNumber: this.signUpForm.value.phoneNumber || '',
      bio: '',
      profile_image_url: '',
      tweets: [],
    };

    try {
      await this.authService.signUp(
        newUser.email!,
        password,
        newUser
      );
      this.router.navigate(['/home']);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        this.signupError = 'Az email már használatban van';
      } else {
        this.signupError = error.message || 'Hiba a regisztráció során.';
      }
    }
  }
}