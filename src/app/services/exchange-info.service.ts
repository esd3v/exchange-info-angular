import { ExchangeInfoParsed } from './../models/exchange-info-parsed.model';
import { ExchangeInfo } from './../models/exchange-info.model';
import { map, mergeMap, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ExchangeInfoService {
  constructor(private http: HttpClient) {}

  parseExchangeInfo(exchangeInfo: ExchangeInfo): ExchangeInfoParsed {
    const symbols = exchangeInfo.symbols;
    const firstSymbol = symbols && symbols[0];
    const baseAsset = firstSymbol?.baseAsset;
    const quoteAsset = firstSymbol?.quoteAsset;
    const serverTime = exchangeInfo.serverTime;

    const symbolInfo = symbols.map(({ baseAsset, quoteAsset, status }) => ({
      symbol: `${baseAsset}${quoteAsset}`,
      baseAsset,
      quoteAsset,
      status,
    }));

    return {
      baseAsset,
      quoteAsset,
      serverTime,
      symbolInfo,
    };
  }

  get(): Observable<ExchangeInfoParsed> {
    return this.http
      .get<ExchangeInfo>('exchangeInfo')
      .pipe(map(this.parseExchangeInfo));
  }
}