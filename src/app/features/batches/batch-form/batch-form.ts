import { Component, inject, signal, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BatchService } from '../../../core/services/batch';
import { Batch } from '../../../core/models/models';
import { Location } from '@angular/common';

@Component({
  selector: 'app-batch-form',
  imports: [FormsModule, RouterLink],
  templateUrl: './batch-form.html',
  styleUrl: './batch-form.scss',
})
export class BatchForm implements OnInit {
  private batchService = inject(BatchService);
  private location = inject(Location);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  
  saving = signal(false);
  isEditing = signal(false);
  imagePreview = signal<string | null>(null);

  batch: Batch = {
    name: '',
    startDate: new Date().toISOString().split('T')[0],
    status: 'primary',
    targetAbv: 0,
    originalGravity: 0,
    currentGravity: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.isEditing.set(true);
    this.batchService.getBatchOnce(id).then(batch => {
      if (batch) {
        Object.assign(this.batch, batch);
        if (batch.imageUrl) this.imagePreview.set(batch.imageUrl);
      }
      this.cdr.markForCheck();
    });
  }

  async onImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const base64 = await this.compressImage(file);
    this.imagePreview.set(base64);
    this.batch.imageUrl = base64;
  }

  private compressImage(file: File, maxSize = 400): Promise<string> {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.onload = () => {
          const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
          const canvas = document.createElement('canvas');
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = e.target!.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

save() {
      this.saving.set(true);
      if (this.isEditing()) {
        this.batchService.updateBatch(this.batch.id!, this.batch)
          .then(() => {
            this.saving.set(false);
            this.router.navigate(['/batches', this.batch.id]);
          })
          .catch((error: any) => {
            console.error('Error updating batch:', error);
            this.saving.set(false);
          });
      } else {
        this.batch.currentGravity = this.batch.originalGravity;
        this.batchService.addBatch(this.batch)
          .then(() => {
            this.saving.set(false);
            this.location.back();
          })
          .catch((error: any) => {
            console.error('Error adding batch:', error);
            this.saving.set(false);
          });
      }
    }
}
