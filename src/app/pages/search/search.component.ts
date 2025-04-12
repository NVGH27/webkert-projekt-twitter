import { Component } from '@angular/core';
import { MenuComponent } from '../../shared/menu/menu.component';
//import { TimeAgoPipe } from '../../shared/pipes/time-ago.pipe';

@Component({
  selector: 'app-search',
  imports: [MenuComponent/* TimeAgoPipe*/],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent {
  handleLogout() {
    console.log('User logged out');
    // Add logout logic here
  }
}