import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { BatchService } from '../../../core/services/batch';
import { Batch } from '../../../core/models/models';

@Component({
  selector: 'app-batch-list',
  imports: [RouterLink, DatePipe],
  templateUrl: './batch-list.html',
  styleUrl: './batch-list.scss',
})
export class BatchList implements OnInit {
  private batchService = inject(BatchService);

  batches = signal<Batch[]>([]);

  readonly statusGroups = [
    { label: 'Primary Fermentation', status: 'primary' as const },
    { label: 'Secondary Fermentation', status: 'secondary' as const },
    { label: 'Tertiary Fermentation', status: 'tertiary' as const },
    { label: 'Conditioning', status: 'conditioning' as const },
    { label: 'Aging', status: 'aging' as const },
    { label: 'Completed', status: 'complete' as const }, 
  ]

  ngOnInit() {
    this.batchService.getBatches().subscribe(batches => {
      this.batches.set(batches.map(b => ({
        ...b,
        startDate: (b.startDate as any)?.toDate?.() ?? b.startDate
      })));
    });
  }

  batchesByStatus(status: Batch['status']) {
    return this.batches().filter(b => b.status === status);
  }

  quickAbv(batch: Batch): number {
    if (!batch.originalGravity || !batch.currentGravity) return 0;
    return Math.round((batch.originalGravity - batch.currentGravity) * 131.25 * 100) / 100;
  }
}
