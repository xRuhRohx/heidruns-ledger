import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BatchService } from '../../core/services/batch';
import { Batch, Alert } from '../../core/models/models';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private batchService = inject(BatchService);

  batches = signal<Batch[]>([]);
  alerts = signal<Alert[]>([]);

  activeBatches = computed(() =>
    this.batches().filter(b => b.status !== 'complete')
  );

  nearTargetAbv = computed(() =>
    this.activeBatches().filter(b =>
      b.targetAbv != null &&
      b.currentGravity != null &&
      Math.abs((b.currentAbv ?? 0) - (b.targetAbv ?? 0)) <= 1
    ).length
  );

  quickAbv(batch: Batch): number {
    if (!batch.originalGravity || !batch.currentGravity) return 0;
    return Math.round((batch.originalGravity - batch.currentGravity) * 131.25 * 100) / 100;
  }

  upcomingAlerts = computed(() => {
    const now = new Date();
    const week = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return this.alerts().filter(a =>
      !a.completed && a.dueDate >= now && a.dueDate <= week
    ).length;
  });

  overdueAlerts = computed(() => {
    const now = new Date();
    return this.alerts().filter(a =>
      !a.completed && a.dueDate < now
    ).length;
  });

  ngOnInit() {
    this.batchService.getBatches().subscribe(batches => {
      this.batches.set(batches);
      const ids = batches.map(b => b.id!).filter(Boolean);
      if (ids.length > 0) {
        this. batchService.getAllAlerts(ids).subscribe(a => this.alerts.set(a));
      }
    });
  }
}
