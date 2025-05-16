import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email = new FormControl('');
  password = new FormControl('');
  loginError: string = '';
  showLoginForm: boolean = true;

  constructor(private authService: AuthService, private router: Router) {}

  async login() {
    this.loginError = '';
    if (!this.email.value || !this.password.value) {
      this.loginError = 'Kérlek, töltsd ki az emailt és a jelszót!';
      return;
    }
    try {
      await this.authService.signIn(this.email.value, this.password.value);
      localStorage.setItem('isLoggedIn', 'true');
      this.router.navigateByUrl('/home');
    } catch (error: any) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        this.loginError = 'Hibás email vagy jelszó!';
      } else {
        this.loginError = error.message || 'Hiba a bejelentkezés során.';
      }
    }
  }
}