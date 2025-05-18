import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { Observable, from, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { User } from '../models/User';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private firestore: Firestore,
    private authService: AuthService
  ) {}

  getUserProfile(): Observable<User | null> {
    return this.authService.currentUser.pipe(
      switchMap(authUser => {
        if (!authUser) {
          return of(null);
        }
        return from(this.fetchUser(authUser.uid));
      })
    );
  }

  private async fetchUser(userId: string): Promise<User | null> {
    try {
      const userDocRef = doc(this.firestore, 'Users', userId);
      const userSnapshot = await getDoc(userDocRef);

      if (!userSnapshot.exists()) {
        return null;
      }

      const userData = userSnapshot.data() as User;
      return { ...userData, id: userId };
    } catch (error) {
      console.error('Hiba a felhasználói adatok betöltése során:', error);
      return null;
    }
  }

  async getUsernameById(userId: string): Promise<string | null> {
  try {
    const userDocRef = doc(this.firestore, 'Users', userId);
    const userSnapshot = await getDoc(userDocRef);

    if (!userSnapshot.exists()) {
      return null;
    }

    const userData = userSnapshot.data() as User;
    return userData.username || null;  // Feltételezve, hogy a username mező 'username'
  } catch (error) {
    console.error('Hiba a username lekérésekor:', error);
    return null;
  }
}
}
