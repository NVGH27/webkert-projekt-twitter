import { Component } from '@angular/core';
import { MenuComponent } from '../../shared/menu/menu.component';
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notifications',
  imports: [MenuComponent],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent {
  constructor(private authService: AuthService, private router: Router) {}

  async handleLogout() {
    await this.authService.signOut();
    this.router.navigateByUrl('/login');
  }
}
