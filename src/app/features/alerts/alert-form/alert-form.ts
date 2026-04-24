import { ChangeDetectorRef, Component, inject, signal, OnInit } from '@angular/core';
  import { ActivatedRoute, Router, RouterLink } from '@angular/router';
  import { FormsModule } from '@angular/forms';
  import { BatchService } from '../../../core/services/batch';
  import { Alert } from '../../../core/models/models';
  import { parseDate, toDateTimeLocalString } from '../../../core/utils/date';

  @Component({
    selector: 'app-alert-form',
    imports: [FormsModule, RouterLink],
    templateUrl: './alert-form.html',
    styleUrl: './alert-form.scss',
  })
  export class AlertFormComponent implements OnInit {
    private batchService = inject(BatchService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private cdr = inject(ChangeDetectorRef);

    saving = signal(false);
    isEditing = signal(false);
    batchId = signal<string>('');
    alertId = signal<string>('');
    alertMode = signal<'date' | 'gravity'>('date');

    alert: Alert = {
      batchId: '',
      title: '',
      completed: false,
      notified: false,
      createdAt: new Date()
    };

    dueDateString = toDateTimeLocalString();

    ngOnInit() {
      const id = this.route.snapshot.paramMap.get('id');
      const alertId = this.route.snapshot.paramMap.get('alertId');
      if (!id) return;

      this.batchId.set(id);
      this.alert.batchId = id;

      if (alertId) {
        this.isEditing.set(true);
        this.alertId.set(alertId);
        this.batchService.getAlertOnce(alertId).then(a => {
          if (a) {
            Object.assign(this.alert, a);
            if (a.gravityThreshold != null && !a.dueDate) {
              this.alertMode.set('gravity');
            } else if (a.dueDate) {
              this.alertMode.set('date');
              this.dueDateString = toDateTimeLocalString(parseDate(a.dueDate));
            }
          }
          this.cdr.markForCheck();
        });
      }
    }

    setMode(mode: 'date' | 'gravity') {
      this.alertMode.set(mode);
      if (mode === 'date') {
        this.alert.gravityThreshold = undefined;
      } else {
        this.dueDateString = '';
      }
    }

    save() {
      if (!this.alert.title) return;
      if (this.alertMode() === 'date' && !this.dueDateString) return;
      if (this.alertMode() === 'gravity' && !this.alert.gravityThreshold) return;

      this.saving.set(true);

      const alertData: Partial<Alert> = { title: this.alert.title };
      if (this.alertMode() === 'date') {
        alertData.dueDate = parseDate(this.dueDateString);
      } else {
        alertData.gravityThreshold = this.alert.gravityThreshold;
      }

      if (this.isEditing()) {
        this.batchService.updateAlert(this.alertId(), alertData).then(() => {
          this.saving.set(false);
          this.router.navigate(['/batches', this.batchId()]);
        });
      } else {
        this.batchService.addAlert({
          batchId: this.batchId(),
          title: this.alert.title,
          ...(this.alertMode() === 'date' ? { dueDate: alertData.dueDate } : { gravityThreshold:
    alertData.gravityThreshold }),
          completed: false,
          notified: false,
          createdAt: new Date()
        }).then(() => {
          this.saving.set(false);
          this.router.navigate(['/batches', this.batchId()]);
        });
      }
    }
  }