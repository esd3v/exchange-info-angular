import { createPair } from 'src/app/shared/helpers';
import {
  APP_DEFAULT_BASE_CURRENCY,
  APP_DEFAULT_QUOTE_CURRENCY,
  WIDGET_CHART_DEFAULT_CANDLEINTERVAL,
  WIDGET_DEPTH_DEFAULT_LIMIT,
  WIDGET_TRADES_DEFAULT_LIMIT,
} from '../../src/app/shared/config';
import { RootPage } from './RootPage';

const pair = createPair(APP_DEFAULT_BASE_CURRENCY, APP_DEFAULT_QUOTE_CURRENCY);
const status = 200;
const loadCount = 1;

it('App init', () => {
  const rootPage = new RootPage();

  rootPage.interceptExchangeInfo();
  rootPage.interceptTicker();

  rootPage.interceptKlines({
    interval: WIDGET_CHART_DEFAULT_CANDLEINTERVAL,
    symbol: pair.symbol,
  });

  rootPage.interceptTrades({
    symbol: pair.symbol,
    limit: WIDGET_TRADES_DEFAULT_LIMIT,
  });

  rootPage.interceptOrderBook({
    symbol: pair.symbol,
    limit: WIDGET_DEPTH_DEFAULT_LIMIT,
  });

  rootPage.visit();

  // URL should contain pair route
  cy.url().should('contain', pair.underscore);

  rootPage.checkExchangeInfoStatus(status);
  rootPage.checkExchangeInfoLength(loadCount);

  rootPage.checkTickerStatus(status);
  rootPage.checkTickerLength(loadCount);

  rootPage.checkKlinesStatus(status);
  rootPage.checkKlinesLength(loadCount);

  rootPage.checkTradesStatus(status);
  rootPage.checkTradesLength(loadCount);

  rootPage.checkOrderBookStatus(status);
  rootPage.checkOrderBookLength(loadCount);
});
