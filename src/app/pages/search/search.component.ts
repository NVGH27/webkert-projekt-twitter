import { Component, OnInit } from '@angular/core';
import { TweetService } from '../../shared/services/tweet.service';
import { Tweet } from '../../shared/models/Tweet';
import { FormsModule } from '@angular/forms';
import { MenuComponent } from '../../shared/menu/menu.component';
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../shared/services/user.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [MenuComponent, FormsModule, CommonModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent implements OnInit {
  searchTerm = '';
  allTweets: Tweet[] = [];
  filteredTweets: Tweet[] = [];
  userIdToUsernameMap: { [key: string]: string } = {};

  constructor(
    private tweetService: TweetService,
    private authService: AuthService,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.tweetService.getAllTweets().subscribe(tweets => {
      this.allTweets = tweets;
    });
  }
  async onSearchSubmit(event: Event) {
    event.preventDefault();
    const term = this.searchTerm.toLowerCase().trim();
    if (term.length === 0) {
      this.filteredTweets = [];
      return;
    }
    this.filteredTweets = this.allTweets.filter(tweet =>
      tweet.content.toLowerCase().includes(term)
    );
    const uniqueUserIds = [...new Set(this.allTweets.map(t => t.authorId))];

    for (const userId of uniqueUserIds) {
      if (!this.userIdToUsernameMap[userId]) {
        const username = await this.userService.getUsernameById(userId);
        this.userIdToUsernameMap[userId] = username || 'Ismeretlen';
      }
    }
  }

  likeTweet(tweet: Tweet) {
  tweet.likes += 1;

  this.tweetService.toggleLike(tweet.id); }

  async handleLogout() {
    await this.authService.signOut();
    this.router.navigateByUrl('/login');
  }
}
