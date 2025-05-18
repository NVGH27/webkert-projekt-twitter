import { Component } from '@angular/core';
import { MenuComponent } from '../../shared/menu/menu.component';
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TimeAgoPipe } from '../../shared/pipes/time-ago.pipe';
import { collection, doc, getDoc, getDocs, query, where } from '@angular/fire/firestore';
import { Firestore } from '@angular/fire/firestore';
import { User } from '../../shared/models/User';
import { Tweet } from '../../shared/models/Tweet';
import { TweetService } from '../../shared/services/tweet.service';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [MenuComponent, CommonModule, TimeAgoPipe],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  user: User | null = null;
  userTweets: Tweet[] = [];
  loading: boolean = true;
  uploadError: string = '';
  private userSub: any;

  constructor(
     private authService: AuthService,
  private router: Router,
  private firestore: Firestore,
  private tweetService: TweetService
  ) {
    this.loadUserDataAndTweets();
  }

  async loadUserDataAndTweets() {
    this.loading = true;
    if (this.userSub) this.userSub.unsubscribe();

    this.userSub = this.authService.currentUser.subscribe(async (firebaseUser) => {
      if (!firebaseUser) {
        this.user = null;
        this.userTweets = [];
        this.loading = false;
        return;
      }

      const userDocRef = doc(this.firestore, 'Users', firebaseUser.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        this.user = { id: firebaseUser.uid, ...userSnap.data() } as User;

        const tweetsQuery = query(
          collection(this.firestore, 'Tweets'),
          where('authorId', '==', firebaseUser.uid)
        );
        const tweetsSnap = await getDocs(tweetsQuery);

      this.userTweets = tweetsSnap.docs.map(doc => {
  const data = doc.data();
  return {
    id: doc.id,
    content: data['content'],  // az általad megadott mező neve 'content'
    authorId: data['authorId'],
    timestamp: data['timestamp'] ? new Date(data['timestamp']) : null,  // stringből Date-be konvertálás
    likes: data['likedBy'] ?? []
  } as Tweet;
});

      this.userTweets.sort((a, b) => {
        const getTime = (timestamp: any): number => {
          if (timestamp instanceof Date) {
            return timestamp.getTime();
          } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
            return new Date(timestamp).getTime();
          }
          return 0;
        };

        const aTime = getTime(a.timestamp);
        const bTime = getTime(b.timestamp);

        return bTime - aTime;
      });

    } else {
      this.user = null;
      this.userTweets = [];
    }

    this.loading = false;
  });
}

  async onProfileImageChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];

    try {
      const { getStorage, ref, uploadBytes, getDownloadURL } = await import('@angular/fire/storage');
      const storage = getStorage();
      const userId = this.user?.id;
      if (!userId) return;

      const filePath = `profile_images/${userId}`;
      const fileRef = ref(storage, filePath);

      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);

      const userDocRef = doc(this.firestore, 'Users', userId);
      await import('@angular/fire/firestore').then(({ updateDoc }) => 
        updateDoc(userDocRef, { profile_image_url: downloadURL })
      );

      if (this.user) this.user.profile_image_url = downloadURL;
      this.uploadError = '';
    } catch (err) {
      this.uploadError = 'Hiba a profilkép feltöltésekor!';
    }
  }

  async handleLogout() {
    await this.authService.signOut();
    this.router.navigateByUrl('/login');
  }

  async deleteTweet(tweetId: string) {
  try {
    const confirmDelete = confirm('Biztosan törölni szeretnéd ezt a tweetet?');
    if (!confirmDelete) return;

    const tweetDocRef = doc(this.firestore, 'Tweets', tweetId);
    await import('@angular/fire/firestore').then(({ deleteDoc }) =>
      deleteDoc(tweetDocRef)
    );

    // Lokálisan is töröld
    this.userTweets = this.userTweets.filter(tweet => tweet.id !== tweetId);
  } catch (error) {
    console.error('Hiba a tweet törlésekor:', error);
  }
}

editTweet(tweet: Tweet) {
  const newContent = prompt('Új szöveg:', tweet.content);
  if (newContent !== null && newContent.trim() !== '') {
    const tweetDocRef = doc(this.firestore, 'Tweets', tweet.id);
    import('@angular/fire/firestore').then(({ updateDoc }) =>
      updateDoc(tweetDocRef, { content: newContent })
    ).then(() => {
      // Lokálisan frissítés
      tweet.content = newContent;
    }).catch(err => {
      console.error('Hiba a tweet frissítésekor:', err);
    });
  }
}

}
