import { Component, computed, input } from '@angular/core';
  import { NgChartsModule } from 'ng2-charts';
  import { ChartConfiguration } from 'chart.js';
  import { GravityReading } from '../../../core/models/models';
  import { parseDate } from '../../../core/utils/date';

  @Component({
    selector: 'app-gravity-chart',
    standalone: true,
    imports: [NgChartsModule],
    templateUrl: './gravity-chart.html',
    styleUrl: './gravity-chart.scss'
  })
  export class GravityChartComponent {
    readings = input<GravityReading[]>([]);
    originalGravity = input<number>(0);

    chartData = computed(() => {
      const sorted = [...this.readings()].sort((a, b) =>
        parseDate(a.date).getTime() - parseDate(b.date).getTime()
      );

      const labels = [
        'Start',
        ...sorted.map(r =>
          parseDate(r.date).toLocaleString('en-US', {
            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
          })
        )
      ];

      const data = [
        this.originalGravity(),
        ...sorted.map(r => r.reading)
      ];

      return {
        labels,
        datasets: [{
          data,
          borderColor: '#C8860A',
          backgroundColor: 'rgba(200, 134, 10, 0.1)',
          pointBackgroundColor: '#4A2C0A',
          pointRadius: 4,
          fill: true,
          tension: 0.3
        }]
      };
    });

    chartOptions: ChartConfiguration['options'] = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { ticks: { font: { size: 10 } }, grid: { color: 'rgba(0,0,0,0.05)' } },
        x: { ticks: { font: { size: 10 } }, grid: { display: false } }
      }
    };
  }
