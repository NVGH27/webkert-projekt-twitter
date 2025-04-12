import { Component } from '@angular/core';
import { MenuComponent } from '../../shared/menu/menu.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TimeAgoPipe } from '../../shared/pipes/time-ago.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MenuComponent, FormsModule, CommonModule, TimeAgoPipe],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  maxTweetLength = 280;
  newTweet = '';

  tweets: {
    id: number;
    user_id: number;
    text: string;
    created_at: Date;
    updated_at: Date;
  }[] = [
    {
      id: 1,
      user_id: 101,
      text: 'Hello, world!',
      created_at: new Date(Date.now() - 1000 * 60 * 10), // 10 perce
      updated_at: new Date()
    },
    {
      id: 2,
      user_id: 102,
      text: 'This is my first tweet!',
      created_at: new Date(Date.now() - 1000 * 60 * 60), // 1 órája
      updated_at: new Date()
    }
  ];

  private nextId = 3;

  addTweet() {
    if (this.newTweet.trim()) {
      const now = new Date();
      this.tweets.unshift({
        id: this.nextId++,
        user_id: 999, // jelenlegi felhasználó ID-je
        text: this.newTweet.trim(),
        created_at: now,
        updated_at: now
      });
      this.newTweet = '';
    }
  }

  handleLogout() {
    console.log('User logged out');
    // Add logout logic here
  }
}
