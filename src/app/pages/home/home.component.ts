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
  tweets: { user: string; content: string; timestamp: Date }[] = [
    { user: 'John Doe', content: 'Hello, world!', timestamp: new Date() },
    { user: 'Jane Smith', content: 'This is my first tweet!', timestamp: new Date() }
  ];

  addTweet() {
    if (this.newTweet.trim()) {
      this.tweets.unshift({
        user: 'Current User',
        content: this.newTweet,
        timestamp: new Date()
      });
      this.newTweet = '';
    }
  }
}