import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BatchService } from '../../../core/services/batch';
import { Feeding } from '../../../core/models/models';

@Component({
  selector: 'app-gravity-form',
  imports: [FormsModule, RouterLink],
  templateUrl: './feeding-form.html',
  styleUrl: './feeding-form.scss',
})
export class FeedingForm implements OnInit {
  private batchService = inject(BatchService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  saving = signal(false);
  batchId = signal<string>('');
  nextFeedingNumber = signal<number>(1);

  feeding: Feeding = {
    batchId: '',
    feedingNumber: 1,
    preGravity: 0,
    postGravity: 0,
    date: new Date().toISOString().split('T')[0],
    ingredients: '',
    notes: '',
  };

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.batchId.set(id);
    this.feeding.batchId = id;

    this.batchService.getFeedings(id).subscribe(feedings => {
      this.nextFeedingNumber.set(feedings.length + 1);
      this.feeding.feedingNumber = feedings.length + 1;
    });
  }

  save() {
    this.saving.set(true);
    this.batchService.addFeeding(this.feeding)
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
