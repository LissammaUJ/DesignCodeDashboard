import { bootstrapApplication } from '@angular/platform-browser';
import { Chart, registerables } from 'chart.js';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Required by PrimeNG p-chart (detail dialog sales charts). Not the removed /api/dashboard/charts API.
Chart.register(...registerables);

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
