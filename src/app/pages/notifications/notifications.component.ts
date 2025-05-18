import { Component, OnInit } from '@angular/core';
import { MenuComponent } from '../../shared/menu/menu.component';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';
import { Firestore, collection, query, where, orderBy, getDocs, serverTimestamp, addDoc } from '@angular/fire/firestore';
import { firstValueFrom } from 'rxjs';
import { UnreadPipe } from '../../shared/pipes/unread.pipe';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention';
  message: string;
  createdAt: Date;
  isRead: boolean;
  userId: string;
  relatedPostId: string;
}

@Component({
  selector: 'app-notifications',
  imports: [MenuComponent, CommonModule, UnreadPipe],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  loading = true;
  errorMsg: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private firestore: Firestore
  ) {}

  async ngOnInit() {
    try {
      const user = await firstValueFrom(this.authService.currentUser);
      if (!user) {
        this.router.navigateByUrl('/login');
        return;
      }
      await this.loadNotifications(user.uid);
    } catch (error) {
      this.errorMsg = 'Hiba történt az értesítések betöltése közben.';
      this.loading = false;
      console.error(error);
    }
  }

 async loadNotifications(userId: string) {
  try {
    const notificationsCollection = collection(this.firestore, 'Notifications');
    const tweetsCollection = collection(this.firestore, 'Tweets');
    const usersCollection = collection(this.firestore, 'Users');

    const q = query(
      notificationsCollection,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const notificationsRaw = querySnapshot.docs.map(doc => {
      const data = doc.data() as any;
      const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();

      return {
        ...data,
        id: doc.id,
        createdAt,
      } as Notification;
    });

    const tweetsData = await Promise.all(
      notificationsRaw.map(async notification => {
        if (!notification.relatedPostId) return null;

        const tweetDoc = await getDocs(query(tweetsCollection, where('id', '==', notification.relatedPostId)));
        if (!tweetDoc.empty) {
          const tweetData = tweetDoc.docs[0].data() as any;
          return {
            notificationId: notification.id,
            authorId: tweetData.userId || tweetData.authorId || null
          };
        }
        return { notificationId: notification.id, authorId: null };
      })
    );

    // 3. Lekérjük a felhasználókat a tweet szerzőinek azonosító alapján
    const authorIds = Array.from(new Set(tweetsData.map(t => t?.authorId).filter(id => id)));
    const usersData = await Promise.all(
      authorIds.map(async uid => {
        const userDoc = await getDocs(query(usersCollection, where('uid', '==', uid)));
        if (!userDoc.empty) {
          const userData = userDoc.docs[0].data() as any;
          return { uid, displayName: userData.displayName || userData.email || 'Ismeretlen' };
        }
        return { uid, displayName: 'Ismeretlen' };
      })
    );

    const usersMap = new Map(usersData.map(u => [u.uid, u.displayName]));

    // 4. Kiegészítjük az értesítéseket a tweet szerző nevével
    this.notifications = notificationsRaw.map(notification => {
      const tweetInfo = tweetsData.find(t => t?.notificationId === notification.id);
      const authorName = tweetInfo?.authorId ? usersMap.get(tweetInfo.authorId) : 'Ismeretlen';

      return {
        ...notification,
        tweetAuthorName: authorName
      };
    });

  } catch (error) {
    this.errorMsg = 'Nem sikerült betölteni az értesítéseket.';
    console.error(error);
  } finally {
    this.loading = false;
  }
}

  async addTestNotification(userId: string) {
    try {
      await addDoc(collection(this.firestore, 'Notifications'), {
        type: 'like',
        message: 'Ez egy teszt értesítés',
        createdAt: serverTimestamp(),
        isRead: false,
        userId,
        relatedPostId: 'tesztTweet123'
      });
    } catch (error) {
      console.error('Hiba teszt értesítés hozzáadásakor:', error);
    }
  }

  async handleLogout() {
    await this.authService.signOut();
    this.router.navigateByUrl('/login');
  }
}
