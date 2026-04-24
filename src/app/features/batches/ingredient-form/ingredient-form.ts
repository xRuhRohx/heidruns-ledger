import { ChangeDetectorRef, Component, inject, signal, OnInit } from '@angular/core';
  import { ActivatedRoute, Router, RouterLink } from '@angular/router';
  import { FormsModule } from '@angular/forms';
  import { BatchService } from '../../../core/services/batch';
  import { Ingredient } from '../../../core/models/models';
  import { parseDate } from '../../../core/utils/date';

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
    private cdr = inject(ChangeDetectorRef);

    saving = signal(false);
    isEditing = signal(false);
    batchId = signal<string>('');
    ingredientId = signal<string>('');
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
      const ingredientId = this.route.snapshot.paramMap.get('ingredientId');
      if (!id) return;

      this.batchId.set(id);
      this.ingredient.batchId = id;

      if (ingredientId) {
        this.isEditing.set(true);
        this.ingredientId.set(ingredientId);
        this.batchService.getIngredientOnce(ingredientId).then(ing => {
          if (ing) {
            Object.assign(this.ingredient, ing);
            const d = parseDate(ing.addedDate);
            this.addedDateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,
  '0')}-${String(d.getDate()).padStart(2, '0')}`;
          }
          this.cdr.markForCheck();
        });
      }
    }

    save() {
      this.saving.set(true);
      const [year, month, day] = this.addedDateString.split('-').map(Number);
      this.ingredient.addedDate = new Date(year, month - 1, day);

      if (this.isEditing()) {
        this.batchService.updateIngredient(this.ingredientId(), this.ingredient)
          .then(() => {
            this.saving.set(false);
            this.router.navigate(['/batches', this.batchId()]);
          })
          .catch((error: any) => {
            console.error('Error updating ingredient:', error);
            this.saving.set(false);
          });
      } else {
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
  }