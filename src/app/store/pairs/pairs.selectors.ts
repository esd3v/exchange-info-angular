import { createFeatureSelector } from '@ngrx/store';
import { AppState } from '..';

export const featureSelector =
  createFeatureSelector<AppState['pairs']>('pairs');
