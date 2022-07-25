import { Ticker } from './../models/ticker.model';
import { ParsedTicker } from 'src/app/models/parsed-ticker.model';
import { map, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class TickerService {
  constructor(private http: HttpClient) {}

  parseTicker({
    symbol,
    lastPrice,
    lastQty,
    priceChange,
    priceChangePercent,
    count,
  }: Ticker): ParsedTicker {
    return {
      symbol,
      lastPrice,
      lastQuantity: lastQty,
      priceChange,
      priceChangePercent,
      numberOfTrades: count,
    };
  }

  get(params: { symbol: string }): Observable<ParsedTicker> {
    return this.http
      .get<Ticker>('ticker/24hr', {
        params,
      })
      .pipe(map(this.parseTicker));
  }
}
