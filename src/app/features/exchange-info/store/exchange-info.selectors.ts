import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AppState } from 'src/app/store';

const featureSelector =
  createFeatureSelector<AppState['exchangeInfo']>('exchangeInfo');

export const status = createSelector(featureSelector, (state) => state.status);
