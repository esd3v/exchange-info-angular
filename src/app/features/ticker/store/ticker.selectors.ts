import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AppState } from '../../../store';
import { symbols } from '../../exchange-info/store/exchange-info.selectors';
import { tickerAdapter } from './ticker.state';

const { selectAll, selectEntities } = tickerAdapter.getSelectors();

export const state = createFeatureSelector<AppState['ticker']>('ticker');

export const tickers = createSelector(state, selectEntities);

export const allTickers = createSelector(state, selectAll);

export const status = createSelector(state, (state) => state.status);

export const ticker = (symbol: string) =>
  createSelector(state, (state) => {
    return state.entities[symbol];
  });

export const lastPrice = (symbol: string) =>
  createSelector(ticker(symbol), (state) => state?.lastPrice);

export const prevLastPrice = (symbol: string) =>
  createSelector(ticker(symbol), (state) => state?.prevLastPrice);

export const priceChange = (symbol: string) =>
  createSelector(ticker(symbol), (state) => state?.priceChange);

export const priceChangePercent = (symbol: string) =>
  createSelector(ticker(symbol), (state) => state?.priceChangePercent);

export const lastQuantity = (symbol: string) =>
  createSelector(ticker(symbol), (state) => state?.lastQty);

export const tickSize = (symbol: string) =>
  createSelector(symbols, (state) => state[symbol]?.PRICE_FILTER.tickSize);

export const numberOfTrades = (symbol: string) =>
  createSelector(ticker(symbol), (state) => state?.count);

export const loading = createSelector(
  state,
  (state) => state.status === 'loading'
);
