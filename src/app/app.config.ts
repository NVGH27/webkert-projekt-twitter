import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes), provideFirebaseApp(() => initializeApp({ projectId: "faketwitterprojekt", appId: "1:766012911251:web:7216846e4f0f0bde23e766", storageBucket: "faketwitterprojekt.firebasestorage.app", apiKey: "AIzaSyC6NCDxKtVuUcL3b3J2CITwBPp70BdN7JU", authDomain: "faketwitterprojekt.firebaseapp.com", messagingSenderId: "766012911251" })), provideAuth(() => getAuth()), provideFirestore(() => getFirestore())
  ]
};
