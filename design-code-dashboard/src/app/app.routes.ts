import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/design-dashboard/design-dashboard.component').then(
        (m) => m.DesignDashboardComponent
      ),
  },
];
