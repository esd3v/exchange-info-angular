import { CandleInterval } from 'src/app/features/candles/models/candle-interval.model';
import { createPair } from 'src/app/shared/helpers';
import {
  API_HTTP_BASEURL,
  WIDGET_CHART_DEFAULT_CANDLEINTERVAL,
  WIDGET_DEPTH_DEFAULT_LIMIT,
  WIDGET_TRADES_DEFAULT_LIMIT,
} from '../../src/app/shared/config';

const pair = createPair('ETH', 'BTC');
const status = 200;
const loadCount = 1;
const interval: CandleInterval = WIDGET_CHART_DEFAULT_CANDLEINTERVAL;
const exchangeInfoURL = new URL(`${API_HTTP_BASEURL}/exchangeInfo`);
const tickerURL = new URL(`${API_HTTP_BASEURL}/ticker/24hr`);
const klinesURL = new URL(`${API_HTTP_BASEURL}/klines`);
const tradesURL = new URL(`${API_HTTP_BASEURL}/trades`);
const depthURL = new URL(`${API_HTTP_BASEURL}/depth`);

klinesURL.searchParams.append('interval', interval);
klinesURL.searchParams.append('symbol', pair.symbol);
depthURL.searchParams.append('symbol', pair.symbol);
depthURL.searchParams.append('limit', WIDGET_DEPTH_DEFAULT_LIMIT.toString());
tradesURL.searchParams.append('symbol', pair.symbol);

tradesURL.searchParams.append('limit', WIDGET_TRADES_DEFAULT_LIMIT.toString());

it('App init', () => {
  cy.intercept({
    method: 'GET',
    url: exchangeInfoURL.href,
  }).as('exchangeInfo');

  cy.intercept({
    method: 'GET',
    url: tickerURL.href,
  }).as('ticker');

  cy.intercept({
    method: 'GET',
    url: klinesURL.href,
  }).as('klines');

  cy.intercept({
    method: 'GET',
    url: tradesURL.href,
  }).as('trades');

  cy.intercept({
    method: 'GET',
    url: depthURL.href,
  }).as('depth');

  cy.visit('/');

  // URL should contain pair route
  cy.url().should('contain', pair.underscore);

  cy.get('@exchangeInfo').its('response.statusCode').should('eq', status);

  // Request fires only once
  cy.get('@exchangeInfo.all').its('length').should('eq', loadCount);

  cy.get('@ticker').its('response.statusCode').should('eq', status);

  // Request fires only once
  cy.get('@ticker.all').its('length').should('eq', loadCount);

  cy.get('@klines').its('response.statusCode').should('eq', status);

  // Request fires only once
  cy.get('@klines.all').its('length').should('eq', loadCount);

  cy.get('@trades').its('response.statusCode').should('eq', status);

  // Request fires only once
  cy.get('@trades.all').its('length').should('eq', loadCount);

  cy.get('@depth').its('response.statusCode').should('eq', status);

  // Request fires only once
  cy.get('@depth.all').its('length').should('eq', loadCount);
});
