import { Component, OnInit } from '@angular/core';
import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  public constructor(private appService: AppService) {}

  public ngOnInit(): void {
    this.appService.watchRouterEvents();
    this.appService.watchCurrencyChange();
    this.appService.watchWebsocketStatus();
    this.appService.watchWebsocketMessage();
    this.appService.startWebSocket();
  }
}
