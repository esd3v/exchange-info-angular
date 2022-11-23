import { Component, OnInit } from '@angular/core';
import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  public constructor(private appService: AppService) {}

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
