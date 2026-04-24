import { Component, inject, signal, OnInit, ChangeDetectorRef } from '@angular/core';
  import { ActivatedRoute, Router, RouterLink } from '@angular/router';
  import { FormsModule } from '@angular/forms';
  import { BatchService } from '../../../core/services/batch';
  import { Feeding } from '../../../core/models/models';
  import { toDateTimeLocalString } from '../../../core/utils/date';

  @Component({
    selector: 'app-feeding-form',
    imports: [FormsModule, RouterLink],
    templateUrl: './feeding-form.html',
    styleUrl: './feeding-form.scss',
  })
  export class FeedingForm implements OnInit {
    private batchService = inject(BatchService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private cdr = inject(ChangeDetectorRef);

    saving = signal(false);
    isEditing = signal(false);
    batchId = signal<string>('');
    feedingId = signal<string>('');
    nextFeedingNumber = signal<number>(1);
    originalGravity = 0;

    feeding: Feeding = {
      batchId: '',
      feedingNumber: 1,
      preGravity: 0,
      postGravity: 0,
      date: toDateTimeLocalString(),
      ingredients: '',
      notes: '',
    };

    ngOnInit() {
      const id = this.route.snapshot.paramMap.get('id');
      const feedingId = this.route.snapshot.paramMap.get('feedingId');
      if (!id) return;

      this.batchId.set(id);
      this.feeding.batchId = id;

      this.batchService.getBatchOnce(id).then(batch => {
        if (batch) this.originalGravity = batch.originalGravity;
      });

      if (feedingId) {
        this.isEditing.set(true);
        this.feedingId.set(feedingId);
        this.batchService.getFeedingOnce(feedingId).then(f => {
          if (f) Object.assign(this.feeding, { ...f, date: toDateTimeLocalString(new Date(f.date)) });
          this.cdr.markForCheck();
        });
      } else {
        this.batchService.getFeedings(id).subscribe(feedings => {
          this.nextFeedingNumber.set(feedings.length + 1);
          this.feeding.feedingNumber = feedings.length + 1;
        });
      }
    }

    save() {
      this.saving.set(true);
      const feedingData = { ...this.feeding, date: new Date(this.feeding.date).toISOString() };

      if (this.isEditing()) {
        this.batchService.updateFeeding(this.feedingId(), feedingData)
          .then(() => this.batchService.recalculateAndSaveAbv(this.batchId(), this.originalGravity,
  this.feeding.postGravity))
          .then(() => {
            this.saving.set(false);
            this.router.navigate(['/batches', this.batchId()]);
          })
          .catch((error: any) => {
            console.error('Error updating feeding:', error);
            this.saving.set(false);
          });
      } else {
        const gravityReading = {
          batchId: this.batchId(),
          feedingNumber: this.feeding.feedingNumber,
          reading: this.feeding.postGravity,
          date: feedingData.date,
          notes: `Auto-logged from Feeding #${this.feeding.feedingNumber}`,
        };
        this.batchService.addFeeding(feedingData)
          .then(() => this.batchService.addGravityReading(gravityReading))
          .then(() => this.batchService.updateBatch(this.batchId(), { currentGravity: this.feeding.postGravity }))
          .then(() => this.batchService.recalculateAndSaveAbv(this.batchId(), this.originalGravity,
  this.feeding.postGravity))
          .then(() => {
            this.saving.set(false);
            this.router.navigate(['/batches', this.batchId()]);
          })
          .catch((error: any) => {
            console.error('Error saving feeding:', error);
            this.saving.set(false);
          });
      }
    }
  }