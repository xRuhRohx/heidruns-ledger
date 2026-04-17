import { Injectable, inject } from '@angular/core';
  import { Firestore, collection, collectionData, doc, addDoc, updateDoc, deleteDoc, query, where, orderBy } from
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

    // ---- Ingredients ----
    getIngredients(batchId: string): Observable<Ingredient[]> {
      const ref = collection(this.firestore, 'ingredients');
      const q = query(ref, where('batchId', '==', batchId));
      return collectionData(q, { idField: 'id' }) as Observable<Ingredient[]>;
    }

    addIngredient(ingredient: Ingredient): Promise<any> {
      const ref = collection(this.firestore, 'ingredients');
      return addDoc(ref, ingredient);
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

    // ---- Alerts ----
    getAlerts(batchId: string): Observable<Alert[]> {
      const col = collection(this.firestore, 'alerts');
      const q = query(col, where('batchId', '==', batchId), orderBy('dueDate', 'asc'));
      return (collectionData(q, { idField: 'id' }) as Observable<any[]>).pipe(
        map(alerts => alerts.map(a => ({
          ...a,
          dueDate: a.dueDate ? (a.dueDate.toDate?.() ?? a.dueDate) : null,
          createAt: a.createdAt ? (a.createdAt.toDate?.() ?? a.createdAt) : null
        } as Alert)))
      );
    }

    getAllAlerts(batchIds: string[]): Observable<Alert[]> {
      if (batchIds.length === 0) return of([]);
      const col = collection(this.firestore, 'alerts');
      const q = query(col, where('batchId', 'in', batchIds), orderBy('dueDate', 'asc'));
      return (collectionData(q, { idField: 'id' }) as Observable<any[]>).pipe(
        map(alerts => alerts.map(a => ({
          ...a,
          dueDate: a.dueDate ? (a.dueDate.toDate?.() ?? a.dueDate) : null,
          createAt: a.createdAt ? (a.createdAt.toDate?.() ?? a.createdAt) : null
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
  }