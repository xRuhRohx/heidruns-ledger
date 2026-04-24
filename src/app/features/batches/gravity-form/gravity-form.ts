import { Component, inject, signal, OnInit } from '@angular/core';
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

    saving = signal(false);
    batchId = signal<string>('');
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
      if (!id) return;

      this.batchId.set(id);
      this.reading.batchId = id;

      this.batchService.getBatchOnce(id).then(batch => {
        if (batch) this.originalGravity = batch.originalGravity;
      });
    }

    save() {
      this.saving.set(true);
      const readingData = { ...this.reading, date: new Date(this.reading.date).toISOString() };
      this.batchService.addGravityReading(readingData)
        .then(() => this.batchService.updateBatch(this.batchId(), { currentGravity: this.reading.reading }))
        .then(() => this.batchService.recalculateAndSaveAbv(this.batchId(), this.originalGravity, this.reading.reading))
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