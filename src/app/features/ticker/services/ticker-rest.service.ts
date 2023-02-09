import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Ticker } from '../types/ticker';

@Injectable({
  providedIn: 'root',
})
export class TickerRestService {
  public constructor(private http: HttpClient) {}

  public get$(): Observable<Ticker[]> {
    return this.http.get<Ticker[]>('ticker/24hr');
  }
}
