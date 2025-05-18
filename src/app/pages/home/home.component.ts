import { Component, OnInit } from '@angular/core';
import { MenuComponent } from '../../shared/menu/menu.component';
import { TweetService } from '../../shared/services/tweet.service';
import { Tweet } from '../../shared/models/Tweet';
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';
import { TimeAgoPipe } from '../../shared/pipes/time-ago.pipe';
import { UserService } from '../../shared/services/user.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User } from 'firebase/auth';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule, MenuComponent]
})
export class HomeComponent implements OnInit {
  tweets: Tweet[] = [];
  currentUser: User | null = null;
  newTweetContent: string = '';
  userIdToUsernameMap: { [key: string]: string } = {};
  private userSubscription?: Subscription;

  constructor(
    private tweetService: TweetService,
    private router: Router,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      this.loadTweets();
    }); 
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  loadTweets(): void {
    this.tweetService.getAllTweets().subscribe(async tweets => {
      this.tweets = tweets;

      const uniqueUserIds = [...new Set(tweets.map(t => t.authorId))];

      for (const userId of uniqueUserIds) {
        if (!this.userIdToUsernameMap[userId]) {
          const username = await this.userService.getUsernameById(userId);
          this.userIdToUsernameMap[userId] = username || 'Ismeretlen';
        }
      }
    });
  }

  async postTweet(): Promise<void> {
    if (!this.newTweetContent.trim()) return;
    try {
      await this.tweetService.addTweet(this.newTweetContent);
      this.newTweetContent = '';
      this.loadTweets();
    } catch (error) {
      console.error('Tweet post error:', error);
    }
  }

  async toggleLike(tweet: Tweet): Promise<void> {
    try {
      await this.tweetService.toggleLike(tweet.id);
      this.loadTweets();
    } catch (error) {
      console.error('Like error:', error);
    }
  }

  async deleteTweet(tweet: Tweet): Promise<void> {
    try {
      await this.tweetService.deleteTweet(tweet.id);
      this.loadTweets();
    } catch (error) {
      console.error('Delete error:', error);
    }
  }

  isLikedByUser(tweet: Tweet): boolean {
    return tweet.likedBy.includes(this.currentUser?.uid || '');
  }

  isOwner(tweet: Tweet): boolean {
    return tweet.authorId === this.currentUser?.uid;
  }

  async handleLogout() {
    await this.authService.signOut();
    this.router.navigateByUrl('/login');
  }
}
