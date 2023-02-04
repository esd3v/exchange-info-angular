import { API_HTTP_BASEURL } from 'src/app/shared/config';

describe('Pair click', () => {
  before(() => {
    cy.visit('/');
  });

  it('Pair click', () => {
    const base = 'LTC';
    const quote = 'BTC';
    const pairUnderscore = `${base}_${quote}`;
    const pairSlash = `${base}/${quote}`;
    const status = 200;
    const loadCount = 1;

    cy.intercept({
      method: 'GET',
      url: `${API_HTTP_BASEURL}/klines*`,
    }).as('klines');

    cy.get('.pairs__row').contains(pairSlash).click();

    cy.get('@klines').its('response.statusCode').should('eq', status);

    // Request fires only once
    cy.get('@klines.all').its('length').should('eq', loadCount);

    // URL should contain pair route
    cy.url().should('contain', pairUnderscore);
  });
});
