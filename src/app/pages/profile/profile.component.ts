import { Component } from '@angular/core';
import { MenuComponent } from '../../shared/menu/menu.component';
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [MenuComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  constructor(private authService: AuthService, private router: Router) {}

  async handleLogout() {
    await this.authService.signOut();
    this.router.navigateByUrl('/login');
  }
}
