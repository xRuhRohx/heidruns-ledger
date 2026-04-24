import { ChangeDetectorRef, Component, inject, signal, OnInit } from '@angular/core';
  import { ActivatedRoute, Router, RouterLink } from '@angular/router';
  import { FormsModule } from '@angular/forms';
  import { BatchService } from '../../../core/services/batch';
  import { GravityReading } from '../../../core/models/models';
  import { toDateTimeLocalString } from '../../../core/utils/date';

  @Component({
    selector: 'app-gravity-form',
    imports: [FormsModule, RouterLink],
    templateUrl: './gravity-form.html',
    styleUrl: './gravity-form.scss',
  })
  export class GravityForm implements OnInit {
    private batchService = inject(BatchService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private cdr = inject(ChangeDetectorRef);

    saving = signal(false);
    isEditing = signal(false);
    batchId = signal<string>('');
    readingId = signal<string>('');
    originalGravity = 0;

    reading: GravityReading = {
      batchId: '',
      feedingNumber: 0,
      reading: 0,
      date: toDateTimeLocalString(),
      notes: '',
    };

    ngOnInit() {
      const id = this.route.snapshot.paramMap.get('id');
      const readingId = this.route.snapshot.paramMap.get('readingId');
      if (!id) return;

      this.batchId.set(id);
      this.reading.batchId = id;

      this.batchService.getBatchOnce(id).then(batch => {
        if (batch) this.originalGravity = batch.originalGravity;
      });

      if (readingId) {
        this.isEditing.set(true);
        this.readingId.set(readingId);
        this.batchService.getGravityReadingOnce(readingId).then(r => {
          if (r) Object.assign(this.reading, { ...r, date: toDateTimeLocalString(new Date(r.date)) });
          this.cdr.markForCheck();
        });
      }
    }

    save() {
      this.saving.set(true);
      const readingData = { ...this.reading, date: new Date(this.reading.date).toISOString() };

      if (this.isEditing()) {
        this.batchService.updateGravityReading(this.readingId(), readingData)
          .then(() => this.batchService.recalculateAndSaveAbv(this.batchId(), this.originalGravity,
  this.reading.reading))
          .then(() => {
            this.saving.set(false);
            this.router.navigate(['/batches', this.batchId()]);
          })
          .catch((error: any) => {
            console.error('Error updating gravity reading:', error);
            this.saving.set(false);
          });
      } else {
        this.batchService.addGravityReading(readingData)
          .then(() => this.batchService.updateBatch(this.batchId(), { currentGravity: this.reading.reading }))
          .then(() => this.batchService.recalculateAndSaveAbv(this.batchId(), this.originalGravity,
  this.reading.reading))
          .then(() => {
            this.saving.set(false);
            this.router.navigate(['/batches', this.batchId()]);
          })
          .catch((error: any) => {
            console.error('Error saving gravity reading:', error);
            this.saving.set(false);
          });
      }
    }
  }