import { createFeatureSelector, createSelector } from '@ngrx/store';
import { formatPrice } from 'src/app/shared/helpers';
import { AppState } from '../../../store';
import { globalSelectors } from '../../global/store';
import { tickerAdapter } from './ticker.state';

const featureSelector = createFeatureSelector<AppState['ticker']>('ticker');
const symbolsSelector = createFeatureSelector<AppState['symbols']>('symbols');

export const globalSelector =
  createFeatureSelector<AppState['global']>('global');

const { selectAll, selectEntities } = tickerAdapter.getSelectors();

export const globalSymbol = globalSelectors.globalSymbol;

export const tickers = createSelector(featureSelector, selectEntities);

export const allTickers = createSelector(featureSelector, selectAll);

export const status = createSelector(featureSelector, (state) => state.status);

export const currentTicker = createSelector(
  featureSelector,
  globalSymbol,
  (state, globalSymbol) => {
    return globalSymbol ? state.entities[globalSymbol] : null;
  }
);

export const lastPrice = createSelector(
  currentTicker,
  (state) => state?.lastPrice
);

export const prevLastPrice = createSelector(
  currentTicker,
  (state) => state?.prevLastPrice
);

export const priceChange = createSelector(
  currentTicker,
  (state) => state?.priceChange
);

export const priceChangePercent = createSelector(
  currentTicker,
  (state) => state?.priceChangePercent
);

export const lastQuantity = createSelector(
  currentTicker,
  (state) => state?.lastQty
);

export const tickSize = createSelector(
  symbolsSelector,
  globalSymbol,
  (state, globalSymbol) =>
    globalSymbol && state.entities[globalSymbol]?.PRICE_FILTER.tickSize
);

export const formattedLastPrice = createSelector(
  tickSize,
  lastPrice,
  (tickSize, lastPrice) =>
    tickSize && lastPrice ? formatPrice(lastPrice, tickSize) : lastPrice
);

export const numberOfTrades = createSelector(
  currentTicker,
  (state) => state?.count
);

export const loading = createSelector(
  featureSelector,
  (state) => state.status === 'loading'
);
