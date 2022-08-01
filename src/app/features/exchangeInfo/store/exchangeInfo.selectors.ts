import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AppState } from '../../../store';

export const featureSelector =
  createFeatureSelector<AppState['exchangeInfo']>('exchangeInfo');

export const status = createSelector(featureSelector, (state) => {
  return state.status;
});

export const symbols = createSelector(featureSelector, (state) => {
  return state.data?.symbols;
});

export const tradingSymbols = createSelector(symbols, (state) => {
  return state?.filter((item) => item.status === 'TRADING');
});
