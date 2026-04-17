import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BatchService } from '../../../core/services/batch';
import { GravityReading } from '../../../core/models/models';

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

  reading: GravityReading = {
    batchId: '',
    feedingNumber: 0,
    reading: 0,
    date: new Date().toISOString().split('T')[0],
    notes: '',
  };

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.batchId.set(id);
    this.reading.batchId = id;
  }

  save() {
    this.saving.set(true);
    this.batchService.addGravityReading(this.reading)
    .then(() => {
      // Update the batch's currentGravity with this reading
      return this.batchService.updateBatch(this.batchId(), {
        currentGravity: this.reading.reading,
      });
    })
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
