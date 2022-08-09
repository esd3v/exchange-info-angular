import { ExchangeInfo } from '../models/exchange-info.model';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ExchangeInfoService {
  constructor(private http: HttpClient) {}

  get(): Observable<ExchangeInfo> {
    return this.http.get<ExchangeInfo>('exchangeInfo');
  }
}
