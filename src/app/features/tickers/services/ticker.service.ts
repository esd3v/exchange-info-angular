import { Ticker } from '../models/ticker.model';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class TickerService {
  public constructor(private http: HttpClient) {}

  public get(): Observable<Ticker[]> {
    return this.http.get<Ticker[]>('ticker/24hr');
  }
}
