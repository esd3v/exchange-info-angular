import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AppState } from '..';

export const featureSelector =
  createFeatureSelector<AppState['exchangeInfo']>('exchangeInfo');

export const symbols = createSelector(featureSelector, (state) => {
  return state.data?.symbols;
});
