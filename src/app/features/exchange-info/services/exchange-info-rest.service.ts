import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ExchangeInfo } from '../types/exchange-info';

@Injectable({
  providedIn: 'root',
})
export class ExchangeInfoRestService {
  public constructor(private http: HttpClient) {}

  public get$(): Observable<ExchangeInfo> {
    return this.http.get<ExchangeInfo>('exchangeInfo');
  }
}
