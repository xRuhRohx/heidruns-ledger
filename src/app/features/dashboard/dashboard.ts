import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { BatchService } from '../../core/services/batch';
import { Batch, Alert, GravityReading } from '../../core/models/models';
import { parseDate } from '../../core/utils/date';

const BATCH_COLORS = [
  '#C8860A', '#EAB04A', '#6B4420', '#3D6B30',
  '#8B6A00', '#A0522D', '#5C6830', '#D4920C'
];

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, NgChartsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private batchService = inject(BatchService);

  batches = signal<Batch[]>([]);
  alerts = signal<Alert[]>([]);
  allReadings = signal<GravityReading[]>([]);
  trendsExpanded = signal(false);

  primaryEnabled = signal(true);
  secondaryEnabled = signal(true);
  tertiaryEnabled = signal(true);

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
      !a.completed && a.dueDate != null && a.dueDate >= now && a.dueDate <= week
    ).length;
  });

  overdueAlerts = computed(() => {
    const now = new Date();
    return this.alerts().filter(a =>
      !a.completed && a.dueDate != null && a.dueDate < now
    ).length;
  });

  chartData = computed((): ChartConfiguration['data'] => {
    const filtered = this.batches().filter(b => {
      if (b.status === 'complete') return false;
      if (b.status === 'primary' && !this.primaryEnabled()) return false;
      if (b.status === 'secondary' && !this.secondaryEnabled()) return false;
      if (b.status === 'tertiary' && !this.tertiaryEnabled()) return false;
      return true;
    });

    const datasets = filtered.map((batch, i) => {
      const readings = this.allReadings()
        .filter(r => r.batchId === batch.id)
        .sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime());

      const color = BATCH_COLORS[i % BATCH_COLORS.length];

      return {
        label: batch.name,
        data: [
          { x: parseDate(batch.startDate).getTime(), y: batch.originalGravity },
          ...readings.map(r => ({ x: parseDate(r.date).getTime(), y: r.reading }))
        ],
        borderColor: color,
        backgroundColor: color + '20',
        pointBackgroundColor: color,
        pointRadius: 4,
        fill: false,
        tension: 0.3
      };
    });

    return { datasets };
  });

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' }
    },
    scales: {
      x: {
        type: 'time',
        time: { unit: 'day', displayFormats: { day: 'MMM d' } },
        ticks: { font: { size: 10 } },
        grid: { display: false }
      },
      y: {
        ticks: { font: { size: 10 } },
        grid: { color: 'rgba(0,0,0,0.05)' }
      }
    }
  };

  ngOnInit() {
    this.batchService.getBatches().subscribe(batches => {
      this.batches.set(batches);

      const ids = batches.map(b => b.id!).filter(Boolean);
      if (ids.length > 0) {
        this.batchService.getAllAlerts(ids).subscribe(a => this.alerts.set(a));
        this.batchService.getAllGravityReadings(
          batches.filter(b => b.status !== 'complete').map(b => b.id!).filter(Boolean)
        ).subscribe(readings => this.allReadings.set(readings));
      }
    });
  }
}
