import { inject, Injectable } from '@angular/core';
  import { Firestore, collection, addDoc, query, where, getDocs, deleteDoc } from '@angular/fire/firestore';

  const VAPID_PUBLIC_KEY = 'BMEZgdSD1NEbH5LWwjBAMX9z8nwBh5AwKPn9C6zfc27_41N4NP1o9m0DgQQwnCyFpdib5XfEBYcnqtPgP13snzc';

  @Injectable({ providedIn: 'root' })
  export class PushNotificationService {
    private firestore = inject(Firestore);

    async requestPermissionAndSubscribe(userId: string): Promise<void> {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;

      const registration = await navigator.serviceWorker.ready;

      // Always unsubscribe first to discard any stale/invalid subscription
      const existing = await registration.pushManager.getSubscription();
      if (existing) await existing.unsubscribe();

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: VAPID_PUBLIC_KEY
      });

      await this.saveSubscription(userId, subscription);
    }

    private async saveSubscription(userId: string, subscription: PushSubscription): Promise<void> {
      const col = collection(this.firestore, 'pushSubscriptions');
      const subJson = JSON.parse(JSON.stringify(subscription));

      // Remove any existing entry for this same device endpoint
      const q = query(col, where('endpoint', '==', subJson.endpoint));
      const existing = await getDocs(q);
      await Promise.all(existing.docs.map(d => deleteDoc(d.ref)));

      await addDoc(col, {
        userId,
        endpoint: subJson.endpoint,
        subscription: subJson,
        createdAt: new Date().toISOString()
      });
    }
  }