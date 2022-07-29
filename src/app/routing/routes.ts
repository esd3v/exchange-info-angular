import { Routes } from '@angular/router';
import { HomeComponent } from '../features/home/components/home/home.component';

export const routes: Routes = [
  {
    path: ':pair',
    component: HomeComponent,
  },
];
