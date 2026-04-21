import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'login',
        loadComponent: () => import('./features/login/login')
            .then(m => m.Login)
    },
    { path: 'dashboard', 
        loadComponent: () => import('./features/dashboard/dashboard')
            .then(m => m.Dashboard), 
        canActivate: [authGuard] 
    },
    { path: 'batches', 
        loadComponent: () => import('./features/batches/batch-list/batch-list')
            .then(m => m.BatchList), 
        canActivate: [authGuard] 
    },
    { path: 'batches/new', 
        loadComponent: () => import('./features/batches/batch-form/batch-form')
            .then(m => m.BatchForm), 
        canActivate: [authGuard] 
    },
    { path: 'batches/:id', 
        loadComponent: () => import('./features/batches/batch-detail/batch-detail')
            .then(m => m.BatchDetail), 
        canActivate: [authGuard] 
    },
    {
        path: 'batches/:id/feeding/new',
        loadComponent: () => import('./features/batches/feeding-form/feeding-form')
            .then(m => m.FeedingForm),
        canActivate: [authGuard]
    },
    {
        path: 'batches/:id/gravity/new',
        loadComponent: () => import('./features/batches/gravity-form/gravity-form')
            .then(m => m.GravityForm),
        canActivate: [authGuard]
    },
    {
        path: 'batches/:id/ingredient/new',
        loadComponent: () => import('./features/batches/ingredient-form/ingredient-form')
            .then(m => m.IngredientForm),
        canActivate: [authGuard]
    },
    { 
        path: 'batches/:id/alert/new', 
        loadComponent: () => import('./features/alerts/alert-form/alert-form')
            .then(m => m.AlertFormComponent), 
            canActivate: [authGuard] 
    },
    { path: 'gravity-log', 
        loadComponent: () => import('./features/gravity-log/gravity-list/gravity-list')
            .then(m => m.GravityList), 
        canActivate: [authGuard] 
    },
    { path: 'alerts', 
        loadComponent: () => import('./features/alerts/alert-list/alert-list')
            .then(m => m.AlertList), 
        canActivate: [authGuard] 
    },
    { path: '**', redirectTo: 'dashboard' }
];
