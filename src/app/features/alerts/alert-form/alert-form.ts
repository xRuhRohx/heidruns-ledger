import { Component, inject, signal } from '@angular/core';
  import { ActivatedRoute, Router, RouterLink } from '@angular/router';
  import { FormsModule } from '@angular/forms';
  import { BatchService } from '../../../core/services/batch';
  import { Alert } from '../../../core/models/models';

  @Component({
    selector: 'app-alert-form',
    imports: [FormsModule, RouterLink],
    templateUrl: './alert-form.html',
    styleUrl: './alert-form.scss',
  })
  export class AlertFormComponent {
    private batchService = inject(BatchService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    saving = signal(false);
    batchId = signal<string>('');

    alert: Alert = {
      batchId: '',
      title: '',
      dueDate: new Date(),
      completed: false,
      createdAt: new Date()
    };

    dueDateString = '';

    ngOnInit() {
      const id = this.route.snapshot.paramMap.get('id');
      if (!id) return;
      this.batchId.set(id);
      this.alert.batchId = id;
    }

    save() {
      if (!this.alert.title || !this.dueDateString) return;
      this.saving.set(true);
      this.batchService.addAlert({
        batchId: this.batchId(),
        title: this.alert.title,
        dueDate: new Date(this.dueDateString),
        completed: false,
        createdAt: new Date()
      }).then(() => {
        this.router.navigate(['/batches', this.batchId()]);
      });
    }
  }