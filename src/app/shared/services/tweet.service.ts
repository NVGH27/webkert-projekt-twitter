import { Injectable } from '@angular/core';
import { Firestore, collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs, query, orderBy, where, serverTimestamp } from '@angular/fire/firestore';
import { Observable, from, map, take, firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { Tweet } from '../models/Tweet';
import { User } from '../models/User';

@Injectable({
  providedIn: 'root'
})
export class TweetService {
  private readonly TWEETS_COLLECTION = 'Tweets';
  private readonly NOTIFICATIONS_COLLECTION = 'Notifications';

  constructor(
    private authService: AuthService,
    private firestore: Firestore
  ) {}

  private getCurrentTimestamp(): string {
    return new Date().toISOString();
  }

  async addTweet(content: string): Promise<Tweet> {
    const user = await firstValueFrom(this.authService.currentUser.pipe(take(1)));
    if (!user) throw new Error('No authenticated user found');

    const tweetsCollection = collection(this.firestore, this.TWEETS_COLLECTION);
    const timestamp = this.getCurrentTimestamp();
    const tweetToSave = {
      content,
      timestamp,
      likes: 0,
      likedBy: [],
      authorId: user.uid
    };

    const docRef = await addDoc(tweetsCollection, tweetToSave);
    await updateDoc(docRef, { id: docRef.id });

    return {
      ...tweetToSave,
      id: docRef.id,
      timestamp: new Date(timestamp)
    } as Tweet;
  }

  getAllTweets(): Observable<Tweet[]> {
    const tweetsCollection = collection(this.firestore, this.TWEETS_COLLECTION);
    const tweetsQuery = query(tweetsCollection, orderBy('timestamp', 'desc'));

    return from(getDocs(tweetsQuery)).pipe(
      map(snapshot => snapshot.docs.map(doc => {
        const data = doc.data() as any;
        let ts = data.timestamp;
        if (ts && typeof ts.toDate === 'function') {
          ts = ts.toDate();
        } else if (typeof ts === 'string' || typeof ts === 'number') {
          ts = new Date(ts);
        }
        return {
          ...data,
          id: doc.id,
          timestamp: ts
        } as Tweet;
      }))
    );
  }

  async getTweetById(tweetId: string): Promise<Tweet | null> {
    const docRef = doc(this.firestore, this.TWEETS_COLLECTION, tweetId);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;

    const data = snapshot.data() as any;
    let ts = data.timestamp;
    if (ts && typeof ts.toDate === 'function') {
      ts = ts.toDate();
    } else if (typeof ts === 'string' || typeof ts === 'number') {
      ts = new Date(ts);
    }
    return {
      ...data,
      id: snapshot.id,
      timestamp: ts
    } as Tweet;
  }

  getTweetsByUser(userId: string): Observable<Tweet[]> {
    const tweetsCollection = collection(this.firestore, this.TWEETS_COLLECTION);
    const userTweetsQuery = query(tweetsCollection, where('authorId', '==', userId), orderBy('timestamp', 'desc'));

    return from(getDocs(userTweetsQuery)).pipe(
      map(snapshot => snapshot.docs.map(doc => {
        const data = doc.data() as any;
        let ts = data.timestamp;
        if (ts && typeof ts.toDate === 'function') {
          ts = ts.toDate();
        } else if (typeof ts === 'string' || typeof ts === 'number') {
          ts = new Date(ts);
        }
        return {
          ...data,
          id: doc.id,
          timestamp: ts
        } as Tweet;
      }))
    );
  }

  async toggleLike(tweetId: string): Promise<void> {
    const user = await firstValueFrom(this.authService.currentUser.pipe(take(1)));
    if (!user) throw new Error('No authenticated user found');

    const tweetDocRef = doc(this.firestore, this.TWEETS_COLLECTION, tweetId);
    const tweetSnap = await getDoc(tweetDocRef);
    if (!tweetSnap.exists()) throw new Error('Tweet not found');

    const tweet = tweetSnap.data() as Tweet;
    const likedBy = tweet.likedBy || [];
    const isLiked = likedBy.includes(user.uid);

    const updatedLikedBy = isLiked
      ? likedBy.filter(id => id !== user.uid)
      : [...likedBy, user.uid];

    const updatedLikes = updatedLikedBy.length;

    await updateDoc(tweetDocRef, {
      likedBy: updatedLikedBy,
      likes: updatedLikes
    });

    if (!isLiked && tweet.authorId !== user.uid) {
  const notificationsCollection = collection(this.firestore, this.NOTIFICATIONS_COLLECTION);
  await addDoc(notificationsCollection, {
    type: 'like',
    message: `${user.displayName || user.email || 'Ismeretlen felhasználó'} lájkolta a tweetedet.`,
    createdAt: serverTimestamp(),
    isRead: false,
    userId: tweet.authorId,
    relatedPostId: tweetId
  });
}

  }

  private async sendLikeNotification(tweet: Tweet, fromUser: User): Promise<void> {
  const notificationsCollection = collection(this.firestore, this.NOTIFICATIONS_COLLECTION);

  const notification = {
    type: 'like',
    message: `${fromUser.username || fromUser.email || 'Ismeretlen felhasználó'} liked your tweet.`,
    createdAt: serverTimestamp(),
    isRead: false,
    userId: tweet.authorId,
    relatedPostId: tweet.id
  };

  await addDoc(notificationsCollection, notification);
}

  async deleteTweet(tweetId: string): Promise<void> {
    const user = await firstValueFrom(this.authService.currentUser.pipe(take(1)));
    if (!user) throw new Error('No authenticated user found');

    const tweetDocRef = doc(this.firestore, this.TWEETS_COLLECTION, tweetId);
    const tweetSnap = await getDoc(tweetDocRef);
    if (!tweetSnap.exists()) throw new Error('Tweet not found');

    const tweet = tweetSnap.data() as Tweet;
    if (tweet.authorId !== user.uid) throw new Error('Cannot delete tweet from another user');

    await deleteDoc(tweetDocRef);
  }
}
