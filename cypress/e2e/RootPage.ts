import { OrderBookGetParams } from './../../src/app/features/order-book/types/order-book-get-params';
import { CandlesGetParams } from './../../src/app/features/candles/types/candles-get-params';
import { TradesGetParams } from './../../src/app/features/trades/types/trades-get-params';
import { API_HTTP_BASEURL } from 'src/app/shared/config';

type Alias = 'exchangeInfo' | 'ticker' | 'klines' | 'trades' | 'depth';

export class RootPage {
  private intercept(method: 'GET', url: string, alias: Alias) {
    cy.intercept({
      method,
      url: url,
    }).as(alias);
  }

  private checkStatus(alias: Alias, status: number) {
    cy.get(`@${alias}`).its('response.statusCode').should('eq', status);
  }

  private checkLength(alias: Alias, length: number) {
    cy.get(`@${alias}.all`).its('length').should('eq', length);
  }

  visit(params?: string) {
    cy.visit(`/${params || ''}`);
  }

  clickPair(pairSlash: string) {
    cy.get('.pairs__row').contains(pairSlash).click();
  }

  urlContains(value: string) {
    cy.url().should('contain', value);
  }

  interceptExchangeInfo() {
    const url = new URL(`${API_HTTP_BASEURL}/exchangeInfo`);

    this.intercept('GET', url.href, 'exchangeInfo');
  }

  interceptTicker() {
    const url = new URL(`${API_HTTP_BASEURL}/ticker/24hr`);

    this.intercept('GET', url.href, 'ticker');
  }

  interceptKlines({ interval, symbol }: CandlesGetParams) {
    const url = new URL(`${API_HTTP_BASEURL}/klines`);

    url.searchParams.append('interval', interval);
    url.searchParams.append('symbol', symbol);

    this.intercept('GET', url.href, 'klines');
  }

  interceptTrades({ symbol, limit }: TradesGetParams) {
    const url = new URL(`${API_HTTP_BASEURL}/trades`);

    url.searchParams.append('symbol', symbol);

    if (limit) {
      url.searchParams.append('limit', limit.toString());
    }

    this.intercept('GET', url.href, 'trades');
  }

  interceptOrderBook({ symbol, limit }: OrderBookGetParams) {
    const url = new URL(`${API_HTTP_BASEURL}/depth`);

    url.searchParams.append('symbol', symbol);

    if (limit) {
      url.searchParams.append('limit', limit.toString());
    }

    this.intercept('GET', url.href, 'depth');
  }

  checkExchangeInfoStatus(status: number) {
    this.checkStatus('exchangeInfo', status);
  }

  checkExchangeInfoLength(length: number) {
    this.checkLength('exchangeInfo', length);
  }

  checkTickerStatus(status: number) {
    this.checkStatus('ticker', status);
  }

  checkTickerLength(length: number) {
    this.checkLength('ticker', length);
  }

  checkKlinesStatus(status: number) {
    this.checkStatus('klines', status);
  }

  checkKlinesLength(length: number) {
    this.checkLength('klines', length);
  }

  checkTradesStatus(status: number) {
    this.checkStatus('trades', status);
  }

  checkTradesLength(length: number) {
    this.checkLength('trades', length);
  }

  checkOrderBookStatus(status: number) {
    this.checkStatus('depth', status);
  }

  checkOrderBookLength(length: number) {
    this.checkLength('depth', length);
  }
}
