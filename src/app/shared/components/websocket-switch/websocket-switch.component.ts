import { Component } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { combineLatest, map, take } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { WEBSOCKET_ENABLED } from '../../config';

@Component({
  selector: 'app-websocket-switch',
  templateUrl: './websocket-switch.component.html',
  styleUrls: ['./websocket-switch.component.scss'],
})
export class WebsocketSwitchComponent {
  public checked = WEBSOCKET_ENABLED;
  private wsStatus$ = this.websocketService.status$;

  public disabled$ = this.wsStatus$.pipe(
    map((status) =>
      status === 'closing' || status === 'connecting' ? true : false
    )
  );

  public constructor(
    private websocketService: WebsocketService,
    private appService: AppService
  ) {}

  public handleChange({ checked }: MatSlideToggleChange) {
    if (checked) {
      this.wsStatus$.pipe(take(1)).subscribe((status) => {
        if (status === 'closed' || status === null) {
          this.websocketService.connect();

          // Reload widgets REST data if opened
          this.wsStatus$.subscribe((status) => {
            if (status === 'open') {
              this.appService.loadExchangeInfo();
              this.appService.loadTicker();
              this.appService.loadCandles();
              this.appService.loadOrderBook();
              this.appService.loadTrades();
            }
          });
        }
      });
    } else {
      this.wsStatus$.pipe(take(1)).subscribe((status) => {
        if (status === 'open') {
          this.websocketService.close();
        }
      });
    }
  }
}
