import {
  APP_DEFAULT_BASE_CURRENCY,
  APP_DEFAULT_QUOTE_CURRENCY,
} from 'src/app/shared/config';
import { createPair } from 'src/app/shared/helpers';

it('Fix wrong pair parameter in url', () => {
  const pair = createPair(
    APP_DEFAULT_BASE_CURRENCY,
    APP_DEFAULT_QUOTE_CURRENCY
  );

  cy.visit('/ETH_');

  cy.url().should('contain', pair.underscore);

  cy.visit('/123');

  cy.url().should('contain', pair.underscore);

  cy.visit('/.#*@][');

  cy.url().should('contain', pair.underscore);
});
