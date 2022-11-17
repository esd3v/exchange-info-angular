import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { globalSelectors } from 'src/app/store/global';
import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  private globalSymbol$ = this.store.select(globalSelectors.globalSymbol);

  public constructor(
    private appService: AppService,
    private store: Store<AppState>
  ) {}

  public ngOnInit(): void {
    this.appService.watchCurrencyChange();
    this.appService.loadTicker();
    this.appService.loadExchangeInfo();
    this.appService.loadOrderBook();
    this.appService.loadCandles();
    this.appService.loadTrades();
    this.appService.startWebSocket();
    this.appService.handleEmptyPair();
    this.appService.handleWebsocketStart();
    this.appService.handleWebsocketMessage();
  }
}
