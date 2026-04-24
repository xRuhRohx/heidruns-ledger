import { inject, Injectable, signal } from '@angular/core';
  import { Auth, User, GoogleAuthProvider, signInWithPopup, signOut, user } from '@angular/fire/auth';
  import { Router } from '@angular/router';
  import { environment } from '../../../environments/environment';
  import { PushNotificationService } from '../services/push-notifications';

  const ALLOWED_UID = environment.allowedUid;

  @Injectable({
    providedIn: 'root',
  })
  export class AuthService {
    private auth = inject(Auth);
    private router = inject(Router);
    private pushNotification = inject(PushNotificationService);

    currentUser = signal<User | null>(null);
    accessDenied = signal(false);

    constructor() {
      user(this.auth).subscribe(u => {
        if (u && u.uid !== ALLOWED_UID) {
          this.accessDenied.set(true);
          signOut(this.auth);
          this.currentUser.set(null);
        } else {
          this.currentUser.set(u);
        }
      });
    }

    async signInWithGoogle() {
      this.accessDenied.set(false);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      if (result.user.uid !== ALLOWED_UID) {
        this.accessDenied.set(true);
        await signOut(this.auth);
        return;
      }
      void this.pushNotification.requestPermissionAndSubscribe(result.user.uid);
      this.router.navigate(['/dashboard']);
    }

    async signOut() {
      await signOut(this.auth);
      this.router.navigate(['/login']);
    }

    isLoggedIn() {
      return this.currentUser() !== null;
    }
  }