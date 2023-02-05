import { createPair } from './../../src/app/shared/helpers';
import {
  API_HTTP_BASEURL,
  WIDGET_CHART_DEFAULT_CANDLEINTERVAL,
} from 'src/app/shared/config';
import { CandleInterval } from 'src/app/features/candles/models/candle-interval.model';

it('Pair click', () => {
  const pair = createPair('LTC', 'BTC');
  const status = 200;
  const loadCount = 1;
  const interval: CandleInterval = WIDGET_CHART_DEFAULT_CANDLEINTERVAL;
  const url = new URL(`${API_HTTP_BASEURL}/klines`);

  url.searchParams.append('interval', interval);
  url.searchParams.append('symbol', pair.symbol);

  cy.intercept({
    method: 'GET',
    url: url.href,
  }).as('klines');

  cy.visit('/');

  cy.get('.pairs__row').contains(pair.slash).click();

  cy.get('@klines').its('response.statusCode').should('eq', status);

  // Request fires only once
  cy.get('@klines.all').its('length').should('eq', loadCount);

  // URL should contain pair route
  cy.url().should('contain', pair.underscore);
});
