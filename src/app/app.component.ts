import { Component, OnInit } from '@angular/core';
import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  public constructor(private appService: AppService) {}

  public ngOnInit(): void {
    this.appService.onRouteEvent();
    this.appService.onCurrenctChange();
    this.appService.onWebsocketOpen();
    this.appService.onWebsocketMessage();
    this.appService.startWebSocket();
  }
}
