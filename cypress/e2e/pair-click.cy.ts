import {
  WIDGET_CHART_DEFAULT_CANDLEINTERVAL,
  WIDGET_DEPTH_DEFAULT_LIMIT,
  WIDGET_TRADES_DEFAULT_LIMIT,
} from 'src/app/shared/config';
import { createPair } from './../../src/app/shared/helpers';
import { RootPage } from './RootPage';

it('Pair click', () => {
  const rootPage = new RootPage();

  const pair = createPair({
    base: 'LTC',
    quote: 'BTC',
  });

  const status = 200;
  const loadCount = 1;

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
  rootPage.clickPair(pair.slash);

  rootPage.checkKlinesStatus(status);
  rootPage.checkKlinesLength(loadCount);

  rootPage.checkTradesStatus(status);
  rootPage.checkTradesLength(loadCount);

  rootPage.checkOrderBookStatus(status);
  rootPage.checkOrderBookLength(loadCount);

  // URL should contain clicked pair
  rootPage.urlContains(pair.underscore);
});
