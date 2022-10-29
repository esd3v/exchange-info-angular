import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AppState } from 'src/app/store';

const featureSelector = createFeatureSelector<AppState['trades']>('trades');

export const status = createSelector(featureSelector, (state) => state.status);

export const data = createSelector(featureSelector, (state) => state.data);
