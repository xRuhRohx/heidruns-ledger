import { Injectable, inject } from '@angular/core';
  import { Firestore, collection, collectionData, doc, addDoc, updateDoc, deleteDoc, query, where, orderBy, getDoc, getDocs } from
  '@angular/fire/firestore';
  import { map, Observable, of } from 'rxjs';
  import { Batch, BatchNote, Feeding, GravityReading, Ingredient, Alert } from '../models/models';

  @Injectable({
    providedIn: 'root'
  })
  export class BatchService {
    private firestore = inject(Firestore);

    // ---- Batches ----
    getBatches(): Observable<Batch[]> {
      const ref = collection(this.firestore, 'batches');
      return collectionData(ref, { idField: 'id' }) as Observable<Batch[]>;
    }

    async getBatchOnce(id: string): Promise<Batch | undefined> {
      const docRef = doc(this.firestore, 'batches', id);
      const snapshot = await getDoc(docRef);
      return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } as Batch: undefined;
    }

    addBatch(batch: Batch): Promise<any> {
      const ref = collection(this.firestore, 'batches');
      return addDoc(ref, batch);
    }

    updateBatch(id: string, batch: Partial<Batch>): Promise<void> {
      const ref = doc(this.firestore, 'batches', id);
      return updateDoc(ref, { ...batch, updatedAt: new Date().toISOString() });
    }

    deleteBatch(id: string): Promise<void> {
      const ref = doc(this.firestore, 'batches', id);
      return deleteDoc(ref);
    }

    async deleteBatchWithData(id: string): Promise<void> {
      const collections = ['feedings', 'gravityReadings', 'ingredients', 'batchNotes', 'alerts'];

      for (const col of collections) {
        const ref = collection(this.firestore, col);
        const q = query(ref, where('batchId', '==', id));
        const snapshot = await getDocs(q);
        await Promise.all(snapshot.docs.map(d => deleteDoc(d.ref)));
      }

      return this.deleteBatch(id);
    }

    // ---- Feedings ----
    getFeedings(batchId: string): Observable<Feeding[]> {
      const ref = collection(this.firestore, 'feedings');
      const q = query(ref, where('batchId', '==', batchId), orderBy('feedingNumber'));
      return collectionData(q, { idField: 'id' }) as Observable<Feeding[]>;
    }

    addFeeding(feeding: Feeding): Promise<any> {
      const ref = collection(this.firestore, 'feedings');
      return addDoc(ref, feeding);
    }

    async getFeedingOnce(id: string): Promise<Feeding | undefined> {
      const docRef = doc(this.firestore, 'feedings', id);
      const snapshot = await getDoc(docRef);
      return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } as Feeding : undefined;
    }

    updateFeeding(id: string, feeding: Partial<Feeding>): Promise<void> {
      const ref = doc(this.firestore, 'feedings', id);
      return updateDoc(ref, { ...feeding });
    }

    deleteFeeding(id: string): Promise<void> {
      const ref = doc(this.firestore, 'feedings', id);
      return deleteDoc(ref);
    }

    // ---- Gravity Readings ----
    getGravityReadings(batchId: string): Observable<GravityReading[]> {
      const ref = collection(this.firestore, 'gravityReadings');
      const q = query(ref, where('batchId', '==', batchId), orderBy('date'));
      return collectionData(q, { idField: 'id' }) as Observable<GravityReading[]>;
    }

    addGravityReading(reading: GravityReading): Promise<any> {
      const ref = collection(this.firestore, 'gravityReadings');
      return addDoc(ref, reading);
    }

    getAllGravityReadings(batchIds: string[]): Observable<GravityReading[]> {
      if (batchIds.length === 0) return of([]);
      const ref = collection(this.firestore, 'gravityReadings');
      const q = query(ref, where('batchId', 'in', batchIds));
      return collectionData(q, { idField: 'id' }) as Observable<GravityReading[]>;
    }

    async getGravityReadingOnce(id: string): Promise<GravityReading | undefined> {
      const docRef = doc(this.firestore, 'gravityReadings', id);
      const snapshot = await getDoc(docRef);
      return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } as GravityReading : undefined;
    }

    updateGravityReading(id: string, reading: Partial<GravityReading>): Promise<void> {
      const ref = doc(this.firestore, 'gravityReadings', id);
      return updateDoc(ref, { ...reading });
    }

    deleteGravityReading(id: string): Promise<void> {
      const ref = doc(this.firestore, 'gravityReadings', id);
      return deleteDoc(ref);
    }

    // ---- Ingredients ----
    getIngredients(batchId: string): Observable<Ingredient[]> {
      const ref = collection(this.firestore, 'ingredients');
      const q = query(ref, where('batchId', '==', batchId), orderBy('addedDate'));
      return collectionData(q, { idField: 'id' }) as Observable<Ingredient[]>;
    }

    addIngredient(ingredient: Ingredient): Promise<any> {
      const ref = collection(this.firestore, 'ingredients');
      return addDoc(ref, ingredient);
    }

    async getIngredientOnce(id: string): Promise<Ingredient | undefined> {
      const docRef = doc(this.firestore, 'ingredients', id);
      const snapshot = await getDoc(docRef);
      return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } as Ingredient : undefined;
    }

    updateIngredient(id: string, ingredient: Partial<Ingredient>): Promise<void> {
      const ref = doc(this.firestore, 'ingredients', id);
      return updateDoc(ref, { ...ingredient });
    }

    deleteIngredient(id: string): Promise<void> {
      const ref = doc(this.firestore, 'ingredients', id);
      return deleteDoc(ref);
    }

    // ---- Notes ----
    getNotes(batchId: string): Observable<BatchNote[]> {
      const ref = collection(this.firestore, 'batchNotes');
      const q = query(ref, where('batchId', '==', batchId), orderBy('createdAt'));
      return collectionData(q, { idField: 'id' }) as Observable<BatchNote[]>;
    }

    addNote(note: BatchNote): Promise<any> {
      const ref = collection(this.firestore, 'batchNotes');
      return addDoc(ref, note);
    }

    deleteNote(id: string): Promise<void> {
      const ref = doc(this.firestore, 'batchNotes', id);
      return deleteDoc(ref);
    }

    // ---- Alerts ----
    getAlerts(batchId: string): Observable<Alert[]> {
      const col = collection(this.firestore, 'alerts');
      const q = query(col, where('batchId', '==', batchId), orderBy('createdAt', 'asc'));
      return (collectionData(q, { idField: 'id' }) as Observable<any[]>).pipe(
        map(alerts => alerts.map(a => ({
          ...a,
          dueDate: a.dueDate ? (a.dueDate.toDate?.() ?? a.dueDate) : null,
          createdAt: a.createdAt ? (a.createdAt.toDate?.() ?? a.createdAt) : null
        } as Alert)))
      );
    }

    getAllAlerts(batchIds: string[]): Observable<Alert[]> {
      if (batchIds.length === 0) return of([]);
      const col = collection(this.firestore, 'alerts');
      const q = query(col, where('batchId', 'in', batchIds), orderBy('createdAt', 'asc'));
      return (collectionData(q, { idField: 'id' }) as Observable<any[]>).pipe(
        map(alerts => alerts.map(a => ({
          ...a,
          dueDate: a.dueDate ? (a.dueDate.toDate?.() ?? a.dueDate) : null,
          createdAt: a.createdAt ? (a.createdAt.toDate?.() ?? a.createdAt) : null
        } as Alert)))
      );
    }

    addAlert(alert: Omit<Alert, 'id'>) {
      const col = collection(this.firestore, 'alerts');
      return addDoc(col, alert);
    }

    completeAlert(alertId: string, completed: boolean) {
      const ref = doc(this.firestore, 'alerts', alertId);
      return updateDoc(ref, { completed });
    }

    async getAlertOnce(id: string): Promise<Alert | undefined> {
      const docRef = doc(this.firestore, 'alerts', id);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return undefined;
      const data = snapshot.data();
      return {
        id: snapshot.id,
        ...data,
        dueDate: data['dueDate']?.toDate?.() ?? data['dueDate'],
        createdAt: data['createdAt']?.toDate?.() ?? data['createdAt'],
      } as Alert;
    }

    updateAlert(id: string, alert: Partial<Alert>): Promise<void> {
      const ref = doc(this.firestore, 'alerts', id);
      return updateDoc(ref, { ...alert });
    }

    deleteAlert(id: string): Promise<void> {
      const ref = doc(this.firestore, 'alerts', id);
      return deleteDoc(ref);
    }

    // ---- ABV Calculation ----
    calculateAbv(batch: Batch, feedings: Feeding[], currentGravity: number): number {
      let totalAbv = 0;
      let previousGravity = batch.originalGravity;

      for (const feeding of feedings) {
        totalAbv += (previousGravity - feeding.preGravity) * 131.25;
        previousGravity = feeding.postGravity;
      }

      totalAbv += (previousGravity - currentGravity) * 131.25;

      return Math.round(totalAbv * 100) / 100;
    }

    async recalculateAndSaveAbv(batchId: string, originalGravity: number, currentGravity: number): Promise<void> {
      const feedingsRef = collection(this.firestore, 'feedings');
      const q = query(feedingsRef, where('batchId', '==', batchId), orderBy('feedingNumber'));
      const snapshot = await getDocs(q);
      const feedings = snapshot.docs.map(d => d.data() as Feeding);
      const abv = this.calculateAbv({ originalGravity } as Batch, feedings, currentGravity);
      return this.updateBatch(batchId, { currentAbv: abv });
    }
  }