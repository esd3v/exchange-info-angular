import {
  APP_DEFAULT_BASE_CURRENCY,
  APP_DEFAULT_QUOTE_CURRENCY,
} from 'src/app/shared/config';
import { createPair } from 'src/app/shared/helpers';
import { RootPage } from './RootPage';

it('Fix wrong pair parameter in url', () => {
  const rootPage = new RootPage();

  const pair = createPair(
    APP_DEFAULT_BASE_CURRENCY,
    APP_DEFAULT_QUOTE_CURRENCY
  );

  rootPage.visit('ETH_');

  // URL should contain corrected pair route
  rootPage.urlContains(pair.underscore);

  rootPage.visit('123');

  rootPage.urlContains(pair.underscore);

  rootPage.visit('.#*@][');

  rootPage.urlContains(pair.underscore);
});
