import { Component, inject, signal, OnInit } from '@angular/core';
  import { ActivatedRoute, Router, RouterLink } from '@angular/router';
  import { FormsModule } from '@angular/forms';
  import { BatchService } from '../../../core/services/batch';
  import { Ingredient } from '../../../core/models/models';

  @Component({
    selector: 'app-ingredient-form',
    imports: [FormsModule, RouterLink],
    templateUrl: './ingredient-form.html',
    styleUrl: './ingredient-form.scss',
  })
  export class IngredientForm implements OnInit {
    private batchService = inject(BatchService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    saving = signal(false);
    batchId = signal<string>('');
    addedDateString = new Date().toISOString().split('T')[0];

    ingredient: Ingredient = {
      batchId: '',
      name: '',
      amount: 0,
      unit: 'lbs',
      type: 'honey',
      notes: '',
      addedDate: new Date()
    };

    ngOnInit() {
      const id = this.route.snapshot.paramMap.get('id');
      if (!id) return;
      this.batchId.set(id);
      this.ingredient.batchId = id;
    }

    save() {
      this.saving.set(true);
      const [year, month, day] = this.addedDateString.split('-').map(Number);
      this.ingredient.addedDate = new Date(year, month - 1, day);
      this.batchService.addIngredient(this.ingredient)
        .then(() => {
          this.saving.set(false);
          this.router.navigate(['/batches', this.batchId()]);
        })
        .catch((error: any) => {
          console.error('Error saving ingredient:', error);
          this.saving.set(false);
        });
    }
  }