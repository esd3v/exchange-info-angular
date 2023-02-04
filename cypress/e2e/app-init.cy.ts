import { API_HTTP_BASEURL } from '../../src/app/shared/config';

describe('App init', () => {
  it('Load data on app init', () => {
    const status = 200;
    const loadCount = 1;

    cy.intercept({
      method: 'GET',
      url: `${API_HTTP_BASEURL}/exchangeInfo`,
    }).as('exchangeInfo');

    cy.intercept({
      method: 'GET',
      url: `${API_HTTP_BASEURL}/ticker/24hr`,
    }).as('ticker');

    cy.intercept({
      method: 'GET',
      url: `${API_HTTP_BASEURL}/klines*`,
    }).as('klines');

    cy.intercept({
      method: 'GET',
      url: `${API_HTTP_BASEURL}/trades*`,
    }).as('trades');

    cy.intercept({
      method: 'GET',
      url: `${API_HTTP_BASEURL}/depth*`,
    }).as('depth');

    cy.visit('/');

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
});
