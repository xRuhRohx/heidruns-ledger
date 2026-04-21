import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BatchService } from '../../../core/services/batch';
import { Alert, Batch, BatchNote, Feeding, GravityReading, Ingredient } from '../../../core/models/models';
import { DatePipe, NgClass } from '@angular/common';
import { GravityChartComponent } from '../../gravity-log/gravity-chart/gravity-chart';

@Component({
  selector: 'app-batch-detail',
  imports: [RouterLink, DatePipe, FormsModule, NgClass, GravityChartComponent],
  templateUrl: './batch-detail.html',
  styleUrl: './batch-detail.scss',
})
export class BatchDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private batchService = inject(BatchService);

  batch = signal<Batch | null>(null);
  feedings = signal<Feeding[]>([]);
  gravityReadings = signal<GravityReading[]>([]);
  notes = signal<BatchNote[]>([]);
  currentAbv = signal<number>(0);
  batchId = signal<string>('');
  newNote = signal<string>('');
  savingNote = signal<boolean>(false);
  ingredients = signal<Ingredient[]>([]);
  alerts = signal<Alert[]>([]);
  selectedFile: File | null = null;
  imagePreview = signal<string | null>(null);
  expandedId = signal<string | null>(null);

  toggleExpand(id: string | undefined) {
    if (!id) return;
    this.expandedId.set(this.expandedId() === id ? null : id);
  }

  async onImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const base64 = await this.compressImage(file);
    this.imagePreview.set(base64);
    this.batchService.updateBatch(this.batchId(), { imageUrl: base64 });
  }

  private compressImage(file: File, maxSize = 400): Promise<string> {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.onload = () => {
          const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
          const canvas = document.createElement('canvas');
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = e.target!.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.batchId.set(id);

    this.batchService.getBatches().subscribe(batches => {
      const found = batches.find(b => b.id === id);
      if (found) {
        this.batch.set(found);
        this.recalculateAbv();
      }
    });

    this.batchService.getFeedings(id).subscribe(feedings => {
      this.feedings.set(feedings);
      this.recalculateAbv();
    });

    this.batchService.getGravityReadings(id).subscribe(readings => {
      this.gravityReadings.set(readings);
      this.recalculateAbv();
    });

    this.batchService.getNotes(id).subscribe(notes => {
      this.notes.set(notes);
    });

    this.batchService.getIngredients(id).subscribe(ingredients => {
      this.ingredients.set(ingredients);
    })

    this.batchService.getAlerts(id).subscribe(a => this.alerts.set(a));
  }

  toggleAlert(alert: Alert) {
    if (!alert.id) return;
    this.batchService.completeAlert(alert.id, !alert.completed);
  }

  recalculateAbv() {
    const batch = this.batch();
    const feedings = this.feedings();
    const currentGravity = batch?.currentGravity ?? 0;
    if (batch && currentGravity > 0) {
      this.currentAbv.set(this.batchService.calculateAbv(batch, feedings, currentGravity));
    }
  }

  updateStatus(event: Event) {
    const status = (event.target as HTMLSelectElement).value as Batch['status'];
    this.batchService.updateBatch(this.batchId(), { status });
  }

  saveNote() {
    const text = this.newNote().trim();
    if (!text) return;

    this.savingNote.set(true);
    const note: BatchNote = {
      batchId: this.batchId(),
      note: text,
      createdAt: new Date().toISOString(),
    };

    this.batchService.addNote(note)
      .then(() => {
        this.newNote.set('');
        this.savingNote.set(false);
      })
      .catch((error: any) => {
        console.error('Error saving note:', error);
        this.savingNote.set(false);
      });
  }
}
