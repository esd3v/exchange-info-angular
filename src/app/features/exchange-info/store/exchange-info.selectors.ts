import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AppState } from '../../../store';
import { exchangeInfoAdapter } from './exchange-info.state';

const featureSelector =
  createFeatureSelector<AppState['exchangeInfo']>('exchangeInfo');

const { selectAll, selectEntities, selectIds, selectTotal } =
  exchangeInfoAdapter.getSelectors();

export const status = createSelector(featureSelector, (state) => {
  return state.status;
});

export const ids = createSelector(featureSelector, selectIds);

export const allSymbols = createSelector(featureSelector, selectAll);

export const firstSymbol = createSelector(allSymbols, (state) => state[0]);

export const symbols = createSelector(featureSelector, selectEntities);

export const tradingSymbols = createSelector(allSymbols, (state) => {
  return state?.filter((item) => item?.status === 'TRADING');
});
