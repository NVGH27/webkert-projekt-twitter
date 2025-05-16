import { Component } from '@angular/core';
import { MenuComponent } from '../../shared/menu/menu.component';
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search',
  imports: [MenuComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent {
  constructor(private authService: AuthService, private router: Router) {}

  async handleLogout() {
    await this.authService.signOut();
    this.router.navigateByUrl('/login');
  }
}